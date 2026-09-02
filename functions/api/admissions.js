const EMAIL_API_URL = "https://api.resend.com/emails";
const EMAIL_FROM = "Royal Family Academy Admissions <admissions@mail.royalfamilyacademy.org>";
const ADMISSIONS_TO = "info@royalfamilyacademy.org";
const ALLOWED_ORIGINS = new Set([
  "https://nurseryandprimaryschool.royalfamilyacademy.org",
  "https://royalfamilyacademy.org",
  "https://www.royalfamilyacademy.org",
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function clean(value, max = 1000) {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

async function sendMail(apiKey, enquiry) {
  const subject = "New Nursery & Primary Admissions Enquiry";
  const body = [
    "A new admissions enquiry was submitted from the Royal Family Academy website.",
    "",
    `Parent / Guardian: ${enquiry.name}`,
    `Child's age: ${enquiry.age}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Stage of interest: ${enquiry.stage}`,
    "",
    "Message:",
    enquiry.message || "(No message provided)",
    "",
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");

  const response = await fetch(EMAIL_API_URL, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [ADMISSIONS_TO],
      reply_to: enquiry.email,
      subject,
      text: body,
      tags: [
        { name: "source", value: "rfa_admissions" },
      ],
    }),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    const detail = result?.message || result?.name || `HTTP ${response.status}`;
    const error = new Error(`Email API ${response.status}: ${detail}`);
    error.emailDiagnostic = `EMAIL_API_${response.status}`;
    throw error;
  }

  return result;
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ ok: false, message: "Request origin is not allowed." }, 403);
  }

  if (!context.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY secret is not configured");
    return json({
      ok: false,
      message: "Admissions email service is not configured yet. Diagnostic: EMAIL_API_KEY_MISSING.",
      diagnostic: "EMAIL_API_KEY_MISSING",
    }, 503);
  }

  let form;
  try {
    form = await context.request.formData();
  } catch {
    return json({ ok: false, message: "Invalid form submission." }, 400);
  }

  if (clean(form.get("_honey"), 200)) {
    return json({ ok: true, message: "Thank you. Your enquiry has been received." });
  }

  const enquiry = {
    name: clean(form.get("name"), 120),
    age: clean(form.get("age"), 50),
    email: clean(form.get("email"), 254),
    phone: clean(form.get("phone"), 60),
    stage: clean(form.get("stage"), 80),
    message: clean(form.get("message"), 4000),
  };

  if (!enquiry.name || !enquiry.age || !enquiry.email || !enquiry.phone || !enquiry.stage) {
    return json({ ok: false, message: "Please complete all required fields." }, 400);
  }
  if (!isEmail(enquiry.email)) {
    return json({ ok: false, message: "Please enter a valid email address." }, 400);
  }

  try {
    const result = await sendMail(context.env.RESEND_API_KEY, enquiry);
    console.log("Admissions email accepted by email API", result?.id || "accepted");
    return json({ ok: true, message: "Thank you. Your admissions enquiry has been sent successfully." });
  } catch (error) {
    const diagnostic = error?.emailDiagnostic || "EMAIL_API_SEND_FAILED";
    console.error("Admissions email API error", diagnostic, error?.message || error);
    return json({
      ok: false,
      message: `We could not send your enquiry right now. Diagnostic: ${diagnostic}.`,
      diagnostic,
    }, 502);
  }
}

export function onRequestGet() {
  return json({ ok: false, message: "Method not allowed." }, 405);
}
