"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaRegCalendarAlt,
  FaHistory,
  FaUtensils,
  FaBus,
  FaGamepad,
  FaEllipsisH,
  FaShoppingBag,
} from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

export default function DashboardClient({ initialTransactions }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    deskripsi: "",
    tanggal: new Date().toISOString().split("T")[0],
    jumlah: "",
    kategori: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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

  // Calculate stats dynamically
  const totalAmount = transactions.reduce(
    (sum, t) => sum + Number(t.jumlah),
    0
  );

  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.kategori] = (acc[t.kategori] || 0) + Number(t.jumlah);
    return acc;
  }, {});

  const categoryColors = {
    hiburan: "bg-purple-500",
    belanja: "bg-green-500",
    transportasi: "bg-blue-500",
    makanan: "bg-orange-500",
  };

  const categoryIcons = {
    hiburan: <FaGamepad className="text-purple-500" />,
    belanja: <FaShoppingBag className="text-green-500" />,
    transportasi: <FaBus className="text-blue-500" />,
    makanan: <FaUtensils className="text-orange-500" />,
  };

  const categoryStats = Object.keys(categoryTotals)
    .map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      amount: categoryTotals[cat],
      color: categoryColors[cat] || "bg-gray-500",
      icon: categoryIcons[cat] || <FaEllipsisH className="text-gray-500" />,
      percentage: totalAmount > 0 ? (categoryTotals[cat] / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const getCategoryIcon = (category) => {
    return categoryIcons[category] || <FaEllipsisH className="text-gray-500" />;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      if (!res.ok) throw new Error("Failed to save");

      const newTx = await res.json();
      
      // Update local state if it's within the current viewed month
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
      
      router.refresh(); // Sync with server data
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white/90 backdrop-blur-md shadow-2xl shadow-indigo-100/50 p-6 md:p-8 rounded-[2rem] border border-white/50 lg:sticky lg:top-24 transition-all duration-300 hover:shadow-indigo-200/60">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-3.5 shadow-xl shadow-indigo-200 transform -rotate-3">
                <FaPlus className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tambah</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-500/60 mt-0.5">Catatan Baru</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Deskripsi
                </label>
                <input
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nasi Goreng Spesial..."
                  className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none text-gray-800 placeholder-gray-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Tanggal
                  </label>
                  <input
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    type="date"
                    className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none text-gray-600 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Jumlah (Rp)
                  </label>
                  <input
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
                    type="number"
                    placeholder="0"
                    className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none text-gray-900 font-bold placeholder-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Kategori
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 outline-none text-gray-700 font-medium appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.25rem' }}
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="makanan">🍔 Makanan</option>
                  <option value="transportasi">🚗 Transportasi</option>
                  <option value="belanja">🛒 Belanja</option>
                  <option value="hiburan">🎬 Hiburan</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative group overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all duration-300 transform active:scale-95 disabled:opacity-70"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    "Simpan Pengeluaran"
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          
          {/* Summary Card */}
          <div className="bg-white shadow-2xl shadow-indigo-100/40 p-8 md:p-10 rounded-[2.5rem] border border-gray-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 blur-3xl transition-all duration-700 group-hover:scale-110"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100/50 text-indigo-600 rounded-2xl p-4 shadow-inner">
                  <FaRegCalendarAlt size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    Ringkasan
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Statistik Transaksi</p>
                </div>
              </div>

              <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-2xl p-1.5 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <button 
                  onClick={handlePrevMonth}
                  className="p-3 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 transition-all duration-300 disabled:opacity-30"
                  disabled={isFetching}
                >
                  <GrFormPrevious className="text-xl" />
                </button>
                <span className="px-6 text-sm font-black text-gray-800 min-w-[160px] text-center uppercase tracking-tighter">
                  {currentDate.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-3 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 transition-all duration-300 disabled:opacity-30"
                  disabled={isFetching}
                >
                  <GrFormNext className="text-xl" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
              {/* Total Amount Big Card */}
              <div className="md:col-span-5 relative">
                <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-indigo-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                  <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                    Total Bulan Ini
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-medium text-indigo-200">Rp</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                      {totalAmount.toLocaleString("id-ID")}
                    </h1>
                  </div>
                  <div className="mt-8 flex items-center gap-2">
                    <div className="h-1.5 w-12 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-2/3"></div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest">
                      {transactions.length} Transaksi
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Detail */}
              <div className="md:col-span-7">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <span>Distribusi Kategori</span>
                  <div className="h-px flex-grow bg-gray-100"></div>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {categoryStats.length > 0 ? (
                    categoryStats.map((cat, index) => (
                      <div key={index} className="group/cat">
                        <div className="flex justify-between items-center mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-gray-50 p-2 rounded-lg group-hover/cat:scale-110 transition-transform duration-300">
                              {cat.icon}
                            </div>
                            <span className="font-bold text-gray-700 text-xs uppercase tracking-tight">
                              {cat.name}
                            </span>
                          </div>
                          <span className="font-black text-gray-900 text-xs">
                            {cat.percentage.toFixed(0)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-50 rounded-full h-2.5 p-0.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color} shadow-sm shadow-indigo-100 transition-all duration-1000 ease-out`}
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-1.5 ml-1">
                          Rp {cat.amount.toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-4 flex flex-col items-center justify-center text-gray-300 opacity-50 italic text-sm">
                      <FaRegCalendarAlt size={30} className="mb-2" />
                      Belum ada data bulan ini
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-white/70 backdrop-blur-sm shadow-2xl shadow-indigo-100/30 p-8 md:p-10 rounded-[2.5rem] border border-white/80">
            <div className="flex items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow-xl shadow-indigo-200 transform rotate-6">
                  <FaHistory size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    Riwayat
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Aktivitas Terakhir</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2.5 rounded-xl">
                Lihat Semua
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="bg-gray-50 p-8 rounded-full mb-4">
                    <FaHistory className="text-gray-200 text-5xl" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada transaksi di bulan ini.</p>
                  <p className="text-gray-300 text-[10px] mt-2">Mulai catat pengeluaranmu sekarang! ✨</p>
                </div>
              ) : (
                transactions.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between p-5 rounded-3xl border border-transparent hover:border-indigo-50 bg-white/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50/50 group-hover:bg-indigo-50 shadow-inner transition-colors duration-300">
                        <div className="transform group-hover:scale-125 transition-transform duration-300">
                          {getCategoryIcon(item.kategori)}
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {item.deskripsi || item.kategori}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-red-500 text-lg tracking-tight">
                        - Rp {Number(item.jumlah).toLocaleString("id-ID")}
                      </p>
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Berhasil</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
