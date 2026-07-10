import { useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal({
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  placement = "top",
  backdropClassName = "",
}) {
  useEffect(() => {
    if (!closeOnEscape) return undefined;

    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeOnEscape, onClose]);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/40 px-4 py-10 backdrop-blur-sm ${
        placement === "center" ? "items-center" : "items-start pt-20"
      } ${backdropClassName}`}
      onClick={(e) => {
        e.stopPropagation();
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
