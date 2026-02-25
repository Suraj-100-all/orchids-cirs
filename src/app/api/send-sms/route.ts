import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone, referenceId, category } = await req.json();

  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === "your_fast2sms_api_key_here") {
    return NextResponse.json({ error: "SMS service not configured" }, { status: 400 });
  }

  // Clean phone number — remove +91, spaces, dashes
  const cleanPhone = String(phone).replace(/\D/g, "").replace(/^91/, "").slice(-10);

  if (cleanPhone.length !== 10) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const message =
    `Namaskar! Aapki shikayat safaltapoorvak darj kar li gayi hai.\n` +
    `Sandarbh Sankhya (Reference No.): ${referenceId}\n` +
    `Shreni (Category): ${category}\n` +
    `Apni report track karne ke liye yeh number use karein.\n` +
    `Dhanyavaad - Nagrik Ghatna Suchana Portal`;

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
      console.log("[SMS] Sent to", cleanPhone, "| Ref:", referenceId);
      return NextResponse.json({ success: true });
    } else {
      console.error("[SMS] Fast2SMS error:", data);
      return NextResponse.json({ error: data.message || "SMS failed" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[SMS] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
