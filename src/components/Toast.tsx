import * as React from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  open: boolean;
  onClose: () => void;
}

export function Toast({ message, type = "info", open, onClose }: ToastProps) {
  React.useEffect(() => {
    let timer: number;
    if (open) {
      timer = window.setTimeout(() => {
        onClose();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  const background = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`${background} text-white px-4 py-2 rounded shadow-md`}>{message}</div>
    </div>
  );
}
