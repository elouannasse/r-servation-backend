import { useEffect, useState, useCallback } from "react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "success") {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => {
      addToastFn = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div style={containerStyle}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            ...toastStyle,
            backgroundColor: toast.type === "success" ? "#2ecc71" : "#e74c3c",
          }}
          onClick={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          }
        >
          <span style={{ marginRight: "0.5rem" }}>
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: "fixed",
  top: "1.5rem",
  right: "1.5rem",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const toastStyle: React.CSSProperties = {
  color: "white",
  padding: "0.85rem 1.25rem",
  borderRadius: "6px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  cursor: "pointer",
  fontSize: "0.95rem",
  fontWeight: 500,
  minWidth: "280px",
  animation: "slideIn 0.3s ease-out",
};
