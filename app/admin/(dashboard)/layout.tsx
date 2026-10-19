import { createClient } from "@/lib/supabase-server";
import AdminShell from "@/components/admin/AdminShell";
import "@/app/globals.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const userMail = user?.email || "";
  const userName = userMail ? userMail.split('@')[0].toUpperCase() : "";
  const avatarLabel = userName ? userName.slice(0, 2) : "AD";

  return (
    <AdminShell
      userEmail={userMail}
      userName={userName}
      avatarLabel={avatarLabel}
    >
      {children}
    </AdminShell>
  );
}