"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaUtensils,
  FaBus,
  FaGamepad,
  FaShoppingBag,
  FaEllipsisH,
  FaCoffee,
  FaCalendarCheck,
  FaBox,
  FaChartPie,
} from "react-icons/fa";
import { IoCloseOutline, IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function DashboardClient({ initialTransactions }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    deskripsi: "",
    tanggal: new Date().toISOString().split("T")[0],
    jumlah: "",
    kategori: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsFormOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when bottom sheet is open (iOS fix)
  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isFormOpen]);

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

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    fetchTransactions(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    fetchTransactions(newDate);
  };

  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.jumlah), 0);

  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.kategori] = (acc[t.kategori] || 0) + Number(t.jumlah);
    return acc;
  }, {});

  const categoryIcons = {
    hiburan: <FaGamepad size={18} className="text-[#AF52DE]" />,
    belanja: <FaShoppingBag size={18} className="text-[#FF9500]" />,
    transportasi: <FaBus size={18} className="text-[#5856D6]" />,
    makanan: <FaUtensils size={18} className="text-[#FF3B30]" />,
    ngopi: <FaCoffee size={18} className="text-[#A2845E]" />,
    langganan: <FaCalendarCheck size={18} className="text-[#007AFF]" />,
    kebutuhan: <FaBox size={18} className="text-[#34C759]" />,
    lainnya: <FaEllipsisH size={18} className="text-[#8E8E93]" />,
  };

  const categoryColors = {
    hiburan: "bg-[#AF52DE]",
    belanja: "bg-[#FF9500]",
    transportasi: "bg-[#5856D6]",
    makanan: "bg-[#FF3B30]",
    ngopi: "bg-[#A2845E]",
    langganan: "bg-[#007AFF]",
    kebutuhan: "bg-[#34C759]",
    lainnya: "bg-[#8E8E93]",
  };

  const categoryStats = Object.keys(categoryTotals)
    .map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      amount: categoryTotals[cat],
      color: categoryColors[cat] || "bg-[#8E8E93]",
      icon: categoryIcons[cat] || <FaEllipsisH className="text-[#8E8E93]" />,
      percentage: totalAmount > 0 ? (categoryTotals[cat] / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const formatRupiah = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "jumlah") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
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
        setFormData({
          deskripsi: "",
          tanggal: new Date().toISOString().split("T")[0],
          jumlah: "",
          kategori: "",
        });
        setIsFormOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Grouping transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const dateKey = transaction.tanggal.split('T')[0];
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

    if (dDate === todayDate) return "Hari Ini";
    if (dDate === yesterdayDate) return "Kemarin";
    
    return d.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen text-[#1a1a2e] font-sans pb-24 lg:pb-10 relative">
      {/* Floating background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-purple-400/25 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute top-[15%] right-[-15%] w-[700px] h-[700px] bg-pink-400/25 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-15%] left-[15%] w-[750px] h-[750px] bg-blue-400/25 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        
        {/* Centered Month/Year Navigation Header */}
        <header className="flex justify-center items-center mb-10">
          <div className="flex items-center glass-heavy shadow-lg shadow-black/20 px-2 py-1.5 rounded-full">
              <button 
                onClick={handlePrevMonth}
                className="p-3 hover:bg-black/5 rounded-full transition-all active:scale-90"
                disabled={isFetching}
              >
                <IoChevronBack size={18} className="text-purple-500" />
              </button>
            
            <div className="px-6 text-center min-w-[180px]">
              <h2 className="text-base font-bold tracking-tight text-[#1a1a2e]">
                {currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              </h2>
            </div>

            <button 
                onClick={handleNextMonth}
                className="p-3 hover:bg-black/5 rounded-full transition-all active:scale-90"
                disabled={isFetching}
              >
                <IoChevronForward size={18} className="text-purple-500" />
              </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            
            {isFetching ? (
              <SkeletonSummary />
            ) : (
              <div className="glass-heavy rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden">
                <div className="p-8">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-2">Total Pengeluaran</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-purple-500">Rp</span>
                    <h2 className="text-5xl font-bold tracking-tight text-[#1a1a2e]">
                      {totalAmount.toLocaleString("id-ID")}
                    </h2>
                  </div>

                  <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar py-2">
                    {categoryStats.map((cat, i) => (
                      <div key={i} className="flex-none bg-white/30 backdrop-blur-[36px] border border-black/[0.12] px-4 py-3 rounded-2xl flex items-center gap-3">
                        <div className="glass p-1.5 rounded-lg">{cat.icon}</div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">{cat.name}</p>
                          <p className="text-xs font-bold leading-none text-[#1a1a2e]">Rp{cat.amount.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Progress Bar Group */}
                <div className="bg-black/5 px-8 py-4 flex gap-1">
                  {categoryStats.map((cat, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 first:rounded-l-full last:rounded-r-full ${cat.color}`} 
                      style={{ width: `${cat.percentage}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Glass Style Grouped List (History) */}
            <div>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-[#1a1a2e]">Aktivitas Terakhir</h3>
              </div>
              
              {isFetching ? (
                <SkeletonActivity />
              ) : (
                <div className="glass-heavy rounded-[2rem] shadow-xl shadow-black/20 overflow-hidden">
                  {transactions.length === 0 ? (
                      <div className="py-20 text-center text-gray-400">
                        <p className="font-medium italic">Belum ada transaksi nih. Yuk mulai catat!</p>
                      </div>
                  ) : (
                    <div className="">
                      {sortedDates.map((dateKey) => (
                        <div key={dateKey}>
                          <div className="bg-black/[0.02] px-5 py-2 border-y border-black/5 first:border-t-0 flex justify-between items-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              {formatDateLabel(dateKey)}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              Total: Rp{groupedTransactions[dateKey].reduce((sum, item) => sum + Number(item.jumlah), 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="divide-y divide-black/5">
                            {groupedTransactions[dateKey].map((item) => (
                              <div 
                                key={item.id}
                                className="flex items-center justify-between p-5 hover:bg-black/5 transition-colors active:bg-black/10"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                                    {categoryIcons[item.kategori] || <FaEllipsisH className="text-gray-400" />}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#1a1a2e]">{item.deskripsi || item.kategori}</p>
                                    <p className="text-gray-500 text-xs font-medium capitalize">
                                      {item.kategori}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-bold text-red-500 text-sm">
                                    -Rp{Number(item.jumlah).toLocaleString("id-ID")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Form */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="glass-heavy rounded-[2rem] shadow-xl shadow-black/5 p-8 sticky top-28">
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-6">Tambah Transaksi</h3>
              <FormContent formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} isSubmitting={isSubmitting} formatRupiah={formatRupiah} />
            </div>
          </div>
        </div>
      </div>

      {/* Glass FAB - Add Transaction (safe area aware) */}
      <div
        className="lg:hidden fixed right-6 z-50"
        style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-14 h-14 bg-linear-to-tr from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center active:scale-90 transition-all"
        >
          <FaPlus size={22} />
        </button>
      </div>

      {/* Glass FAB - Statistik (mobile only, safe area aware) */}
      <div
        className="lg:hidden fixed left-6 z-50"
        style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Link
          href="/statistik"
          className="w-14 h-14 glass-heavy text-purple-600 rounded-full shadow-lg shadow-black/5 flex items-center justify-center active:scale-90 transition-all hover:bg-black/10"
        >
          <FaChartPie size={22} />
        </Link>
      </div>

      {/* Glass Bottom Sheet — iOS PWA fixed */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ${isFormOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{
          backgroundColor: isFormOpen ? 'rgba(0,0,0,0.4)' : 'transparent',
          backdropFilter: isFormOpen ? 'blur(4px)' : 'none',
          WebkitBackdropFilter: isFormOpen ? 'blur(4px)' : 'none',
        }}
        onClick={() => setIsFormOpen(false)}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-[2.5rem] border-t border-black/10 transition-transform duration-500 ease-out ${isFormOpen ? "translate-y-0" : "translate-y-full"}`}
          style={{
            backgroundColor: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            maxHeight: '90dvh',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex-none pt-3 pb-1 flex justify-center">
            <div className="w-10 h-1 bg-black/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex-none flex justify-between items-center px-8 py-5">
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Tambah Transaksi</h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 glass rounded-full text-gray-500 hover:glass-heavy active:scale-90 transition-all"
            >
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Scrollable form content */}
          <div
            className="flex-1 overflow-y-auto px-8"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <FormContent
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              formatRupiah={formatRupiah}
            />
            {/* Bottom padding respects iPhone home indicator */}
            <div style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const SkeletonSummary = () => (
  <div className="glass-heavy rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden">
    <div className="p-8 space-y-6">
      <div className="h-3 w-24 bg-black/10 rounded-lg animate-pulse" />
      <div className="h-11 w-56 bg-black/10 rounded-xl animate-pulse" />
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 w-28 bg-black/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
    <div className="bg-black/5 px-8 py-4">
      <div className="h-1.5 w-full bg-black/10 rounded-full animate-pulse" />
    </div>
  </div>
);

const SkeletonActivity = () => (
  <div className="glass-heavy rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden">
    <div className="px-5 py-3">
      <div className="h-3 w-32 bg-black/10 rounded-lg animate-pulse" />
    </div>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-5 border-t border-black/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-black/10 rounded-lg animate-pulse" />
            <div className="h-3 w-24 bg-black/10 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="h-4 w-24 bg-black/10 rounded-lg animate-pulse" />
      </div>
    ))}
  </div>
);

const FormContent = ({ formData, handleChange, handleSubmit, isSubmitting, formatRupiah }) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categories = [
    { id: 'makanan', label: 'Makanan', icon: <FaUtensils className="text-[#FF3B30]" /> },
    { id: 'ngopi', label: 'Ngopi', icon: <FaCoffee className="text-[#A2845E]" /> },
    { id: 'kebutuhan', label: 'Kebutuhan', icon: <FaBox className="text-[#34C759]" /> },
    { id: 'transportasi', label: 'Transportasi', icon: <FaBus className="text-[#5856D6]" /> },
    { id: 'langganan', label: 'Langganan', icon: <FaCalendarCheck className="text-[#007AFF]" /> },
    { id: 'belanja', label: 'Belanja', icon: <FaShoppingBag className="text-[#FF9500]" /> },
    { id: 'hiburan', label: 'Hiburan', icon: <FaGamepad className="text-[#AF52DE]" /> },
    { id: 'lainnya', label: 'Lainnya', icon: <FaEllipsisH className="text-[#8E8E93]" /> },
  ];

  const selectedCategory = categories.find(c => c.id === formData.kategori);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-2">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Keterangan</label>
        <input
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleChange}
          type="text"
          placeholder="Ngopi, makan siang, bensin..."
          className="w-full px-4 py-3.5 rounded-xl glass-input focus:glass-input-focus transition-all outline-none font-medium text-base text-[#1a1a2e] placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Tanggal</label>
          <input
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            type="date"
            className="w-full px-4 py-3.5 rounded-xl glass-input focus:glass-input-focus transition-all outline-none font-medium text-sm text-[#1a1a2e] [color-scheme:light]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Jumlah</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 select-none">Rp</span>
            <input
              name="jumlah"
              value={formData.jumlah ? formatRupiah(formData.jumlah) : ""}
              onChange={handleChange}
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input focus:glass-input-focus transition-all outline-none font-bold text-base text-[#1a1a2e] placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Kategori</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full px-4 py-3.5 rounded-xl glass-input focus:glass-input-focus transition-all outline-none font-medium text-base text-[#1a1a2e] flex items-center justify-between"
          >
            {selectedCategory ? (
              <div className="flex items-center gap-3">
                <div className="w-5 flex justify-center">{selectedCategory.icon}</div>
                <span>{selectedCategory.label}</span>
              </div>
            ) : (
              <span className="text-gray-400">Pilih Kategori</span>
            )}
            <IoChevronForward className={`transition-transform duration-200 text-gray-400 ${isCategoryOpen ? 'rotate-90' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div className="absolute z-20 w-full bottom-full mb-2 glass-heavy rounded-2xl shadow-xl shadow-black/10 p-3 overflow-hidden">
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      handleChange({ target: { name: 'kategori', value: cat.id } });
                      setIsCategoryOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all ${
                      formData.kategori === cat.id 
                        ? 'bg-purple-50 ring-1 ring-purple-300' 
                        : 'hover:bg-black/5 active:bg-black/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
                      <div className="scale-110">{cat.icon}</div>
                    </div>
                    <span className="text-[9px] font-bold text-[#1a1a2e] text-center leading-tight">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 mt-2"
      >
        {isSubmitting ? "Lagi nyimpen nih..." : "Tambah Sekarang"}
      </button>
    </form>
  );
};
