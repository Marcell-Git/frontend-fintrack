"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoAdd, IoCreateOutline, IoTrashOutline, IoPricetagsOutline, IoCheckmark } from "react-icons/io5";
import AppShell from "@/components/ui/AppShell";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Field, { Label, FieldError, inputClass } from "@/components/ui/Field";
import { capitalize } from "@/lib/format";

const DEFAULT_COLOR = "#8E8E93";

// Palet semantic dari Figma sebagai pilihan cepat
const COLOR_PRESETS = ["#3629B7", "#5655B9", "#FF4267", "#0890FE", "#FFAF2A", "#52D5BA", "#FB6B18", "#8E8E93"];

const ManageCategoriesClient = ({ initialCategories }) => {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: "", emoji: "", color: DEFAULT_COLOR });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: "", emoji: "", color: DEFAULT_COLOR });
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
      `Hapus kategori "${capitalize(cat.name)}"? Transaksi lama tetap tersimpan.`
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

  const iconButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors active:scale-90";

  return (
    <AppShell title="Kategori">
      <p className="text-xs leading-4 font-medium text-ink">Atur kategori pengeluaran kamu sendiri</p>

      <Button onClick={openCreate} className="mt-4">
        <IoAdd size={20} />
        Tambah kategori
      </Button>

      <Alert tone="success" className="mt-4">{success}</Alert>

      {categories.length === 0 ? (
        <div className="mt-6 rounded-sheet bg-primary-4 py-14 text-center">
          <IoPricetagsOutline className="mx-auto mb-3 text-primary-3" size={32} />
          <p className="text-sm font-medium text-subtle">Belum ada kategori nih. Yuk buat satu!</p>
        </div>
      ) : (
        <ul className="mt-4">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-4 border-b border-line py-3">
              <span
                className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] text-lg leading-none"
                style={{ backgroundColor: `${cat.color}26` }}
              >
                {cat.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base leading-6 font-medium text-ink">{capitalize(cat.name)}</p>
                <p className="flex items-center gap-1.5 text-xs leading-4 font-semibold text-subtle uppercase">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.color}
                </p>
              </div>
              <div className="flex flex-none items-center">
                <button
                  onClick={() => openEdit(cat)}
                  className={`${iconButtonClass} hover:bg-primary-4 hover:text-primary`}
                  aria-label={`Edit ${cat.name}`}
                >
                  <IoCreateOutline size={20} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className={`${iconButtonClass} hover:bg-danger/10 hover:text-danger`}
                  aria-label={`Hapus ${cat.name}`}
                >
                  <IoTrashOutline size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BottomSheet
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? "Edit kategori" : "Kategori baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pb-2">
          <Alert tone="error">{errors.general}</Alert>

          <div className="flex items-center gap-4 rounded-field bg-primary-4 p-3">
            <span
              className="flex h-12 w-12 flex-none items-center justify-center rounded-[10px] bg-surface text-2xl leading-none"
              style={{ backgroundColor: `${formData.color}26` }}
            >
              {formData.emoji || "🏷️"}
            </span>
            <p className="truncate text-base font-medium text-ink">
              {formData.name ? capitalize(formData.name) : "Pratinjau kategori"}
            </p>
          </div>

          <Field
            label="Nama kategori"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Misal: Makan siang, Jajan anak..."
            error={errors.name}
          />

          <Field
            label="Emoji"
            id="emoji"
            name="emoji"
            value={formData.emoji}
            onChange={handleChange}
            type="text"
            autoComplete="off"
            placeholder="Contoh: 🍜 (dari keyboard emoji kamu)"
            error={errors.emoji}
          />

          <div>
            <Label htmlFor="color-text">Warna</Label>
            <div className="mb-3 flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((color) => {
                const isSelected = formData.color.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange({ target: { name: "color", value: color } })}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform active:scale-90 ${
                      isSelected ? "ring-2 ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color, "--tw-ring-color": color }}
                    aria-label={`Pilih warna ${color}`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <IoCheckmark size={16} />}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <input
                name="color"
                value={formData.color}
                onChange={handleChange}
                type="color"
                aria-label="Pilih warna kustom"
                className="h-11 w-11 flex-none cursor-pointer rounded-field border border-field bg-transparent p-1"
              />
              <input
                id="color-text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                type="text"
                placeholder="#FF3B30"
                className={`${inputClass(errors.color)} uppercase`}
              />
            </div>
            <FieldError>{errors.color}</FieldError>
          </div>

          <Button type="submit" loading={isSaving} loadingText="Menyimpan...">
            {editing ? "Simpan perubahan" : "Tambah kategori"}
          </Button>
        </form>
      </BottomSheet>
    </AppShell>
  );
};

export default ManageCategoriesClient;
