"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import { IoChevronBack, IoChevronForward, IoArrowForward } from "react-icons/io5";
import AppShell from "@/components/ui/AppShell";
import BottomSheet from "@/components/ui/BottomSheet";
import { ADD_TRANSACTION_EVENT } from "@/components/ui/BottomNav";
import Button from "@/components/ui/Button";
import Field, { Label } from "@/components/ui/Field";
import SpendingCard from "@/components/SpendingCard";
import { formatRupiah, capitalize, greetingName } from "@/lib/format";

const FALLBACK_COLOR = "#8E8E93";
const MAX_CATEGORY_TILES = 6;

const emptyForm = () => ({
  deskripsi: "",
  tanggal: new Date().toISOString().split("T")[0],
  jumlah: "",
  kategori: "",
});

export default function DashboardClient({ user, initialTransactions, initialCategories, openFormOnLoad = false }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [categories] = useState(initialCategories || []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(openFormOnLoad);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Tombol "+" di tab bar membuka form tambah transaksi
  useEffect(() => {
    const open = () => setIsFormOpen(true);
    window.addEventListener(ADD_TRANSACTION_EVENT, open);
    return () => window.removeEventListener(ADD_TRANSACTION_EVENT, open);
  }, []);

  // Datang dari halaman lain lewat /?tambah=1 — bersihkan URL agar refresh tidak membuka form lagi
  useEffect(() => {
    if (openFormOnLoad) router.replace("/", { scroll: false });
  }, [openFormOnLoad, router]);

  const fetchTransactions = async (date) => {
    setIsFetching(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const res = await fetch(`/api/pengeluaran?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
    fetchTransactions(newDate);
  };

  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.jumlah), 0);

  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.kategori] = (acc[t.kategori] || 0) + Number(t.jumlah);
    return acc;
  }, {});

  const categoryMap = categories.reduce((acc, c) => {
    acc[c.name] = c;
    return acc;
  }, {});

  const categoryStats = Object.keys(categoryTotals)
    .map((cat) => ({
      name: capitalize(categoryMap[cat]?.name || cat),
      emoji: categoryMap[cat]?.emoji || "➕",
      color: categoryMap[cat]?.color || FALLBACK_COLOR,
      amount: categoryTotals[cat],
    }))
    .sort((a, b) => b.amount - a.amount);

  const hasMoreCategories = categoryStats.length > MAX_CATEGORY_TILES;
  const visibleCategoryStats = hasMoreCategories
    ? categoryStats.slice(0, MAX_CATEGORY_TILES - 1)
    : categoryStats;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "jumlah") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jumlah || !formData.kategori || !formData.tanggal) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pengeluaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newTx = await res.json();
        const txDate = new Date(newTx.tanggal);
        if (
          txDate.getMonth() === currentDate.getMonth() &&
          txDate.getFullYear() === currentDate.getFullYear()
        ) {
          setTransactions([newTx, ...transactions]);
        }
        setFormData(emptyForm());
        setIsFormOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm("Yakin ingin menghapus pengeluaran ini?")) return;

    try {
      const res = await fetch(`/api/pengeluaran/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTransactions(transactions.filter((t) => t.id !== id));
        router.refresh();
      } else {
        alert("Gagal menghapus data");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus data");
    }
  };

  // Grouping transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = transaction.tanggal.split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();

    if (dDate === todayDate) return "Hari ini";
    if (dDate === yesterdayDate) return "Kemarin";

    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const monthLabel = currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const header = (
    <div className="flex h-[53px] items-center gap-4">
      <div className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-full bg-white/15 text-xl font-semibold ring-2 ring-white/30">
        {greetingName(user).charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-xs leading-4 text-white/70">Selamat datang,</p>
        <p className="truncate text-base leading-6 font-medium">Hai, {greetingName(user)}</p>
      </div>
    </div>
  );

  return (
    <AppShell header={header}>
      {/* Navigasi bulan */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          disabled={isFetching}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-4 text-primary transition-transform active:scale-90 disabled:opacity-50"
          aria-label="Bulan sebelumnya"
        >
          <IoChevronBack size={18} />
        </button>
        <h2 className="text-base leading-6 font-semibold text-ink capitalize">{monthLabel}</h2>
        <button
          onClick={() => changeMonth(1)}
          disabled={isFetching}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-4 text-primary transition-transform active:scale-90 disabled:opacity-50"
          aria-label="Bulan berikutnya"
        >
          <IoChevronForward size={18} />
        </button>
      </div>

      {isFetching ? (
        <div className="aspect-327/204 w-full animate-pulse rounded-[14px] bg-primary-4" />
      ) : (
        <SpendingCard
          monthLabel={currentDate.toLocaleDateString("id-ID", { month: "long" })}
          total={totalAmount}
          transactionCount={transactions.length}
          categoryCount={categoryStats.length}
        />
      )}

      {/* Ringkasan per kategori — grid tile ala "Category" di Figma */}
      {!isFetching && categoryStats.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base leading-6 font-semibold text-ink">Per kategori</h3>
            <Link href="/statistik" className="text-xs leading-4 font-semibold text-primary">
              Lihat statistik
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {visibleCategoryStats.map((cat) => (
              <div
                key={cat.name}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-field bg-card px-2 text-center shadow-card"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] text-lg leading-none"
                  style={{ backgroundColor: `${cat.color}26` }}
                >
                  {cat.emoji}
                </span>
                <p className="w-full truncate text-xs leading-4 font-medium text-subtle">{cat.name}</p>
                <p className="w-full truncate text-xs leading-4 font-semibold text-ink">
                  Rp{formatRupiah(cat.amount)}
                </p>
              </div>
            ))}
            {hasMoreCategories && (
              <Link
                href="/statistik"
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-field bg-card text-center shadow-card"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-4 text-primary">
                  <IoArrowForward size={18} />
                </span>
                <p className="text-xs leading-4 font-medium text-subtle">
                  +{categoryStats.length - visibleCategoryStats.length} lainnya
                </p>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Riwayat transaksi — "Row / Transaction" di Figma */}
      <section className="mt-8">
        <h3 className="text-base leading-6 font-semibold text-ink">Riwayat transaksi</h3>

        {isFetching ? (
          <SkeletonActivity />
        ) : transactions.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-medium text-subtle">Belum ada transaksi nih. Yuk mulai catat!</p>
          </div>
        ) : (
          sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <div className="mt-6 mb-1 flex items-center justify-between">
                <p className="text-xs leading-4 font-semibold text-subtle">{formatDateLabel(dateKey)}</p>
                <p className="text-xs leading-4 font-semibold text-subtle">
                  Rp{formatRupiah(groupedTransactions[dateKey].reduce((sum, item) => sum + Number(item.jumlah), 0))}
                </p>
              </div>
              {groupedTransactions[dateKey].map((item) => (
                <SwipeableItem
                  key={item.id}
                  item={item}
                  categoryMap={categoryMap}
                  onDelete={handleDeleteTransaction}
                />
              ))}
            </div>
          ))
        )}

        {transactions.length > 0 && !isFetching && (
          <p className="mt-4 text-center text-xs text-placeholder">Geser item ke kanan untuk menghapus</p>
        )}
      </section>

      <BottomSheet open={isFormOpen} onClose={() => setIsFormOpen(false)} title="Tambah transaksi">
        <FormContent
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          categories={categories}
        />
      </BottomSheet>
    </AppShell>
  );
}

const SkeletonActivity = () => (
  <div className="mt-6 space-y-5">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-[10px] bg-primary-4" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 animate-pulse rounded-lg bg-primary-4" />
          <div className="h-3 w-20 animate-pulse rounded-lg bg-primary-4" />
        </div>
        <div className="h-4 w-20 animate-pulse rounded-lg bg-primary-4" />
      </div>
    ))}
  </div>
);

