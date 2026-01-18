import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";
import AdminClientPage from "./AdminClientPage";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Access Control: Check user role
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", user.id) // Changed "user_id" to "id"
    .single();

  if (roleError || userRole?.role !== "admin") {
    return redirect("/dashboard");
  }

  const page = parseInt(searchParams.page || "1", 10);
  const status = searchParams.status || "paid";

  const { data, count } = await supabase
    .from("admin_payout_report")
    .select("*", { count: "exact" })
    .eq("status", status)
    .range((page - 1) * 10, page * 10 - 1);

  return (
    <AdminClientPage
      payouts={data || []}
      totalCount={count || 0}
      currentPage={page}
      currentStatus={status}
    />
  );
}
