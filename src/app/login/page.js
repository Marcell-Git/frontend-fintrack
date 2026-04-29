"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("registered")) {
      setSuccessMessage(
        "Pendaftaran berhasil! Silakan masuk dengan akun barumu.",
      );
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      newErrors.username = "Waduh, username jangan kosong dong!";
    }

    if (!formData.password) {
      newErrors.password = "Password-nya mana nih?";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter ya, biar aman!";
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      // Success
      router.push("/");
      router.refresh();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general:
          err.message || "Yah backend-nya lagi ngambek. Coba nanti lagi ya!",
      }));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="hidden sm:block absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full sm:max-w-[440px] relative z-10 min-h-screen sm:min-h-fit flex flex-col justify-center">
        <div className="bg-white sm:bg-white/90 sm:backdrop-blur-2xl rounded-none sm:rounded-[2.5rem] shadow-none sm:shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 sm:p-10 border-none sm:border sm:border-white/40 transition-all duration-500 min-h-screen sm:min-h-fit">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 text-xl font-black bg-white border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <span className="bg-gradient-to-tr from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FT
              </span>
            </div>
            <h1 className="text-4xl font-black text-[#1C1C1E] tracking-tight mb-2">
              FinTrack
            </h1>
            <p className="text-[#8E8E93] text-sm font-medium px-4">
              Kelola keuanganmu dengan lebih modern dan asik 🚀
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded text-sm mb-4">
                <p>{successMessage}</p>
              </div>
            )}

            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm mb-4 animate-pulse">
                <p>{errors.general}</p>
              </div>
            )}

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
                className={`block w-full px-5 py-4 rounded-2xl border-none ${errors.username ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-blue-500"} bg-[#F2F2F7] focus:bg-white transition-all duration-300 outline-none text-base font-medium`}
                placeholder="Username kamu"
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
                className={`block w-full px-5 py-4 rounded-2xl border-none ${errors.password ? "ring-2 ring-red-500" : "focus:ring-2 focus:ring-blue-500"} bg-[#F2F2F7] focus:bg-white transition-all duration-300 outline-none text-base font-medium`}
                placeholder="Minimal 6 karakter"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl shadow-blue-500/20 text-base font-bold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-90 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
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
                  <span>Lagi proses nih...</span>
                </div>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-2">
            <p className="text-sm text-[#8E8E93] font-medium">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-bold text-blue-600 hover:text-blue-500 transition-colors ml-1"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
