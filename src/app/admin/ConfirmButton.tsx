'use client';

/** Submit button that asks before firing its form's server action —
 * "Sold at market" and "Delete" are one tap away from being mistakes. */
export default function ConfirmButton({
  message,
  className,
  disabled,
  children,
}: {
  message: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
