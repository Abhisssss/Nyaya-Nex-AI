"use server";

import { createClient } from "../../utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function confirmPayout(roll_no: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { error } = await supabase
    .from("recipients")
    .update({ status: "paid", updated_by: user.id, paid_at: new Date() })
    .eq("roll_no", roll_no);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/verify?id=${encodeURIComponent(roll_no)}`);
}
