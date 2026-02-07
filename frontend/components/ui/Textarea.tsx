import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', rows = 4, id, ...rest }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition-colors resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${className}`}
          {...rest}
        />
        {error && <p className="text-red-500 text-sm mt-0.5">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export default Textarea;
