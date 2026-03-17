"use server";

import { redirect } from "next/navigation";
import { ensureAdminUser } from "@/lib/bootstrap";
import { requireAdmin } from "@/lib/auth";

export async function syncAdminFromEnvAction() {
  await requireAdmin();
  await ensureAdminUser();
  redirect("/admin/settings?success=admin-synced-from-env");
}


