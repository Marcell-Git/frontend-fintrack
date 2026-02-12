"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Register = () => {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Detect offline status
    const handleOffline = () => {
      setIsOffline(true);
      MySwal.fire({
        title: "Koneksi Terputus!",
        text: "Pastikan device Anda terhubung ke internet",
        icon: "warning",
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#4f46e5", // Indigo-600
        background: "#f9fafb",
        customClass: {
          title: "text-indigo-800 font-bold",
          popup: "rounded-2xl shadow-xl",
        },
      });
    };

    const handleOnline = () => {
      setIsOffline(false);
      MySwal.fire({
        title: "Kembali Online!",
        text: "Silakan lanjutkan aktivitas Anda.",
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

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

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
      newErrors.username = "Username wajib diisi!";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi!";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter!";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      MySwal.fire({
        title: "Tidak Ada Internet",
        text: "Mohon periksa koneksi internet Anda untuk mendaftar.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444", // Red-500
        customClass: {
          popup: "rounded-2xl shadow-xl",
        },
      });
      return;
    }

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Small delay for UX feel
      await new Promise((resolve) => setTimeout(resolve, 500));

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
        throw new Error(data.message || "Registrasi gagal");
      }

      MySwal.fire({
        title: "Registrasi Berhasil!",
        text: "Akun Anda telah dibuat. Silakan login.",
        icon: "success",
        confirmButtonText: "Login Sekarang",
        confirmButtonColor: "#4f46e5",
        background: "#f9fafb",
        customClass: {
          popup: "rounded-2xl shadow-xl",
        },
      }).then(() => {
        router.push("/login");
      });
    } catch (err) {
      MySwal.fire({
        title: "Gagal Mendaftar",
        text: err.message || "Terjadi kesalahan saat mendaftar.",
        icon: "error",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#4f46e5",
        background: "#f9fafb",
        customClass: {
          popup: "rounded-2xl shadow-xl",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 relative z-10 transition-all duration-300 hover:shadow-cyan-500/20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 mb-2">
            FinTrack
          </h1>
          <p className="text-gray-500 text-sm">
            Daftar akun baru untuk mulai mengatur keuanganmu 🚀
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group relative">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-blue-600"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border ${errors.username ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"} bg-gray-50/50 focus:bg-white transition-all duration-200 focus:shadow-md outline-none`}
              placeholder="Contoh: user123"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.username}
              </p>
            )}
          </div>

          <div className="group relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-blue-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"} bg-gray-50/50 focus:bg-white transition-all duration-200 focus:shadow-md outline-none`}
              placeholder="Minimal 6 karakter"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          <div className="group relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-blue-600"
            >
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"} bg-gray-50/50 focus:bg-white transition-all duration-200 focus:shadow-md outline-none`}
              placeholder="Ulangi password Anda"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || isOffline}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Mendaftar...</span>
              </div>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
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
