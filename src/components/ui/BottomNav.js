"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoHomeOutline,
  IoHome,
  IoBarChartOutline,
  IoBarChart,
  IoPricetagsOutline,
  IoPricetags,
  IoSettingsOutline,
  IoSettings,
} from "react-icons/io5";

const TABS = [
  { href: "/", label: "Beranda", Icon: IoHomeOutline, ActiveIcon: IoHome },
  { href: "/statistik", label: "Statistik", Icon: IoBarChartOutline, ActiveIcon: IoBarChart },
  { href: "/kategori", label: "Kategori", Icon: IoPricetagsOutline, ActiveIcon: IoPricetags },
  { href: "/profil", label: "Akun", Icon: IoSettingsOutline, ActiveIcon: IoSettings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md bg-surface shadow-tab"
      style={{ paddingBottom: "var(--sab)" }}
    >
      <ul className="flex h-[72px] items-center justify-around px-4">
        {TABS.map(({ href, label, Icon, ActiveIcon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-9 items-center gap-2 rounded-[20px] transition-all duration-200 active:scale-95 ${
                  isActive ? "bg-primary px-4 text-white" : "px-3 text-muted hover:text-primary"
                }`}
              >
                {isActive ? <ActiveIcon size={20} /> : <Icon size={22} />}
                {isActive && <span className="text-xs leading-4">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
