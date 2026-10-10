"use client";

import { useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";

export default function BottomSheet({ open, onClose, title, children }) {
  // Kunci scroll body saat sheet terbuka (perbaikan iOS PWA)
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    style.overflow = "hidden";
    style.position = "fixed";
    style.width = "100%";
    return () => {
      style.overflow = "";
      style.position = "";
      style.width = "";
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] w-full max-w-md flex-col rounded-t-sheet bg-surface transition-transform duration-500 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-none justify-center pt-3">
          <div className="h-[5px] w-12 rounded-full bg-placeholder" />
        </div>

        <div className="flex flex-none items-center justify-between px-6 pt-4 pb-5">
          <h2 className="text-xl leading-7 font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-4 text-primary transition-transform active:scale-90"
            aria-label="Tutup"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6" style={{ WebkitOverflowScrolling: "touch" }}>
          {children}
          <div style={{ paddingBottom: "calc(1.5rem + var(--sab))" }} />
        </div>
      </div>
    </div>
  );
}
