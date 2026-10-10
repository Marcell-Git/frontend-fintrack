"use client";

import { useSyncExternalStore } from "react";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { THEME_STORAGE_KEY, THEME_COLORS } from "@/lib/theme";

// Sumber kebenaran tema = class .dark di <html> (diset juga oleh script di layout)
const subscribe = (onChange) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};
const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => null;

function applyTheme(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark ? THEME_COLORS.dark : THEME_COLORS.light);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  } catch {}
}

export default function ThemeToggle() {
  // null saat render server, supaya tidak terjadi hydration mismatch
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => applyTheme(!isDark)}
      className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 active:scale-90"
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
    >
      <span className={isDark === null ? "opacity-0" : "opacity-100 transition-opacity"}>
        {isDark ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
      </span>
    </button>
  );
}
