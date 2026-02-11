import Navbar from "@/components/Navbar";
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

export default function Home() {
  const transactions = [
    { id: 1, title: "Makan Siang", date: "2026-02-11", amount: 25000, category: "makanan" },
    { id: 2, title: "Isi Bensin", date: "2026-02-10", amount: 50000, category: "transportasi" },
    { id: 3, title: "Netflix", date: "2026-02-08", amount: 180000, category: "hiburan" },
    { id: 4, title: "Belanja", date: "2026-02-07", amount: 120000, category: "belanja" },
  ];

  const categoryStats = [
    { name: "Hiburan", amount: 180000, color: "bg-purple-500", icon: <FaGamepad className="text-purple-500"/>, percentage: 55 },
    { name: "Belanja", amount: 120000, color: "bg-green-500", icon: <FaShoppingBag className="text-green-500"/>, percentage: 23 },
    { name: "Transportasi", amount: 50000, color: "bg-blue-500", icon: <FaBus className="text-blue-500"/>, percentage: 15 },
    { name: "Makanan", amount: 25000, color: "bg-orange-500", icon: <FaUtensils className="text-orange-500"/>, percentage: 7 },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case "makanan": return <FaUtensils className="text-orange-500" />;
      case "transportasi": return <FaBus className="text-blue-500" />;
      case "hiburan": return <FaGamepad className="text-purple-500" />;
      case "belanja": return <FaShoppingBag className="text-green-500" />;
      default: return <FaEllipsisH className="text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <Navbar />
      
      <main className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl shadow-indigo-100 p-6 rounded-3xl border border-gray-100 lg:sticky lg:top-6">
              
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg shadow-indigo-200">
                  <FaPlus className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Tambah Baru</h2>
                  <p className="text-xs text-gray-500">Catat pengeluaranmu</p>
                </div>
              </div>

              <form className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Deskripsi</label>
                  <input type="text" placeholder="Contoh: Nasi Goreng" className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none placeholder-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Tanggal</label>
                    <input type="date" className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-gray-600" />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Jumlah</label>
                    <input type="number" placeholder="0" className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none placeholder-gray-400" />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Kategori</label>
                  <select className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                      <option value="">Pilih Kategori...</option>
                      <option value="makanan">🍔 Makanan</option>
                      <option value="transportasi">🚗 Transportasi</option>
                      <option value="belanja">🛒 Belanja</option>
                      <option value="hiburan">🎬 Hiburan</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all mt-2">
                  Simpan Pengeluaran
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white shadow-xl shadow-indigo-100 p-6 rounded-3xl border border-gray-100">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 text-purple-600 rounded-xl p-3">
                    <FaRegCalendarAlt size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Ringkasan Bulan Ini</h3>
                </div>
                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button className="p-2 hover:bg-white rounded-md text-gray-500"><GrFormPrevious /></button>
                  <span className="px-4 text-sm font-semibold text-gray-700">Februari 2026</span>
                  <button className="p-2 hover:bg-white rounded-md text-gray-500"><GrFormNext /></button>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white mb-8">
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Pengeluaran</p>
                <h1 className="text-4xl font-bold tracking-tight">Rp 330.000</h1>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Detail Kategori</h4>
                
                <div className="space-y-5">
                  {categoryStats.map((cat, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                            {cat.icon}
                          </div>
                          <span className="font-medium text-gray-700 text-sm">{cat.name}</span>
                        </div>
                        <span className="font-bold text-gray-800 text-sm">Rp {cat.amount.toLocaleString('id-ID')}</span>
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
                <h3 className="text-lg font-bold text-gray-800">Riwayat Terakhir</h3>
              </div>

              <div className="space-y-3">
                {transactions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm border border-gray-100">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.date}</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-500">- Rp {item.amount.toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}