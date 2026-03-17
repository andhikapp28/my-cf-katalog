import "server-only";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return session;
}



