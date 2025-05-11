import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Przekieruj do strony logowania po pomyślnym wylogowaniu
        window.location.href = "/auth/login";
      } else {
        console.error("Błąd wylogowania");
      }
    } catch (error) {
      console.error("Błąd wylogowania:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${className}`}
    >
      {isLoading ? "Wylogowywanie..." : "Wyloguj się"}
    </button>
  );
}
