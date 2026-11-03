import "server-only";

/**
 * ЮKassa (YooKassa) online payments — https://yookassa.ru/developers
 *
 * Enabled when both YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY are set. Flow:
 *
 * 1. /api/checkout creates the order (PENDING) and calls `createPayment`;
 *    the shopper is redirected to ЮKassa's hosted payment page — card data
 *    never touches this server, so no PCI DSS scope here.
 * 2. ЮKassa redirects back to /checkout/result?order=<id>.
 * 3. ЮKassa calls /api/payments/yookassa (HTTP notification, set it up in the
 *    ЮKassa dashboard). The handler does not trust the body: it re-reads the
 *    payment by id from the API and only then marks the order PAID.
 *
 * Fiscal receipts (54-ФЗ): set YOOKASSA_SEND_RECEIPT=true when «Чеки от
 * ЮKassa» (or a connected online cash register) is enabled in the dashboard;
 * every order line is then sent as a receipt item with YOOKASSA_VAT_CODE
 * (1 = без НДС, the usual value for УСН).
 */

const API = "https://api.yookassa.ru/v3";

export function yookassaEnabled(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function authHeader(): string {
  const token = Buffer.from(
    `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`,
  ).toString("base64");
  return `Basic ${token}`;
}

/** Minor units → ЮKassa's "1234.50" string. */
export function toAmountValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

export type PaymentLine = { name: string; quantity: number; priceCents: number };

export type YooPayment = {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: { value: string; currency: string };
  metadata?: Record<string, string>;
  confirmation?: { type: string; confirmation_url?: string };
};

/** Build the request body. Pure, exported for tests. */
export function buildPaymentRequest(input: {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  email: string;
  returnUrl: string;
  lines: PaymentLine[];
  sendReceipt: boolean;
  vatCode: number;
}) {
  const body: Record<string, unknown> = {
    amount: { value: toAmountValue(input.totalCents), currency: input.currency },
    capture: true,
    confirmation: { type: "redirect", return_url: input.returnUrl },
    description: `Заказ №${input.orderNumber}`.slice(0, 128),
    metadata: { orderId: input.orderId },
  };
  if (input.sendReceipt) {
    body.receipt = {
      customer: { email: input.email },
      items: input.lines.map((l) => ({
        description: l.name.slice(0, 128),
        quantity: l.quantity.toFixed(2),
        amount: { value: toAmountValue(l.priceCents), currency: input.currency },
        vat_code: input.vatCode,
        payment_mode: "full_payment",
        payment_subject: "commodity",
      })),
    };
  }
  return body;
}

/** Create a payment and return it (with `confirmation.confirmation_url`). */
export async function createPayment(input: {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  currency: string;
  email: string;
  returnUrl: string;
  lines: PaymentLine[];
  /**
   * ЮKassa returns the same payment for a repeated key, so a double-submitted
   * request cannot create two charges. Pass a fresh suffix to start a new
   * attempt after a cancelled payment.
   */
  attempt?: string;
}): Promise<YooPayment> {
  const body = buildPaymentRequest({
    ...input,
    sendReceipt: process.env.YOOKASSA_SEND_RECEIPT === "true",
    vatCode: Number(process.env.YOOKASSA_VAT_CODE || 1),
  });
  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      "Idempotence-Key": `order-${input.orderId}${input.attempt ? `-${input.attempt}` : ""}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`YooKassa ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as YooPayment;
}

/** Read a payment by id — the source of truth for its status. */
export async function getPayment(paymentId: string): Promise<YooPayment | null> {
  const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as YooPayment;
}