const SwipeableItem = ({ item, categoryMap, onDelete }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeThreshold = 50;
  const maxSwipe = 80;

  const cat = categoryMap[item.kategori];
  const emoji = cat?.emoji || "➕";
  const color = cat?.color || FALLBACK_COLOR;

  const startSwipe = (x) => {
    setStartX(x);
    setIsSwiping(true);
  };

  const moveSwipe = (x) => {
    if (!isSwiping) return;
    const diff = x - startX;
    setSwipeOffset(diff > 0 ? Math.min(diff, maxSwipe) : 0);
  };

  const endSwipe = () => {
    setIsSwiping(false);
    setSwipeOffset(swipeOffset > swipeThreshold ? maxSwipe : 0);
  };

  const transition = isSwiping ? "none" : "transform 0.3s ease-out";

  return (
    <div className="relative overflow-hidden border-b border-line">
      <div
        className="absolute inset-y-0 left-0 flex items-center justify-center rounded-r-field bg-danger text-white"
        style={{ width: `${maxSwipe}px`, transform: `translateX(${swipeOffset - maxSwipe}px)`, transition }}
      >
        <button
          onClick={() => {
            onDelete(item.id);
            setSwipeOffset(0);
          }}
          className="flex h-full w-full items-center justify-center"
          aria-label="Hapus transaksi"
        >
          <FaTrash size={16} />
        </button>
      </div>

      <div
        className="flex cursor-grab items-center gap-4 bg-surface py-3 select-none active:cursor-grabbing"
        style={{ transform: `translateX(${swipeOffset}px)`, transition }}
        onTouchStart={(e) => startSwipe(e.touches[0].clientX)}
        onTouchMove={(e) => moveSwipe(e.touches[0].clientX)}
        onTouchEnd={endSwipe}
        onMouseDown={(e) => startSwipe(e.clientX)}
        onMouseMove={(e) => moveSwipe(e.clientX)}
        onMouseUp={endSwipe}
        onMouseLeave={() => isSwiping && endSwipe()}
      >
        <div
          className="pointer-events-none flex h-10 w-10 flex-none items-center justify-center rounded-[10px] text-lg leading-none"
          style={{ backgroundColor: `${color}26` }}
        >
          {emoji}
        </div>
        <div className="pointer-events-none min-w-0 flex-1">
          <p className="truncate text-base leading-6 font-medium text-ink">{item.deskripsi || capitalize(item.kategori)}</p>
          <p className="text-xs leading-4 font-semibold text-subtle capitalize">{item.kategori}</p>
        </div>
        <p className="pointer-events-none flex-none text-base leading-6 font-semibold text-danger">
          - Rp{formatRupiah(item.jumlah)}
        </p>
      </div>
    </div>
  );
};

