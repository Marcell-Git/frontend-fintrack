"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoChevronForward } from "react-icons/io5";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/ui/AppShell";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import { greetingName, USERNAME_MAX_LENGTH } from "@/lib/format";

const VIEW_TITLES = {
  username: "Ubah username",
  password: "Ubah password",
  email: "Ubah email",
};

// Baris menu sesuai "Row / Infomation" di Figma
const rowClass = "flex h-[52px] w-full items-center justify-between gap-3 border-b border-line text-left";

const ProfilClient = ({ user }) => {
  const router = useRouter();
  const [view, setView] = useState(null);
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
  const [currentEmail, setCurrentEmail] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [usernameInput, setUsernameInput] = useState(user?.username || "");
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);

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

  const email = currentEmail || user?.email || "";

  const openUsernameView = () => {
    setUsernameInput(username);
    setUsernameError("");
    setUsernameSuccess("");
    setView("username");
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();

    if (!trimmed) {
      setUsernameError("Username-nya diisi dulu ya!");
      return;
    }
    if (trimmed.length > USERNAME_MAX_LENGTH) {
      setUsernameError(`Username maksimal ${USERNAME_MAX_LENGTH} karakter ya.`);
      return;
    }

    setIsUsernameLoading(true);
    setUsernameError("");
    setUsernameSuccess("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal menyimpan username. Coba lagi ya!");
      }

      const updated = await res.json();
      setUsername(updated.username || trimmed);
      setUsernameInput(updated.username || trimmed);
      setUsernameSuccess("Username berhasil disimpan! 🎉");
      router.refresh();
    } catch (err) {
      setUsernameError(err.message);
    } finally {
      setIsUsernameLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

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

  if (view === "username") {
    return (
      <AppShell title={VIEW_TITLES.username} onBack={() => setView(null)}>
        <p className="mb-6 text-xs leading-4 font-medium text-ink">
          Nama ini dipakai untuk sapaan di halaman Beranda
        </p>
        <form onSubmit={handleUsernameSubmit} className="space-y-5">
          <Alert tone="success">{usernameSuccess}</Alert>

          <Field
            label="Username"
            type="text"
            id="username"
            name="username"
            value={usernameInput}
            onChange={(e) => {
              setUsernameInput(e.target.value);
              if (usernameError) setUsernameError("");
              if (usernameSuccess) setUsernameSuccess("");
            }}
            placeholder="Username"
            autoComplete="nickname"
            maxLength={USERNAME_MAX_LENGTH}
            error={usernameError}
          />

          <Button
            type="submit"
            disabled={!usernameInput.trim() || usernameInput.trim() === username}
            loading={isUsernameLoading}
            loadingText="Menyimpan..."
            className="mt-8!"
          >
            Simpan username
          </Button>
        </form>
      </AppShell>
    );
  }

  if (view === "password") {
    return (
      <AppShell title={VIEW_TITLES.password} onBack={() => setView(null)}>
        <p className="mb-6 text-xs leading-4 font-medium text-ink">Ganti password untuk menjaga akun tetap aman</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Alert tone="success">{success}</Alert>
          <Alert tone="error">{errors.general}</Alert>

          <Field
            label="Password lama"
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            placeholder="Password lama kamu"
            autoComplete="current-password"
            error={errors.oldPassword}
          />
          <Field
            label="Password baru"
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Minimal 6 karakter"
            autoComplete="new-password"
            error={errors.newPassword}
          />
          <Field
            label="Konfirmasi password baru"
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Ulangi password baru"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          <Button type="submit" loading={isLoading} className="mt-8!">
            Simpan password baru
          </Button>
        </form>
      </AppShell>
    );
  }

  if (view === "email") {
    return (
      <AppShell title={VIEW_TITLES.email} onBack={() => setView(null)}>
        <p className="mb-6 text-xs leading-4 font-medium text-ink">
          Email saat ini: <span className="font-semibold text-primary">{email || "—"}</span>
        </p>
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <Alert tone="success">{emailSuccess}</Alert>
          <Alert tone="error">{emailErrors.general}</Alert>

          <Field
            label="Email baru"
            type="email"
            id="newEmail"
            name="newEmail"
            value={emailForm.newEmail}
            onChange={handleEmailChange}
            placeholder="Email baru yang kamu mau"
            autoComplete="email"
            error={emailErrors.newEmail}
          />
          <Field
            label="Konfirmasi email baru"
            type="email"
            id="confirmEmail"
            name="confirmEmail"
            value={emailForm.confirmEmail}
            onChange={handleEmailChange}
            placeholder="Ulangi email baru"
            autoComplete="email"
            error={emailErrors.confirmEmail}
          />

          <Button type="submit" loading={isEmailLoading} className="mt-8!">
            Simpan email baru
          </Button>
        </form>
      </AppShell>
    );
  }

  return (
    <AppShell title="Akun" headerClassName="pb-16">
      {/* Avatar menumpang di tepi sheet seperti layar "Setting" */}
      <div className="-mt-[76px] flex flex-col items-center">
        <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-4 border-surface bg-primary-4 text-4xl font-semibold text-primary shadow-soft">
          {greetingName({ username, email }).charAt(0).toUpperCase()}
        </div>
        <p className="mt-3 text-base leading-6 font-semibold text-primary">{greetingName({ username, email })}</p>
        <p className="text-xs leading-4 font-medium text-subtle">{email}</p>
      </div>

      <div className="mt-6">
        <button type="button" onClick={openUsernameView} className={rowClass}>
          <span className="text-base leading-6 font-medium text-ink">Username</span>
          <span className="flex min-w-0 items-center gap-2">
            <span className={`truncate text-xs leading-4 font-semibold ${username ? "text-subtle" : "text-primary"}`}>
              {username || "Atur sekarang"}
            </span>
            <IoChevronForward size={16} className="flex-none text-placeholder" />
          </span>
        </button>
        <button type="button" onClick={() => setView("password")} className={rowClass}>
          <span className="text-base leading-6 font-medium text-ink">Ubah password</span>
          <IoChevronForward size={16} className="text-placeholder" />
        </button>
        <button type="button" onClick={() => setView("email")} className={rowClass}>
          <span className="text-base leading-6 font-medium text-ink">Ubah email</span>
          <IoChevronForward size={16} className="text-placeholder" />
        </button>
        <Link href="/kategori" className={rowClass}>
          <span className="text-base leading-6 font-medium text-ink">Kelola kategori</span>
          <IoChevronForward size={16} className="text-placeholder" />
        </Link>
        <Link href="/statistik" className={rowClass}>
          <span className="text-base leading-6 font-medium text-ink">Statistik tahunan</span>
          <IoChevronForward size={16} className="text-placeholder" />
        </Link>
        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className={`${rowClass} disabled:opacity-60`}>
          <span className="text-base leading-6 font-medium text-danger">
            {isLoggingOut ? "Keluar..." : "Keluar"}
          </span>
        </button>
      </div>
    </AppShell>
  );
};

export default ProfilClient;
