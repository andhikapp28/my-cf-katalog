import "server-only";
import bcrypt from "bcryptjs";

export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return;
  }

  const [{ db }, schemaModule, drizzleModule] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
    import("drizzle-orm")
  ]);
  const { users } = schemaModule;
  const { eq } = drizzleModule;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!existing) {
    await db.insert(users).values({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN"
    });
    return;
  }

  const stillValid = await bcrypt.compare(password, existing.passwordHash);
  if (!stillValid) {
    await db
      .update(users)
      .set({
        passwordHash: await bcrypt.hash(password, 12),
        updatedAt: new Date()
      })
      .where(eq(users.id, existing.id));
  }
}
