"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  FaPlus,
  FaRegCalendarAlt,
  FaHistory,
  FaUtensils,
  FaBus,
  FaGamepad,
  FaEllipsisH,
  FaShoppingBag,
  FaTimes,
} from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

const MySwal = withReactContent(Swal);

export default function DashboardClient({ initialTransactions }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [formData, setFormData] = useState({
    deskripsi: "",
    tanggal: new Date().toISOString().split("T")[0],
    jumlah: "",
    kategori: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);

  useEffect(() => {
    // Detect offline status
    const handleOffline = () => {
      MySwal.fire({
        title: "Koneksi Terputus!",
        text: "Anda masih bisa melihat data lama, namun fitur transaksi membutuhkan internet.",
        icon: "warning",
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#4f46e5",
        background: "#f9fafb",
        customClass: {
          title: "text-indigo-800 font-bold",
          popup: "rounded-2xl shadow-xl",
        },
      });
    };

    const handleOnline = () => {
      MySwal.fire({
        title: "Kembali Online!",
        text: "Sinkronisasi data berhasil.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: "#4f46e5",
        background: "#f9fafb",
        customClass: {
          title: "text-indigo-800 font-bold",
          popup: "rounded-2xl shadow-xl",
        },
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

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
    
    if (!navigator.onLine) {
       MySwal.fire({
        title: "Tidak Ada Internet",
        text: "Maaf, Anda tidak dapat menyimpan transaksi saat offline.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "rounded-2xl shadow-xl",
        },
      });
      return;
    }

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
      
      // Optimistic update or refresh
      setTransactions([newTx, ...transactions]);
      setFormData({
        deskripsi: "",
        tanggal: new Date().toISOString().split("T")[0],
        jumlah: "",
        kategori: "",
      });
      setIsMobileFormOpen(false); // Close modal on success
      
      MySwal.fire({
        title: "Berhasil!",
        text: "Transaksi telah disimpan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: "#4f46e5",
      });

      router.refresh(); // Sync with server data
    } catch (error) {
      console.error(error);
      MySwal.fire({
        title: "Gagal Menyimpan",
        text: "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable Form Component
  const TransactionForm = ({ isMobile = false }) => (
    <div className={`bg-white shadow-xl shadow-indigo-100 p-6 rounded-3xl border border-gray-100 ${!isMobile && "lg:sticky lg:top-6"}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg shadow-indigo-200">
            <FaPlus className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tambah Baru</h2>
            <p className="text-xs text-gray-500">Catat pengeluaranmu</p>
          </div>
        </div>
        {isMobile && (
          <button 
            onClick={() => setIsMobileFormOpen(false)}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
            Deskripsi
          </label>
          <input
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            type="text"
            placeholder="Contoh: Nasi Goreng"
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder-gray-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
              Tanggal
            </label>
            <input
              name="tanggal"
              value={formData.tanggal}
              onChange={handleChange}
              type="date"
              className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-600"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
              Jumlah
            </label>
            <input
              name="jumlah"
              value={formData.jumlah}
              onChange={handleChange}
              type="number"
              placeholder="0"
              className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none placeholder-gray-400"
            />
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
            Kategori
          </label>
          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all mt-2 disabled:opacity-70"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Pengeluaran"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="container mx-auto px-4 mt-8 pb-24 lg:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Desktop Sidebar - Form */}
        <div className="hidden lg:block lg:col-span-1">
          <TransactionForm />
        </div>

        {/* Main Content Area - Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-xl shadow-indigo-100 p-6 rounded-3xl border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-600 rounded-xl p-3">
                  <FaRegCalendarAlt size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Ringkasan Bulan Ini
                </h3>
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button className="p-2 hover:bg-white rounded-md text-gray-500">
                  <GrFormPrevious />
                </button>
                <span className="px-4 text-sm font-semibold text-gray-700">
                  Februari 2026
                </span>
                <button className="p-2 hover:bg-white rounded-md text-gray-500">
                  <GrFormNext />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white mb-8">
              <p className="text-indigo-100 text-sm font-medium mb-1">
                Total Pengeluaran
              </p>
              <h1 className="text-4xl font-bold tracking-tight">
                Rp {totalAmount.toLocaleString("id-ID")}
              </h1>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Detail Kategori
              </h4>

              <div className="space-y-5">
                {categoryStats.map((cat, index) => (
                  <div key={index} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          {cat.icon}
                        </div>
                        <span className="font-medium text-gray-700 text-sm">
                          {cat.name}
                        </span>
                      </div>
                      <span className="font-bold text-gray-800 text-sm">
                        Rp {cat.amount.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${cat.color} transition-all duration-500 ease-out`}
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-xl shadow-indigo-100 p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 text-indigo-600 rounded-xl p-3">
                <FaHistory size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Riwayat Terakhir
              </h3>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada transaksi.</p>
              ) : (
                transactions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm border border-gray-100">
                        {getCategoryIcon(item.kategori)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {item.deskripsi || item.kategori}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {new Date(item.tanggal).toLocaleDateString("id-ID", {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-red-500">
                      - Rp {Number(item.jumlah).toLocaleString("id-ID")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setIsMobileFormOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl shadow-indigo-300 transition-all hover:scale-110 active:scale-95 z-40"
      >
        <FaPlus size={24} />
      </button>

      {/* Mobile Form Modal/Bottom Sheet */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFormOpen(false)}
          ></div>
          
          {/* Modal Content - Slides up on mobile */}
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-4 animate-in slide-in-from-bottom duration-300">
             {/* Handle bar for bottom sheet feel */}
             <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
             
             <TransactionForm isMobile={true} />
          </div>
        </div>
      )}
    </div>
  );
}
