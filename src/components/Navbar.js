"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaSignOutAlt, FaChartPie } from "react-icons/fa";

const Navbar = ({ user }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="text-sm font-black glass-heavy rounded-xl p-2.5 transition-transform group-hover:scale-110 duration-200 leading-none flex items-center justify-center w-10 h-10">
            <span className="bg-linear-to-tr from-purple-400 to-pink-400 bg-clip-text text-transparent">FT</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            Fin<span className="text-purple-400">Track</span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-1 ml-4">
          <Link
            href="/"
            className="px-3 py-2 text-sm font-semibold text-white/50 hover:text-purple-400 transition-colors rounded-lg hover:bg-white/5"
          >
            Dashboard
          </Link>
          <Link
            href="/statistik"
            className="px-3 py-2 text-sm font-semibold text-purple-400 transition-colors rounded-lg bg-white/5 flex items-center gap-1.5"
          >
            <FaChartPie size={14} />
            Statistik
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4 relative">
          
          {/* User Profile Button */}
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 md:gap-3 glass rounded-full p-1.5 pr-3 md:pr-4 transition-all duration-200 cursor-pointer hover:glass-heavy"
          >
            <div className="glass-heavy p-2 rounded-full text-purple-300">
              <FaUser size={14} />
            </div>
            <p className="font-semibold text-sm text-white/80">
              {user?.username || "Pengguna"}
            </p>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-48 glass-heavy rounded-2xl shadow-2xl shadow-black/30 border border-white/10 py-2 z-20 overflow-hidden">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <FaSignOutAlt className="text-lg" />
                  Logout
                </button>
              </div>
            </>
          )}

          <div className="h-6 w-px bg-white/10 hidden md:block"></div>

          <button 
            onClick={handleLogout}
            className="hidden md:flex group items-center gap-2 text-white/50 hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-red-500/20"
          >
            <FaSignOutAlt className="text-lg group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
          
        </div>
      </div>
    </nav>
  );
};


export default Navbar;


