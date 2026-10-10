export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID").format(Number(value) || 0);

export const capitalize = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

// "budi.santoso@mail.com" -> "Budi.santoso"
export const displayName = (email) => capitalize(email?.split("@")[0] || "Kamu");

// Username kalau ada; user lama yang belum mengisinya pakai bagian depan email
export const greetingName = (user) => user?.username?.trim() || displayName(user?.email);

export const USERNAME_MAX_LENGTH = 50;
