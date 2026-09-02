const EMAIL_API_URL = "https://api.resend.com/emails";
const EMAIL_FROM = "Royal Family Academy Contact <contact@mail.royalfamilyacademy.org>";
const CONTACT_TO = "info@royalfamilyacademy.org";
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
  const subject = enquiry.subject
    ? `Website Contact: ${enquiry.subject}`
    : "New Website Contact Message";

  const body = [
    "A new message was submitted from the Royal Family Academy Nursery & Primary contact page.",
    "",
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Subject: ${enquiry.subject || "(No subject provided)"}`,
    "",
    "Message:",
    enquiry.message,
    "",
    `Submitted: ${new Date().toISOString()}`,
  ].join("\n");

  const response = await fetch(EMAIL_API_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [CONTACT_TO],
      reply_to: enquiry.email,
      subject,
      text: body,
      tags: [{ name: "source", value: "rfa_contact" }],
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
      message: "Contact email service is not configured yet.",
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
    return json({ ok: true, message: "Thank you. Your message has been received." });
  }

  const enquiry = {
    name: clean(form.get("name"), 120),
    email: clean(form.get("email"), 254),
    subject: clean(form.get("subject"), 180),
    message: clean(form.get("message"), 4000),
  };

  if (!enquiry.name || !enquiry.email || !enquiry.message) {
    return json({ ok: false, message: "Please complete all required fields." }, 400);
  }
  if (!isEmail(enquiry.email)) {
    return json({ ok: false, message: "Please enter a valid email address." }, 400);
  }

  try {
    const result = await sendMail(context.env.RESEND_API_KEY, enquiry);
    console.log("Contact email accepted by email API", result?.id || "accepted");
    return json({ ok: true, message: "Thank you. Your message has been sent successfully." });
  } catch (error) {
    const diagnostic = error?.emailDiagnostic || "EMAIL_API_SEND_FAILED";
    console.error("Contact email API error", diagnostic, error?.message || error);
    return json({
      ok: false,
      message: "We could not send your message right now. Please try again shortly.",
      diagnostic,
    }, 502);
  }
}

export function onRequestGet() {
  return json({ ok: false, message: "Method not allowed." }, 405);
}
