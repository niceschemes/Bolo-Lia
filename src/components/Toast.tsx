"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string | null;
  onClear?: () => void;
};

export function Toast({ message, onClear }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClear?.(), 3500);
    return () => clearTimeout(timer);
  }, [message, onClear]);

  if (!message) return null;

  const isSuccess =
    message.includes("sucesso") ||
    message.includes("atualiz") ||
    message.includes("Salvo") ||
    message.includes("Foto") ||
    message.includes("Logo") ||
    message.includes("bolsinha");

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-medium shadow-lg ${
        isSuccess
          ? "bg-emerald-600 text-white"
          : "bg-red-600 text-white"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
