import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ManageCategoriesClient from "@/components/ManageCategoriesClient";
import { fetchWithAuth } from "@/lib/api";

export default async function KategoriPage() {
  const user = await fetchWithAuth("/api/auth/me");

  if (!user) {
    redirect("/login");
  }

  const categories = await fetchWithAuth("/api/categories");

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <ManageCategoriesClient initialCategories={categories || []} />
    </div>
  );
}