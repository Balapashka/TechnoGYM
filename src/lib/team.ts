/**
 * Admin team rules (pure — unit-tested): temporary passwords for new admins
 * and who may lose admin rights.
 */

/** No look-alikes (0/O, 1/l/I) — the password is read out or retyped by hand. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

type RandomBytes = (n: number) => Uint8Array;
const cryptoBytes: RandomBytes = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n));

/**
 * A readable random password with at least one upper-case letter, one
 * lower-case letter and one digit. Rejection sampling keeps every character
 * equally likely.
 */
export function generateTempPassword(length = 12, random: RandomBytes = cryptoBytes): string {
  const limit = 256 - (256 % ALPHABET.length);
  for (;;) {
    let out = "";
    while (out.length < length) {
      for (const b of random(length * 2)) {
        if (b < limit) out += ALPHABET[b % ALPHABET.length];
        if (out.length === length) break;
      }
    }
    if (/[A-Z]/.test(out) && /[a-z]/.test(out) && /\d/.test(out)) return out;
  }
}

/**
 * Why an admin cannot be demoted, or null when it is allowed: never yourself
 * (you would lock yourself out mid-session) and never the last admin.
 */
export function adminRemovalError(opts: {
  targetId: string;
  currentUserId: string;
  targetIsAdmin: boolean;
  adminCount: number;
}): string | null {
  if (!opts.targetIsAdmin) return "Этот пользователь не администратор";
  if (opts.targetId === opts.currentUserId) return "Нельзя убрать права у самого себя";
  if (opts.adminCount <= 1) return "Должен остаться хотя бы один администратор";
  return null;
}
