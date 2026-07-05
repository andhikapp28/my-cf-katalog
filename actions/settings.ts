"use server";

import { ensureAdminUser } from "@/lib/bootstrap";
import { requireAdmin } from "@/lib/auth";

export type SyncAdminState = {
  success?: string;
  error?: string;
};

export async function syncAdminFromEnvAction(
  _prevState: SyncAdminState,
  _formData: FormData
): Promise<SyncAdminState> {
  await requireAdmin();
  await ensureAdminUser();

  return { success: "Admin disinkronkan dari environment." };
}
