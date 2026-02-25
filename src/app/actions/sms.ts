"use server";

export async function sendSMSNotification({
  phone,
  referenceId,
  category,
}: {
  phone: string;
  referenceId: string;
  category: string;
}) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === "your_fast2sms_api_key_here") {
    console.warn("[SMS] FAST2SMS_API_KEY not configured. SMS skipped.");
    return { error: "SMS service not configured" };
  }

  // Clean phone number — remove +91, spaces, dashes
  const cleanPhone = phone.replace(/\D/g, "").replace(/^91/, "").slice(-10);

  if (cleanPhone.length !== 10) {
    console.warn("[SMS] Invalid phone number:", phone);
    return { error: "Invalid phone number" };
  }

  const message =
    `Namaskar! Aapki shikayat safaltapoorvak darj kar li gayi hai.\n` +
    `\nShikayat Vivaran:\n` +
    `Sandarbh Sankhya (Reference No.): ${referenceId}\n` +
    `Shreni (Category): ${category}\n` +
    `\nAap apni report ki sthiti track karne ke liye upar di gayi Sandarbh Sankhya ka upyog karein.\n` +
    `\nDhanyavaad - Nagrik Ghatna Suchana Portal`;

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message,
        language: "english",
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();

    if (data.return === true) {
      console.log("[SMS] Sent successfully to", cleanPhone, "| Ref:", referenceId);
      return { success: true };
    } else {
      console.error("[SMS] Fast2SMS error:", data);
      return { error: data.message || "SMS sending failed" };
    }
  } catch (err: any) {
    console.error("[SMS] Network error:", err.message);
    return { error: err.message };
  }
}
