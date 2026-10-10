"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/ui/AppShell";
import AuthIllustration from "@/components/ui/AuthIllustration";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";

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
    email: "",
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

    if (!formData.email.trim()) {
      newErrors.email = "Waduh, email jangan kosong dong!";
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error("Email atau password salah. Coba lagi ya!");
      }

      const accessToken = data?.session?.access_token;
      if (!accessToken) {
        throw new Error("Gagal mendapatkan sesi. Coba lagi nanti!");
      }

      // Ensure the user row exists in the backend database
      await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {});

      // Store session token in cookie (server-side)
      const cookieRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (!cookieRes.ok) {
        throw new Error("Gagal membuat sesi. Coba lagi!");
      }

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
    <AppShell title="Masuk" showNav={false}>
      <h2 className="text-2xl leading-7 font-semibold text-primary">Selamat Datang</h2>
      <p className="mt-1 text-xs leading-4 font-medium text-ink">Halo, masuk dulu untuk melanjutkan</p>

      <div className="mt-8">
        <AuthIllustration variant="signin" />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Alert tone="success">{successMessage}</Alert>
        <Alert tone="error">{errors.general}</Alert>

        <Field
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          autoComplete="email"
          aria-label="Email"
          error={errors.email}
        />
        <PasswordField
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          autoComplete="current-password"
          aria-label="Password"
          error={errors.password}
        />

        <Button
          type="submit"
          disabled={!formData.email || !formData.password}
          loading={isLoading}
          className="mt-10!"
        >
          Masuk
        </Button>
      </form>

      <p className="mt-8 text-center text-xs leading-4 text-ink">
        Belum punya akun?{" "}
        <Link href="/register" className="ml-1 font-semibold text-primary">
          Daftar
        </Link>
      </p>
    </AppShell>
  );
};

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-header">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
