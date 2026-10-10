import { redirect } from "next/navigation";
import ManageCategoriesClient from "@/components/ManageCategoriesClient";
import { fetchWithAuth } from "@/lib/api";

export default async function KategoriPage() {
  const user = await fetchWithAuth("/api/auth/me");

  if (!user) {
    redirect("/login");
  }

  const categories = await fetchWithAuth("/api/categories");

  return (
    <ManageCategoriesClient initialCategories={categories || []} />
  );
}