"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/ui/AppShell";
import AuthIllustration from "@/components/ui/AuthIllustration";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import PasswordField from "@/components/ui/PasswordField";

const Register = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
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

    if (!formData.email.trim()) {
      newErrors.email = "Email-nya jangan lupa diisi ya!";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Format email-nya kurang tepat nih!";
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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // If we have a session token, register the user row in the backend
      const accessToken = data?.session?.access_token;
      if (accessToken) {
        await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }).catch(() => {});
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
    <AppShell title="Daftar" backHref="/login" showNav={false}>
      <h2 className="text-2xl leading-7 font-semibold text-primary">Selamat bergabung,</h2>
      <p className="mt-1 text-xs leading-4 font-medium text-ink">Halo, yuk buat akun barumu</p>

      <div className="mt-8">
        <AuthIllustration variant="signup" />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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
          placeholder="Password (minimal 6 karakter)"
          autoComplete="new-password"
          aria-label="Password"
          error={errors.password}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Ulangi password"
          autoComplete="new-password"
          aria-label="Ulangi password"
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          disabled={!formData.email || !formData.password || !formData.confirmPassword}
          loading={isLoading}
          loadingText="Mendaftar..."
          className="mt-10!"
        >
          Daftar
        </Button>
      </form>

      <p className="mt-8 text-center text-xs leading-4 text-ink">
        Sudah punya akun?{" "}
        <Link href="/login" className="ml-1 font-semibold text-primary">
          Masuk
        </Link>
      </p>
    </AppShell>
  );
};

export default Register;
