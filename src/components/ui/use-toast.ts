import { toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export function useToast() {
  return {
    toast: ({ title, description, variant, duration }: ToastProps) => {
      if (variant === "destructive") {
        return toast.error(title, {
          description,
          duration,
        });
      }
      
      return toast.success(title, {
        description,
        duration,
      });
    },
  };
} 