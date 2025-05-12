import * as React from "react";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel, confirmText = "Potwierdź" }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-md p-4 max-w-sm w-full">
        <p className="text-gray-900 dark:text-gray-100">{message}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} data-testid="cancel-dialog-button">
            Anuluj
          </Button>
          <Button onClick={onConfirm} data-testid="confirm-dialog-button">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
