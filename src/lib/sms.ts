/**
 * Optional SMS for booking/order confirmation.
 * Provider: MSG91 (recommended). Set SMS_PROVIDER=msg91 and MSG91_* env to enable.
 */

const PROVIDER = process.env.SMS_PROVIDER ?? "";
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY ?? "";
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID ?? "";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").trim();
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

/**
 * Send SMS via configured provider. No-op if provider not configured.
 * Returns true if sent, false if skipped or failed (errors logged server-side).
 */
export async function sendSms(phone: string, message: string): Promise<boolean> {
  const to = normalizePhone(phone);
  if (!to || to.length < 12) {
    console.warn("[sendSms] Invalid phone, skip", { phone });
    return false;
  }

  if (PROVIDER !== "msg91" || !MSG91_AUTH_KEY || !MSG91_SENDER_ID) {
    return false;
  }

  try {
    const params = new URLSearchParams({
      authkey: MSG91_AUTH_KEY,
      mobiles: to,
      message,
      sender: MSG91_SENDER_ID,
      route: "4",
    });
    const res = await fetch(
      `https://control.msg91.com/api/sendhttp.php?${params.toString()}`
    );
    if (!res.ok) {
      console.error("[sendSms] MSG91 error", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[sendSms] MSG91 request failed", e);
    return false;
  }
}
