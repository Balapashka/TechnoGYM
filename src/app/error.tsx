"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/layout/ErrorScreen";

/** Error boundary for every page under the root layout (header/footer stay). */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorScreen kind="crash" onRetry={reset} />;
}
