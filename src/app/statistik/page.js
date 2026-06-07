import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatistikClient from "@/components/StatistikClient";
import { fetchWithAuth } from "@/lib/api";

export default async function StatistikPage() {
  const year = new Date().getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const results = await Promise.all(
    months.map((m) =>
      fetchWithAuth(`/api/pengeluaran/user/0/year/${year}/month/${m}`)
    )
  );

  const allTransactions = results.filter(Boolean).flat();

  const user = await fetchWithAuth("/api/auth/me");

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <StatistikClient transactions={allTransactions} year={year} />
    </div>
  );
}
