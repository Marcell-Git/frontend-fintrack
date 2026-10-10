"use client";

import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import BottomNav from "./BottomNav";

// Layout mobile-first: header ungu + sheet putih membulat + tab bar bawah.
// Di layar lebar, aplikasi tetap tampil sebagai kolom selebar ponsel.
export default function AppShell({
  title,
  backHref,
  onBack,
  header,
  headerClassName = "",
  showNav = true,
  children,
}) {
  const backButtonClass =
    "-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 active:scale-90";

  return (
    <div className="min-h-dvh bg-primary-4">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-primary">
        <header
          className={`px-6 pb-6 text-white ${headerClassName}`}
          style={{ paddingTop: "calc(var(--sat) + 16px)" }}
        >
          {header ?? (
            <div className="flex h-[53px] items-center gap-2">
              {backHref && (
                <Link href={backHref} className={backButtonClass} aria-label="Kembali">
                  <IoChevronBack size={22} />
                </Link>
              )}
              {onBack && (
                <button type="button" onClick={onBack} className={backButtonClass} aria-label="Kembali">
                  <IoChevronBack size={22} />
                </button>
              )}
              <h1 className="text-xl leading-7 font-semibold">{title}</h1>
            </div>
          )}
        </header>

        <main
          className="flex-1 rounded-t-sheet bg-white px-6 pt-6"
          style={{
            paddingBottom: showNav
              ? "calc(72px + var(--sab) + 32px)"
              : "calc(var(--sab) + 32px)",
          }}
        >
          {children}
        </main>

        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
