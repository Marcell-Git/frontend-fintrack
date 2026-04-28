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
      await new Promise((resolve) => setTimeout(resolve, 800)); // Smooth UX

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 relative z-10 transition-all duration-300 hover:shadow-indigo-500/10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 mb-2">
            Gabung FinTrack
          </h1>
          <p className="text-gray-500 text-sm">
            Mulai kelola keuanganmu dengan lebih asik! ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm mb-4">
              <p>{errors.general}</p>
            </div>
          )}

          <div className="group relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-indigo-600">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border ${errors.username ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"} bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none`}
              placeholder="Pilih username unikmu"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.username}</p>
            )}
          </div>

          <div className="group relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-indigo-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"} bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none`}
              placeholder="Minimal 6 karakter ya"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
            )}
          </div>

          <div className="group relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-indigo-600">
              Ulangi Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"} bg-gray-50/50 focus:bg-white transition-all duration-200 outline-none`}
              placeholder="Ketik ulang password tadi"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 text-center text-gray-400 text-xs text-opacity-60 w-full">
        © {new Date().getFullYear()} FinTrack. All rights reserved.
      </div>
    </div>
  );
};

export default Register;
