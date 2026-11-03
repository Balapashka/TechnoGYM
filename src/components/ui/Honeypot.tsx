import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Anti-spam trap: an input real visitors never see or fill. Spam bots fill
 * every field, and the API silently drops such submissions. Hidden from
 * screen readers and skipped by keyboard navigation and autofill.
 */
export function Honeypot({ registration }: { registration: UseFormRegisterReturn }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...registration} />
      </label>
    </div>
  );
}
