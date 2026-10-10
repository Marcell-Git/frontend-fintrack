/* eslint-disable @next/next/no-img-element */
import { formatRupiah } from "@/lib/format";

// Diadaptasi dari "Card Bank / 1" di Figma (kartu tunggal 327×204).
// Inset dalam persen berasal langsung dari frame tersebut.
export default function SpendingCard({ monthLabel, total, transactionCount, categoryCount }) {
  return (
    <div className="relative aspect-327/204 w-full">
      <div className="absolute inset-0 overflow-hidden rounded-[14px] text-white shadow-soft">
        <img src="/illustrations/card/base.svg" alt="" className="absolute inset-0 block size-full max-w-none" />
        <img src="/illustrations/card/shape-left.svg" alt="" className="absolute inset-[-12.33%_31.93%_-57.93%_-40%] block size-full max-w-none" />
        <img src="/illustrations/card/shape-right.svg" alt="" className="absolute inset-[-29.35%_-26.71%_37.38%_68.32%] block size-full max-w-none" />

        <div className="relative flex h-full flex-col px-5 pt-[6%] pb-[5%]">
          <p className="text-2xl leading-normal">{monthLabel}</p>
          <p className="mt-auto text-sm leading-4 font-medium text-white/85">Total pengeluaran</p>
          <p className="mt-1 text-base leading-6">
            {transactionCount} transaksi · {categoryCount} kategori
          </p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="truncate text-2xl leading-7 font-semibold">Rp {formatRupiah(total)}</p>
            <p className="flex-none text-base font-bold italic tracking-tight">FinTrack</p>
          </div>
        </div>
      </div>
    </div>
  );
}
