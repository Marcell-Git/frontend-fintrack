"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Register = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username-nya jangan lupa diisi ya!";
    }

    if (!formData.password) {
      newErrors.password = "Password-nya mana nih?";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter ya, biar aman!";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Yah, password-nya nggak sama nih. Cek lagi yuk!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal daftar nih, coba username lain?");
      }

      // Success - redirect to login
      router.push("/login?registered=true");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "Yah backend-nya lagi ngambek. Coba nanti lagi ya!",
      }));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0c29] text-white relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="hidden sm:block absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[120px] animate-blob"></div>
      <div className="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>

      <div className="w-full sm:max-w-[440px] relative z-10 min-h-screen sm:min-h-fit flex flex-col justify-center">
        <div className="bg-white/5 backdrop-blur-2xl rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-2xl sm:shadow-black/30 p-8 sm:p-10 border-none sm:border sm:border-white/10 transition-all duration-500 min-h-screen sm:min-h-fit">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 text-xl font-black glass-heavy rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
              <span className="bg-linear-to-tr from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FT
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
              FinTrack
            </h1>
            <p className="text-white/60 text-sm font-medium px-4">
              Mulai kelola keuanganmu dengan lebih modern! ✨
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="glass border-l-4 border-red-400 text-red-300 p-4 rounded text-sm mb-4">
                <p>{errors.general}</p>
              </div>
            )}

            <div className="group relative">
              <label className="block text-sm font-medium text-white/70 mb-1 transition-colors group-focus-within:text-purple-400">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`block w-full px-5 py-4 rounded-2xl border ${errors.username ? "border-red-400/50 ring-2 ring-red-500/30" : "border-white/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-white placeholder-white/30`}
                placeholder="Username unikmu"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-400 font-medium">{errors.username}</p>
              )}
            </div>

            <div className="group relative">
              <label className="block text-sm font-medium text-white/70 mb-1 transition-colors group-focus-within:text-purple-400">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full px-5 py-4 rounded-2xl border ${errors.password ? "border-red-400/50 ring-2 ring-red-500/30" : "border-white/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-white placeholder-white/30`}
                placeholder="Minimal 6 karakter"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="group relative">
              <label className="block text-sm font-medium text-white/70 mb-1 transition-colors group-focus-within:text-purple-400">
                Ulangi Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full px-5 py-4 rounded-2xl border ${errors.confirmPassword ? "border-red-400/50 ring-2 ring-red-500/30" : "border-white/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-white placeholder-white/30`}
                placeholder="Konfirmasi password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl shadow-purple-500/20 text-base font-bold text-white bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Lagi daftar nih...</span>
                </div>
              ) : (
                "Daftar Sekarang"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-2">
            <p className="text-sm text-white/50 font-medium">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-bold text-purple-400 hover:text-purple-300 transition-colors ml-1"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 text-center text-white/30 text-xs w-full">
        © {new Date().getFullYear()} FinTrack. All rights reserved.
      </div>
    </div>
  );
};

export default Register;
