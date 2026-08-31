import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfilClient from "@/components/ProfilClient";
import { fetchWithAuth } from "@/lib/api";

export default async function ProfilPage() {
  const user = await fetchWithAuth("/api/auth/me");

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <ProfilClient user={user} />
    </div>
  );
}
