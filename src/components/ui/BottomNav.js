"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IoHomeOutline,
  IoBarChartOutline,
  IoPricetagsOutline,
  IoSettingsOutline,
  IoAdd,
} from "react-icons/io5";

export const ADD_TRANSACTION_EVENT = "fintrack:add-transaction";

const TABS = [
  { href: "/", label: "Beranda", Icon: IoHomeOutline },
  { href: "/statistik", label: "Statistik", Icon: IoBarChartOutline },
  { href: "/kategori", label: "Kategori", Icon: IoPricetagsOutline },
  { href: "/profil", label: "Akun", Icon: IoSettingsOutline },
];

// Tab bar kaca mengambang + tombol bulat "tambah transaksi" di kanan
export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleAdd = () => {
    if (pathname === "/") {
      window.dispatchEvent(new Event(ADD_TRANSACTION_EVENT));
    } else {
      router.push("/?tambah=1");
    }
  };

  const renderTab = ({ href, label, Icon }) => {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <li key={href} className="h-full flex-1">
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={`flex h-full flex-col items-center justify-center gap-0.5 rounded-full border border-transparent transition-all duration-200 active:scale-95 ${
            isActive ? "glass-active text-primary" : "text-ink/60 hover:text-primary"
          }`}
        >
          <Icon size={22} />
          <span className={`text-[11px] leading-4 ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4"
      style={{ paddingBottom: "calc(var(--sab) + 12px)" }}
    >
      <ul className="glass pointer-events-auto flex h-16 items-center justify-between gap-1 rounded-full p-1.5 backdrop-blur-xl backdrop-saturate-150">
        {TABS.slice(0, 2).map(renderTab)}

        {/* Tombol tambah transaksi di tengah tab bar */}
        <li className="flex h-full flex-none items-center justify-center px-1">
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-primary text-white shadow-[0_6px_18px_rgba(54,41,183,0.4)] ring-4 ring-white/40 transition-transform active:scale-90 dark:ring-white/10"
            aria-label="Tambah transaksi"
          >
            <IoAdd size={28} />
          </button>
        </li>

        {TABS.slice(2).map(renderTab)}
      </ul>
    </nav>
  );
}