const FormContent = ({ formData, handleChange, handleSubmit, isSubmitting, categories }) => {
  const isIncomplete = !formData.jumlah || !formData.kategori || !formData.tanggal;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-2">
      <Field
        label="Jumlah"
        id="jumlah"
        name="jumlah"
        prefix="Rp"
        value={formData.jumlah ? formatRupiah(formData.jumlah) : ""}
        onChange={handleChange}
        type="text"
        inputMode="numeric"
        placeholder="0"
        className="text-base font-semibold"
      />

      <Field
        label="Keterangan"
        id="deskripsi"
        name="deskripsi"
        value={formData.deskripsi}
        onChange={handleChange}
        type="text"
        placeholder="Ngopi, makan siang, bensin..."
      />

      <Field
        label="Tanggal"
        id="tanggal"
        name="tanggal"
        value={formData.tanggal}
        onChange={handleChange}
        type="date"
        className="scheme-light dark:scheme-dark"
      />

      <div>
        <Label>Kategori</Label>
        {categories.length === 0 ? (
          <Link
            href="/kategori"
            className="block rounded-field border border-dashed border-field px-4 py-4 text-center text-sm font-medium text-primary"
          >
            Belum ada kategori. Buat kategori dulu →
          </Link>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => {
              const isSelected = formData.kategori === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleChange({ target: { name: "kategori", value: cat.name } })}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center gap-1.5 rounded-field px-1 py-2.5 transition-all ${
                    isSelected ? "bg-primary-4 ring-2 ring-primary" : "bg-surface ring-1 ring-line active:bg-primary-4"
                  }`}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] text-base leading-none"
                    style={{ backgroundColor: `${cat.color}26` }}
                  >
                    {cat.emoji}
                  </span>
                  <span className={`w-full truncate text-center text-[11px] leading-tight font-medium capitalize ${isSelected ? "text-primary" : "text-ink"}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isIncomplete} loading={isSubmitting} loadingText="Menyimpan..." className="mt-2">
        Simpan transaksi
      </Button>
    </form>
  );
};
