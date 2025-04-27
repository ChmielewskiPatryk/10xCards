import { Toaster as Sonner } from "sonner";

interface ToasterProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  closeButton?: boolean;
  richColors?: boolean;
}

export function Toaster({
  position = "bottom-right",
  closeButton = true,
  richColors = true,
  ...props
}: ToasterProps & Omit<React.ComponentProps<typeof Sonner>, keyof ToasterProps>) {
  return (
    <Sonner
      position={position}
      closeButton={closeButton}
      richColors={richColors}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-foreground",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          closeButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
} 