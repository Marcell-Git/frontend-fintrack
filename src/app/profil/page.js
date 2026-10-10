import { redirect } from "next/navigation";
import ProfilClient from "@/components/ProfilClient";
import { fetchWithAuth } from "@/lib/api";

export default async function ProfilPage() {
  const user = await fetchWithAuth("/api/auth/me");

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfilClient user={user} />
  );
}
