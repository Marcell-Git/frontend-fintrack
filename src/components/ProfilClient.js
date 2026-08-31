"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaKey, FaLock, FaCheckCircle, FaEnvelope } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

const ProfilClient = ({ user }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    confirmEmail: "",
  });
  const [errors, setErrors] = useState({});
  const [emailErrors, setEmailErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [tab, setTab] = useState("password");
  const [currentEmail, setCurrentEmail] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data?.user?.email) {
        setCurrentEmail(data.user.email);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (success) setSuccess("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Password lamanya diisi dulu ya!";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Password barunya mana nih?";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password minimal 6 karakter ya, biar aman!";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Ulangi password barunya dong!";
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Waduh, password barunya beda. Cek lagi ya!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    setSuccess("");

    try {
      // Ambil user yang sedang login untuk dapat email (verifikasi password lama)
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser?.email) {
        throw new Error("Gagal mendapatkan sesi. Silakan login ulang.");
      }

      // Verifikasi password lama dengan re-login internal
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: formData.oldPassword,
      });

      if (signInError) {
        throw new Error("Password lama kamu salah. Coba lagi ya!");
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        throw new Error("Gagal memperbarui password. Coba lagi nanti!");
      }

      // Perbarui cookie session dengan token terbaru
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: session.access_token }),
        }).catch(() => {});
      }

      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Yeay! Password kamu berhasil diubah. 🎉");
      router.refresh();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general:
          err.message || "Yah, ada yang salah. Coba nanti lagi ya!",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
    if (emailErrors[name]) {
      setEmailErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (emailSuccess) setEmailSuccess("");
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!emailForm.newEmail) {
      newErrors.newEmail = "Email baru diisi dulu ya!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      newErrors.newEmail = "Format emailnya kurang pas nih.";
    }

    if (!emailForm.confirmEmail) {
      newErrors.confirmEmail = "Ulangi email barunya dong!";
    } else if (emailForm.confirmEmail !== emailForm.newEmail) {
      newErrors.confirmEmail = "Emailnya beda. Cek lagi ya!";
    }

    setEmailErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsEmailLoading(true);
    setEmailErrors({});
    setEmailSuccess("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailForm.newEmail,
      });

      if (updateError) {
        throw new Error(
          "Gagal mengubah email. Pastikan kamu sudah login dan belum mengubahnya baru-baru ini."
        );
      }

      setEmailForm({ newEmail: "", confirmEmail: "" });
      setEmailSuccess(
        "Kamu akan menerima email konfirmasi untuk verifikasi. Setelah dikonfirmasi, email kamu berubah ya! ✉️"
      );
      router.refresh();
    } catch (err) {
      setEmailErrors((prev) => ({
        ...prev,
        general:
          err.message || "Yah, ada yang salah. Coba nanti lagi ya!",
      }));
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <div className="w-14 h-14 text-lg font-black glass-heavy rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
          <span className="bg-linear-to-tr from-purple-500 to-pink-500 bg-clip-text text-transparent">
            <FaKey />
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#1a1a2e] tracking-tight">
          Pengaturan Akun
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1">
          Kelola akun <span className="font-bold text-purple-600">{user?.username}</span> kamu 🔐
        </p>

        <div className="mt-6 inline-flex glass-heavy rounded-2xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              tab === "password"
                ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <FaLock />
            Ubah Password
          </button>
          <button
            type="button"
            onClick={() => setTab("email")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              tab === "email"
                ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <FaEnvelope />
            Ubah Email
          </button>
        </div>
      </div>

      {tab === "password" && (
      <div className="glass-heavy rounded-3xl shadow-lg shadow-black/5 p-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-black text-[#1a1a2e] tracking-tight">
            Ubah Password
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Ganti password untuk menjaga akun tetap aman
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="glass border-l-4 border-green-400 text-green-600 p-4 rounded text-sm mb-4 flex items-center gap-2">
              <FaCheckCircle />
              <p>{success}</p>
            </div>
          )}

          {errors.general && (
            <div className="glass border-l-4 border-red-400 text-red-500 p-4 rounded text-sm mb-4">
              <p>{errors.general}</p>
            </div>
          )}

          <div className="group relative">
            <label
              htmlFor="oldPassword"
              className="block text-sm font-medium text-gray-600 mb-1 transition-colors group-focus-within:text-purple-600"
            >
              Password Lama
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className={`block w-full pl-12 pr-5 py-4 rounded-2xl border ${errors.oldPassword ? "border-red-400/50 ring-2 ring-red-500/30" : "border-black/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-[#1a1a2e] placeholder-gray-400`}
                placeholder="Password lama kamu"
              />
            </div>
            {errors.oldPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.oldPassword}
              </p>
            )}
          </div>

          <div className="group relative">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-600 mb-1 transition-colors group-focus-within:text-purple-600"
            >
              Password Baru
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`block w-full pl-12 pr-5 py-4 rounded-2xl border ${errors.newPassword ? "border-red-400/50 ring-2 ring-red-500/30" : "border-black/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-[#1a1a2e] placeholder-gray-400`}
                placeholder="Minimal 6 karakter"
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.newPassword}
              </p>
            )}
          </div>

          <div className="group relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-600 mb-1 transition-colors group-focus-within:text-purple-600"
            >
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full pl-12 pr-5 py-4 rounded-2xl border ${errors.confirmPassword ? "border-red-400/50 ring-2 ring-red-500/30" : "border-black/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-[#1a1a2e] placeholder-gray-400`}
                placeholder="Ulangi password baru"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl shadow-purple-500/20 text-base font-bold text-white bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
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
              "Simpan Password Baru"
            )}
          </button>
        </form>
      </div>
      )}

      {tab === "email" && (
      <div className="glass-heavy rounded-3xl shadow-lg shadow-black/5 p-8">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-black text-[#1a1a2e] tracking-tight">
            Ubah Email
          </h2>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Ganti email login akun kamu
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          {emailSuccess && (
            <div className="glass border-l-4 border-green-400 text-green-600 p-4 rounded text-sm mb-4 flex items-center gap-2">
              <FaCheckCircle />
              <p>{emailSuccess}</p>
            </div>
          )}

          {emailErrors.general && (
            <div className="glass border-l-4 border-red-400 text-red-500 p-4 rounded text-sm mb-4">
              <p>{emailErrors.general}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 font-medium">
              Email saat ini:{" "}
              <span className="font-bold text-[#1a1a2e]">{currentEmail || user?.email || "—"}</span>
            </p>
          </div>

          <div className="group relative">
            <label
              htmlFor="newEmail"
              className="block text-sm font-medium text-gray-600 mb-1 transition-colors group-focus-within:text-purple-600"
            >
              Email Baru
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="newEmail"
                name="newEmail"
                value={emailForm.newEmail}
                onChange={handleEmailChange}
                className={`block w-full pl-12 pr-5 py-4 rounded-2xl border ${emailErrors.newEmail ? "border-red-400/50 ring-2 ring-red-500/30" : "border-black/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-[#1a1a2e] placeholder-gray-400`}
                placeholder="Email baru yang kamu mau"
              />
            </div>
            {emailErrors.newEmail && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {emailErrors.newEmail}
              </p>
            )}
          </div>

          <div className="group relative">
            <label
              htmlFor="confirmEmail"
              className="block text-sm font-medium text-gray-600 mb-1 transition-colors group-focus-within:text-purple-600"
            >
              Konfirmasi Email Baru
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="confirmEmail"
                name="confirmEmail"
                value={emailForm.confirmEmail}
                onChange={handleEmailChange}
                className={`block w-full pl-12 pr-5 py-4 rounded-2xl border ${emailErrors.confirmEmail ? "border-red-400/50 ring-2 ring-red-500/30" : "border-black/10 focus:ring-2 focus:ring-purple-400/50"} glass-input focus:glass-input-focus transition-all duration-300 outline-none text-base font-medium text-[#1a1a2e] placeholder-gray-400`}
                placeholder="Ulangi email baru"
              />
            </div>
            {emailErrors.confirmEmail && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {emailErrors.confirmEmail}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isEmailLoading}
            className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl shadow-purple-500/20 text-base font-bold text-white bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          >
            {isEmailLoading ? (
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
              "Simpan Email Baru"
            )}
          </button>
        </form>
      </div>
      )}
    </div>
  );
};

export default ProfilClient;
