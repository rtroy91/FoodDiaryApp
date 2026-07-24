import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function Modal({
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
  placement = "top",
  backdropClassName = "",
  ariaLabel = "Dialog",
  ariaLabelledBy,
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function onKey(event) {
      if (event.key === "Escape" && closeOnEscape) {
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocused?.focus();
    };
  }, [closeOnEscape]);

  function handleBackdropClick(event) {
    event.stopPropagation();
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onCloseRef.current?.();
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex overflow-y-auto overscroll-contain bg-black/40 px-4 backdrop-blur-sm ${
        placement === "center" ? "items-center py-6 sm:py-8" : "items-start pb-6 pt-16 sm:pt-20"
      } ${backdropClassName}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className="w-full focus-visible:outline-none"
        onClick={handleBackdropClick}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
