import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";
import { fetchWithAuth } from "@/lib/api";

export default async function Home() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Fetch transactions securely (Server-to-Server)
  const [transactions, user] = await Promise.all([
    fetchWithAuth(`/api/pengeluaran/user/0/year/${year}/month/${month}`),
    fetchWithAuth("/api/auth/me"),
  ]);

  // If fetch returns null (unauthorized), redirect to login
  if (!transactions || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <DashboardClient initialTransactions={transactions} />
    </div>
  );
}
