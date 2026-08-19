// scripts/seed-admin.ts
// Membuat akun admin pertama (atau menaikkan role jadi ADMIN) dari env
// ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
// Password di-hash oleh better-auth, bukan disimpan plaintext.
import "dotenv/config";
import { auth } from "../src/lib/auth";
import prisma from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di .env");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN" },
      });
      console.log(`Role ${email} dinaikkan menjadi ADMIN.`);
    } else {
      console.log(`${email} sudah ber-role ADMIN.`);
    }
    return;
  }

  // IP acak agar tidak kena rate limit sign-up saat dijalankan berulang.
  const randomIp = `127.0.0.${Math.floor(Math.random() * 250) + 1}`;

  // Skip captcha verification during seeding.
  const origTurnstile = process.env.TURNSTILE_SECRET_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;

  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
      headers: new Headers({
        "x-forwarded-for": randomIp,
        "content-type": "application/json",
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Sign up gagal: ${msg}`);
  } finally {
    if (origTurnstile !== undefined) {
      process.env.TURNSTILE_SECRET_KEY = origTurnstile;
    }
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User tidak ditemukan setelah sign up");

  await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  console.log(`Admin ${email} berhasil dibuat dengan role ADMIN.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
