interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({
  message,
  className = "",
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm ${className}`}
    >
      {message}
    </div>
  );
}
