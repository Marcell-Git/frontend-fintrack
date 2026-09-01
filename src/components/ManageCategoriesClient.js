"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaPlus,
  FaTags,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import { IoChevronBack } from "react-icons/io5";

const FALLBACK_COLOR = "#8E8E93";

const formatName = (name) =>
  name ? name.charAt(0).toUpperCase() + name.slice(1) : "";

const ManageCategoriesClient = ({ initialCategories }) => {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: "", emoji: "", color: "#8E8E93" });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", emoji: "", color: "#8E8E93" });
    setErrors({});
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormData({ name: cat.name, emoji: cat.emoji, color: cat.color });
    setErrors({});
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (success) setSuccess("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nama kategori wajib diisi ya!";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Nama terlalu panjang nih.";
    }
    if (!formData.emoji.trim()) {
      newErrors.emoji = "Emoji wajib diisi dong!";
    } else if (formData.emoji.trim().length > 10) {
      newErrors.emoji = "Emoji maksimal 10 karakter ya.";
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(formData.color)) {
      newErrors.color = "Warna harus format hex seperti #FF3B30.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name.trim(),
        emoji: formData.emoji.trim(),
        color: formData.color,
      };

      const res = editing
        ? await fetch(`/api/categories/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Yah, gagal menyimpan kategori.");
      }

      const saved = await res.json();
      const updated = editing
        ? categories.map((c) => (c.id === saved.id ? saved : c))
        : [...categories, saved];

      setCategories(updated);
      setSuccess(editing ? "Kategori berhasil diperbarui! ✏️" : "Kategori baru berhasil dibuat! 🎉");
      setIsModalOpen(false);
      router.refresh();
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const ok = window.confirm(
      `Hapus kategori "${formatName(cat.name)}"? Transaksi lama tetap tersimpan.`
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal menghapus kategori.");
      }

      setCategories(categories.filter((c) => c.id !== cat.id));
      setSuccess("Kategori berhasil dihapus. 🗑️");
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen text-[#1a1a2e] font-sans relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-purple-400/25 rounded-full blur-[150px] animate-blob"></div>
        <div className="absolute top-[15%] right-[-15%] w-[700px] h-[700px] bg-pink-400/25 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-15%] left-[15%] w-[750px] h-[750px] bg-blue-400/25 rounded-full blur-[150px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="glass-heavy p-2.5 sm:p-3 rounded-xl hover:bg-black/5 transition-all active:scale-90"
          >
            <IoChevronBack size={16} className="text-purple-500" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold leading-tight">Kelola Kategori</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Atur kategori pengeluaran kamu sendiri 🏷️
            </p>
          </div>
        </div>

        {success && (
          <div className="glass border-l-4 border-green-400 text-green-600 p-4 rounded-2xl text-sm mb-4 flex items-center gap-2">
            <FaCheckCircle />
            <p>{success}</p>
          </div>
        )}

        <div className="glass-heavy rounded-[2rem] shadow-xl shadow-black/5 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <FaTags className="text-purple-500" />
              Daftar Kategori
            </h2>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 hover:from-purple-400 hover:to-pink-400 active:scale-95 transition-all"
            >
              <FaPlus />
              Tambah
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <FaTags className="mx-auto text-3xl mb-3 opacity-40" />
              <p className="font-medium italic">Belum ada kategori nih. Yuk buat satu!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 glass rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-black/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-none"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <span className="leading-none">{cat.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1a1a2e] capitalize truncate">{formatName(cat.name)}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-3 h-3 rounded-full flex-none"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{cat.color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-none">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors active:scale-90"
                      aria-label={`Edit ${cat.name}`}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors active:scale-90"
                      aria-label={`Hapus ${cat.name}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          />
          <div
            className="relative w-full sm:max-w-md glass-heavy rounded-t-[2rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl border-t border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a1a2e]">
                {editing ? "Edit Kategori" : "Kategori Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 glass rounded-full text-gray-500 hover:bg-black/5 active:scale-90 transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="glass border-l-4 border-red-400 text-red-500 p-4 rounded-xl text-sm">
                  <p>{errors.general}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Nama Kategori
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Misal: Makan Siang, Jajan Anak..."
                  className={`w-full px-4 py-3.5 rounded-xl glass-input focus:glass-input-focus transition-all outline-none font-medium text-base text-[#1a1a2e] placeholder-gray-400 ${errors.name ? "ring-2 ring-red-500/30" : ""}`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Emoji
                </label>
                <input
                  name="emoji"
                  value={formData.emoji}
                  onChange={handleChange}
                  type="text"
                  inputMode="none"
                  autoComplete="off"
                  placeholder="Contoh: 🍜 (dari keyboard emoji kamu)"
                  className={`w-full px-4 py-3.5 rounded-xl glass-input focus:glass-input-focus transition-all outline-none font-medium text-base text-[#1a1a2e] placeholder-gray-400 ${errors.emoji ? "ring-2 ring-red-500/30" : ""}`}
                />
                {errors.emoji && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.emoji}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Warna
                </label>
                <div className="flex items-center gap-3">
                  <input
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    type="color"
                    className="w-12 h-12 rounded-xl border border-black/10 bg-transparent cursor-pointer p-1 flex-none"
                  />
                  <input
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    type="text"
                    placeholder="#FF3B30"
                    className={`w-full px-4 py-3.5 rounded-xl glass-input focus:glass-input-focus transition-all outline-none font-medium text-base text-[#1a1a2e] placeholder-gray-400 uppercase ${errors.color ? "ring-2 ring-red-500/30" : ""}`}
                  />
                </div>
                {errors.color && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.color}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl shadow-purple-500/20 text-base font-bold text-white bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? "Lagi nyimpen nih..."
                  : editing
                  ? "Simpan Perubahan"
                  : "Tambah Kategori"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategoriesClient;