import nodemailer from "nodemailer";
import { setDefaultResultOrder } from "node:dns";
import { env } from "@/lib/env";

// Gmail SMTP resolve ke IPv6 yang sering tidak bisa dirouting di jaringan lokal;
// paksa IPv4 supaya koneksi tidak ETIMEDOUT.
setDefaultResultOrder("ipv4first");

export const isEmailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const globalForMail = global as unknown as {
  transporter: ReturnType<typeof nodemailer.createTransport> | undefined;
};

function getTransporter() {
  if (!globalForMail.transporter) {
    globalForMail.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 465,
      secure: (env.SMTP_PORT ?? 465) === 465,
      auth: {
        user: env.SMTP_USER!,
        pass: env.SMTP_PASS!,
      },
    });
  }
  return globalForMail.transporter;
}

export async function sendVerificationEmail(to: string, url: string) {
  if (!isEmailConfigured) throw new Error("SMTP is not configured");
  await getTransporter().sendMail({
    from: env.EMAIL_FROM ?? env.SMTP_USER!,
    to,
    subject: "Verify your email address",
    text: `Click the link to verify your email: ${url}`,
    html: `<p>Click the link to verify your email:</p><p><a href="${url}">${url}</a></p>`,
  });
}