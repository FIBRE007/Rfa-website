import { connect } from "cloudflare:sockets";

const SMTP_HOST = "mx1.royalfamilyacademy.org";
const SMTP_PORT = 465;
const SMTP_USER = "info@royalfamilyacademy.org";
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

function headerSafe(value, max = 250) {
  return clean(value, max).replace(/[\r\n]+/g, " ");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function dotStuff(text) {
  return text.replace(/^\./gm, "..");
}

class SmtpReader {
  constructor(readable) {
    this.reader = readable.getReader();
    this.decoder = new TextDecoder();
    this.buffer = "";
  }

  async line() {
    while (true) {
      const pos = this.buffer.indexOf("\n");
      if (pos !== -1) {
        const line = this.buffer.slice(0, pos + 1);
        this.buffer = this.buffer.slice(pos + 1);
        return line.replace(/\r?\n$/, "");
      }
      const { value, done } = await this.reader.read();
      if (done) {
        if (this.buffer) {
          const line = this.buffer;
          this.buffer = "";
          return line;
        }
        throw new Error("SMTP connection closed unexpectedly");
      }
      this.buffer += this.decoder.decode(value, { stream: true });
    }
  }

  async response() {
    const lines = [];
    let code = null;
    while (true) {
      const line = await this.line();
      lines.push(line);
      const match = line.match(/^(\d{3})([ -])/);
      if (!match) continue;
      code = Number(match[1]);
      if (match[2] === " ") return { code, text: lines.join("\n") };
    }
  }
}

async function expect(reader, allowed) {
  const response = await reader.response();
  if (!allowed.includes(response.code)) {
    throw new Error(`SMTP ${response.code}: ${response.text}`);
  }
  return response;
}

async function sendCommand(writer, reader, command, allowed) {
  await writer.write(new TextEncoder().encode(`${command}\r\n`));
  return expect(reader, allowed);
}

async function sendMail(password, enquiry) {
  const socket = connect(
    { hostname: SMTP_HOST, port: SMTP_PORT },
    { secureTransport: "on", allowHalfOpen: false },
  );

  await socket.opened;
  const reader = new SmtpReader(socket.readable);
  const writer = socket.writable.getWriter();

  try {
    await expect(reader, [220]);
    await sendCommand(writer, reader, "EHLO nurseryandprimaryschool.royalfamilyacademy.org", [250]);
    await sendCommand(writer, reader, "AUTH LOGIN", [334]);
    await sendCommand(writer, reader, btoa(SMTP_USER), [334]);
    await sendCommand(writer, reader, btoa(password), [235]);
    await sendCommand(writer, reader, `MAIL FROM:<${SMTP_USER}>`, [250]);
    await sendCommand(writer, reader, `RCPT TO:<${ADMISSIONS_TO}>`, [250, 251]);
    await sendCommand(writer, reader, "DATA", [354]);

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
    ].join("\r\n");

    const message = [
      `From: Royal Family Academy Admissions <${SMTP_USER}>`,
      `To: ${ADMISSIONS_TO}`,
      `Reply-To: ${headerSafe(enquiry.email)}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      dotStuff(body),
      ".",
      "",
    ].join("\r\n");

    await writer.write(new TextEncoder().encode(message));
    await expect(reader, [250]);
    await sendCommand(writer, reader, "QUIT", [221]);
  } finally {
    try { writer.releaseLock(); } catch {}
    try { await socket.close(); } catch {}
  }
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ ok: false, message: "Request origin is not allowed." }, 403);
  }

  if (!context.env.SMTP_PASSWORD) {
    console.error("SMTP_PASSWORD secret is not configured");
    return json({ ok: false, message: "Admissions email service is not configured yet." }, 503);
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
    await sendMail(context.env.SMTP_PASSWORD, enquiry);
    return json({ ok: true, message: "Thank you. Your admissions enquiry has been sent successfully." });
  } catch (error) {
    console.error("Admissions SMTP error", error?.message || error);
    return json({ ok: false, message: "We could not send your enquiry right now. Please try again shortly." }, 502);
  }
}

export function onRequestGet() {
  return json({ ok: false, message: "Method not allowed." }, 405);
}
