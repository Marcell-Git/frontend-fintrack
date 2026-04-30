"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaUtensils,
  FaBus,
  FaGamepad,
  FaShoppingBag,
  FaEllipsisH,
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
    lainnya: <FaEllipsisH size={18} className="text-[#8E8E93]" />,
  };

  const categoryColors = {
    hiburan: "bg-[#AF52DE]",
    belanja: "bg-[#FF9500]",
    transportasi: "bg-[#5856D6]",
    makanan: "bg-[#FF3B30]",
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
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] font-sans pb-24 lg:pb-10">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Centered Month/Year Navigation Header */}
        <header className="flex justify-center items-center mb-10">
          <div className="flex items-center bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-2 py-1.5 rounded-full border border-white">
            <button 
              onClick={handlePrevMonth}
              className="p-3 hover:bg-[#F2F2F7] rounded-full transition-all active:scale-90"
              disabled={isFetching}
            >
              <IoChevronBack size={18} className="text-[#007AFF]" />
            </button>
            
            <div className="px-6 text-center min-w-[180px]">
              <h2 className="text-base font-bold tracking-tight text-[#1C1C1E]">
                {currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
              </h2>
            </div>

            <button 
              onClick={handleNextMonth}
              className="p-3 hover:bg-[#F2F2F7] rounded-full transition-all active:scale-90"
              disabled={isFetching}
            >
              <IoChevronForward size={18} className="text-[#007AFF]" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Apple Card Style Summary with Gradient */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2rem] shadow-2xl shadow-indigo-200/50 overflow-hidden text-white relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
              
              <div className="p-8 relative z-10">
                <p className="text-[10px] font-bold text-indigo-100/80 uppercase tracking-widest mb-2">Total Spent</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-indigo-200">Rp</span>
                  <h2 className="text-5xl font-bold tracking-tight">
                    {totalAmount.toLocaleString("id-ID")}
                  </h2>
                </div>

                <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar py-2">
                  {categoryStats.map((cat, i) => (
                    <div key={i} className="flex-none bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm">{cat.icon}</div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-100/70 uppercase leading-none mb-1">{cat.name}</p>
                        <p className="text-xs font-bold leading-none text-white">Rp{cat.amount.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Progress Bar Group */}
              <div className="bg-black/10 px-8 py-4 flex gap-1">
                {categoryStats.map((cat, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 first:rounded-l-full last:rounded-r-full ${cat.color}`} 
                    style={{ width: `${cat.percentage}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Apple Style Grouped List (History) */}
            <div>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold">Activity</h3>
              </div>
              
              <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
                {transactions.length === 0 ? (
                  <div className="py-20 text-center text-[#8E8E93]">
                    <p className="font-medium italic">No transactions yet</p>
                  </div>
                ) : (
                  <div className="">
                    {sortedDates.map((dateKey) => (
                      <div key={dateKey}>
                        <div className="bg-[#F2F2F7]/50 px-5 py-2 border-y border-[#F2F2F7] first:border-t-0 flex justify-between items-center">
                          <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">
                            {formatDateLabel(dateKey)}
                          </p>
                          <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest">
                            Total: Rp{groupedTransactions[dateKey].reduce((sum, item) => sum + Number(item.jumlah), 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="divide-y divide-[#F2F2F7]">
                          {groupedTransactions[dateKey].map((item) => (
                            <div 
                              key={item.id}
                              className="flex items-center justify-between p-5 hover:bg-[#F2F2F7]/50 transition-colors active:bg-[#F2F2F7]"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#F2F2F7] flex items-center justify-center">
                                  {categoryIcons[item.kategori] || <FaEllipsisH className="text-[#8E8E93]" />}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#1C1C1E]">{item.deskripsi || item.kategori}</p>
                                  <p className="text-[#8E8E93] text-xs font-medium capitalize">
                                    {item.kategori}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-bold text-[#FF3B30] text-sm">
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
            </div>
          </div>

          {/* Desktop Form */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-8 sticky top-8">
              <h3 className="text-xl font-bold mb-6">New Transaction</h3>
              <FormContent formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          </div>
        </div>
      </div>

      {/* iOS Style Floating Button */}
      <div className="lg:hidden fixed bottom-8 right-6 z-50">
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-14 h-14 bg-[#007AFF] text-white rounded-full shadow-lg shadow-[#007AFF]/30 flex items-center justify-center active:scale-90 transition-all"
        >
          <FaPlus size={22} />
        </button>
      </div>

      {/* iOS Style Bottom Sheet */}
      <div 
        className={`lg:hidden fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${isFormOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsFormOpen(false)}
      >
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-[#F2F2F7] rounded-t-[2.5rem] p-8 pb-12 transition-transform duration-500 ease-out transform ${isFormOpen ? "translate-y-0" : "translate-y-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 bg-[#C7C7CC] rounded-full mx-auto mb-6"></div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">New Transaction</h2>
            <button onClick={() => setIsFormOpen(false)} className="p-2 bg-[#E5E5EA] rounded-full text-[#8E8E93]">
              <IoCloseOutline size={24} />
            </button>
          </div>
          <FormContent formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const FormContent = ({ formData, handleChange, handleSubmit, isSubmitting }) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest ml-1">Description</label>
      <input
        name="deskripsi"
        value={formData.deskripsi}
        onChange={handleChange}
        type="text"
        placeholder="Coffee, Lunch, etc."
        className="w-full px-4 py-3.5 rounded-xl bg-[#F2F2F7] border-none focus:ring-2 focus:ring-[#007AFF] transition-all outline-none font-medium text-base"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest ml-1">Date</label>
        <input
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          type="date"
          className="w-full px-4 py-3.5 rounded-xl bg-[#F2F2F7] border-none focus:ring-2 focus:ring-[#007AFF] transition-all outline-none font-medium text-base"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest ml-1">Amount</label>
        <input
          name="jumlah"
          value={formData.jumlah}
          onChange={handleChange}
          type="number"
          placeholder="0"
          className="w-full px-4 py-3.5 rounded-xl bg-[#F2F2F7] border-none focus:ring-2 focus:ring-[#007AFF] transition-all outline-none font-bold text-base"
        />
      </div>
    </div>

    <div className="space-y-1">
      <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest ml-1">Category</label>
      <select
        name="kategori"
        value={formData.kategori}
        onChange={handleChange}
        className="w-full px-4 py-3.5 rounded-xl bg-[#F2F2F7] border-none focus:ring-2 focus:ring-[#007AFF] transition-all outline-none font-medium text-base appearance-none"
      >
        <option value="">Select Category</option>
        <option value="makanan">🍔 Makanan</option>
        <option value="transportasi">🚗 Transportasi</option>
        <option value="belanja">🛒 Belanja</option>
        <option value="hiburan">🎬 Hiburan</option>
        <option value="lainnya">Lainnya</option>
      </select>
    </div>

    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-[#007AFF] text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 mt-4"
    >
      {isSubmitting ? "Saving..." : "Add Transaction"}
    </button>
  </form>
);
