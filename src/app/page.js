import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardClient from "@/components/DashboardClient";
import { fetchWithAuth } from "@/lib/api";

export default async function Home() {
  // Fetch transactions securely (Server-to-Server)
  // We pass '0' as userId because the backend securely uses the token's user ID
  const [transactions, user] = await Promise.all([
    fetchWithAuth("/api/pengeluaran/user/0"),
    fetchWithAuth("/api/auth/me"),
  ]);

  // If fetch returns null (unauthorized), redirect to login
  if (!transactions || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <Navbar user={user} />
      <DashboardClient initialTransactions={transactions} />
    </div>
  );
}
