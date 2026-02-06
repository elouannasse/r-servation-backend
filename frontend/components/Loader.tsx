interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  fullPage?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

export default function Loader({
  size = "md",
  className = "",
  text,
  fullPage = false,
}: LoaderProps) {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-gray-200 border-t-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {spinner}
        {text && <p className="text-gray-500 mt-3 text-sm">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center gap-3">
        {spinner}
        {text && <p className="text-gray-500 text-sm">{text}</p>}
      </div>
    </div>
  );
}

/** Inline spinner for use inside buttons */
export function ButtonSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2 ${className}`}
    />
  );
}
