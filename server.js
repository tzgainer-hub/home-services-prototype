// ─────────────────────────────────────────────────────────────
// Point Zero AI — Home Services Prototype Server
// Serves static files + Sophia (AI 24/7 dispatcher) + lead capture
// Demo client: Basement Repair Specialists (Appleton, WI)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const path = require('path');
const https = require('https');
const Anthropic = require('@anthropic-ai/sdk');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ── Anthropic client (Sophia) ──
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ── Calendly (shared with dental — same Tom calendar for demo) ──
const CALENDLY_TOKEN = process.env.CALENDLY_API_TOKEN;
const CALENDLY_EVENT_TYPE_URI = process.env.CALENDLY_EVENT_TYPE_URI
  || 'https://api.calendly.com/event_types/740bfb87-61f2-4851-8e9a-7f5cb41f9f03';
const CALENDLY_SCHEDULING_URL = process.env.CALENDLY_SCHEDULING_URL
  || 'https://calendly.com/tomz-pointzeroai/30min';

// ── Config per-client (override via env vars) ──
const BUSINESS_NAME   = process.env.BUSINESS_NAME   || 'Basement Repair Specialists';
const BUSINESS_PHONE  = process.env.BUSINESS_PHONE  || '(855) 554-7246';
const BUSINESS_STATE  = process.env.BUSINESS_STATE  || 'Wisconsin';
const BUSINESS_TZ     = process.env.BUSINESS_TZ     || 'America/Chicago'; // Wisconsin = Central
const LEAD_INBOX      = process.env.LEAD_INBOX      || 'onboarding@pointzeroai.com';

// ── Email transporter (Gmail) ──
let transporter = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// CALENDLY HELPERS
// ─────────────────────────────────────────────────────────────

function calendlyGet(p) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.calendly.com',
      path: p,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function parseWeekOffset(messages) {
  const recent = messages.slice(-4)
    .filter((m) => m.role === 'user').map((m) => m.content).join(' ').toLowerCase();
  if (/4\s*weeks?\s*out|four\s*weeks?\s*out/.test(recent)) return 4;
  if (/3\s*weeks?\s*out|three\s*weeks?\s*out/.test(recent)) return 3;
  if (/next\s*month|end\s*of\s*(the\s*)?month/.test(recent)) return 3;
  if (/2\s*weeks?\s*out|two\s*weeks?\s*out/.test(recent)) return 2;
  if (/\b(later|further out|not so soon|not right away|further ahead)\b/.test(recent)) return 2;
  return 0;
}

// Returns true if a slot's start_time falls in the preferred time window,
// evaluated in BUSINESS_TZ (handles DST correctly — no manual UTC math).
function matchesTimeOfDay(iso, preferenceTime) {
  if (!preferenceTime) return true;
  const hourStr = new Date(iso).toLocaleString('en-US', {
    timeZone: BUSINESS_TZ, hour: 'numeric', hour12: false,
  });
  const hour = parseInt(hourStr, 10);
  if (preferenceTime === 'morning')   return hour < 12;
  if (preferenceTime === 'afternoon') return hour >= 12 && hour < 17;
  if (preferenceTime === 'evening')   return hour >= 17;
  return true;
}

async function getAvailableSlots(preferenceDays, preferenceTime, startWeekOffset = 0) {
  const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const preferredDayNums = (preferenceDays || [])
    .map((d) => dayMap[d.toLowerCase()])
    .filter((d) => d !== undefined);

  const matching = [];
  const MAX_WEEKS = 6;

  for (let week = 0; week < MAX_WEEKS && matching.length < 4; week++) {
    const start = new Date();
    start.setDate(start.getDate() + 1 + (week + startWeekOffset) * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 0);

    const startStr = start.toISOString().split('.')[0] + 'Z';
    const endStr = end.toISOString().split('.')[0] + 'Z';

    let data;
    try {
      data = await calendlyGet(
        `/event_type_available_times?event_type=${encodeURIComponent(CALENDLY_EVENT_TYPE_URI)}&start_time=${startStr}&end_time=${endStr}`
      );
    } catch (e) {
      console.error('[calendly fetch error]', e.message);
      break;
    }

    let weekSlots = data.collection || [];

    if (preferredDayNums.length > 0) {
      weekSlots = weekSlots.filter((s) => {
        const dayOfWeek = new Date(s.start_time).toLocaleString('en-US', {
          timeZone: BUSINESS_TZ, weekday: 'long',
        }).toLowerCase();
        return (preferenceDays || []).some((d) => d.toLowerCase() === dayOfWeek);
      });
    }

    if (preferenceTime) {
      weekSlots = weekSlots.filter((s) => matchesTimeOfDay(s.start_time, preferenceTime));
    }

    matching.push(...weekSlots);
  }

  // Spread — one slot per unique calendar day, up to 4
  const seen = new Set();
  const spread = [];
  for (const s of matching) {
    const key = new Date(s.start_time).toLocaleDateString('en-US', { timeZone: BUSINESS_TZ });
    if (!seen.has(key)) {
      seen.add(key);
      spread.push(s);
    }
    if (spread.length === 4) break;
  }

  return spread.map((s) => ({
    iso: s.start_time,
    display: new Date(s.start_time).toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
      timeZone: BUSINESS_TZ, hour12: true,
    }),
  }));
}

function buildCalendlyLink(name, email, slotIso) {
  const params = new URLSearchParams({ name: name || '', email: email || '' });
  if (slotIso) {
    // Pre-select the date in BUSINESS_TZ so Calendly opens on the right day
    const d = new Date(slotIso);
    const yyyy = d.toLocaleString('en-US', { timeZone: BUSINESS_TZ, year: 'numeric' });
    const mm   = d.toLocaleString('en-US', { timeZone: BUSINESS_TZ, month: '2-digit' });
    const dd   = d.toLocaleString('en-US', { timeZone: BUSINESS_TZ, day: '2-digit' });
    params.set('month', `${yyyy}-${mm}`);
    params.set('date',  `${yyyy}-${mm}-${dd}`);
  }
  return `${CALENDLY_SCHEDULING_URL}?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────
// EMAIL HELPERS
// ─────────────────────────────────────────────────────────────

async function emailLeadToInbox({ subject, bodyText, urgent = false }) {
  if (!transporter) {
    console.log('[email] skipped (no credentials)');
    return;
  }
  await transporter.sendMail({
    from: `"${BUSINESS_NAME} Website" <${process.env.GMAIL_USER}>`,
    to: LEAD_INBOX,
    subject: `${urgent ? '🚨 EMERGENCY · ' : ''}${subject}`,
    text: bodyText,
  });
}

async function emailHomeownerConfirmation(toEmail, firstName, bodyText, bookingLink) {
  if (!transporter || !toEmail) return;
  const htmlBody = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;">
      <div style="background:#0f1e3a;color:#fff;padding:26px 28px;border-radius:10px 10px 0 0;">
        <h2 style="margin:0;font-size:20px;font-weight:800;">We got your request, ${firstName || 'there'}.</h2>
        <p style="margin:8px 0 0;opacity:0.82;font-size:14px;">${BUSINESS_NAME} · ${BUSINESS_STATE}</p>
      </div>
      <div style="padding:28px;border:1px solid #e2e8f0;border-top:none;background:#fff;">
        <p style="font-size:15px;color:#1e293b;margin:0 0 18px;line-height:1.6;">
          Here's what you told Sophia. Please check it — we'll reach out shortly to confirm your free estimate.
        </p>
        <div style="background:#f8fafc;border-left:3px solid #ea6a1f;border-radius:8px;padding:18px 22px;font-size:14px;line-height:1.75;color:#1e293b;white-space:pre-wrap;">${bodyText.replace(/\*\*/g, '')}</div>
        ${bookingLink ? `
          <div style="text-align:center;margin:28px 0 8px;">
            <a href="${bookingLink}" style="display:inline-block;background:#ea6a1f;color:#fff;text-decoration:none;border-radius:10px;padding:14px 30px;font-size:15px;font-weight:800;">
              Confirm My Appointment →
            </a>
            <p style="font-size:11px;color:#94a3b8;margin:10px 0 0;">Opens our online calendar — 30 seconds.</p>
          </div>
        ` : ''}
        <div style="border-top:1px solid #e2e8f0;margin-top:26px;padding-top:22px;">
          <p style="font-size:14px;color:#64748b;margin:0;line-height:1.6;">
            Need us sooner? Call <a href="tel:${BUSINESS_PHONE.replace(/\D/g, '')}" style="color:#ea6a1f;font-weight:700;">${BUSINESS_PHONE}</a><br>
            24/7 Emergency Response · Wisconsin
          </p>
        </div>
      </div>
      <p style="color:#94a3b8;font-size:11px;text-align:center;margin:14px 0 0;">Powered by Point Zero AI · pointzeroai.com</p>
    </div>
  `;
  await transporter.sendMail({
    from: `"${BUSINESS_NAME}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Your Free Estimate Request — ${BUSINESS_NAME}`,
    html: htmlBody,
  });
}

async function forwardToGHL(payload) {
  if (!process.env.GHL_WEBHOOK_URL) return;
  try {
    await fetch(process.env.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[GHL webhook]', err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// SARA — SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────

const SOPHIA_SYSTEM = `You are Sophia, the 24/7 virtual dispatcher for ${BUSINESS_NAME} — Wisconsin's 2025 BBB Torch Award–winning basement, foundation, and waterproofing specialists. You serve all of Wisconsin from the Appleton headquarters. Main phone: ${BUSINESS_PHONE}.

Your job is to take incoming requests from homeowners and do ONE of two things:
(A) Dispatch a specialist call within 15 minutes for emergencies
(B) Book a free in-home estimate on our calendar

## OPENING — ALWAYS ASK THIS FIRST

Your very first message must be warm but get straight to the two-option question. Exact wording like:

"Hi, I'm Sophia — the 24/7 dispatcher for ${BUSINESS_NAME}. Quick question so I can get you the right help: **Is this an emergency, or would you like to schedule a free in-home estimate?**"

Do not start asking for name or other details until they answer. One of two paths opens based on their answer.

## PATH A — EMERGENCY

Active flooding, water intrusion, sewage backup, a wall actively moving or cracking, storm damage in progress — anything with "right now" urgency.

Collect these four things, one or two at a time:
1. First name
2. Phone number
3. Property address
4. Brief description of what's happening right now

Then say: "Got it. I'm flagging this urgent — a specialist will call you from ${BUSINESS_PHONE} within 15 minutes. If you don't hear from us in 15 minutes, call us directly."

End the message with a summary titled exactly "Emergency Dispatch Summary" containing all four fields.

## PATH B — IN-HOME ESTIMATE

Non-emergency. The homeowner wants to schedule the free on-site assessment.

Collect four contact fields, asking 2 at a time:
1. Name (first + last)
2. Phone
3. Email
4. Property address + city

Then ask what service they're interested in (waterproofing, foundation repair, crawl space, egress windows, basement finishing, drainage — or "not sure, need a look") AND what time of day works best (morning, afternoon, or evening). You can also ask if any particular days of the week work best.

Once you have name + phone + email + address + service + day/time preference, write [FETCH_SLOTS] on its own line. The system will pull real openings from our calendar and inject them back to you.

When the system returns slots, introduce them warmly — DO NOT list the times yourself, the website renders them as clickable buttons automatically. Just say something like "I pulled up a few openings that match your schedule — tap the one that works best."

When they pick a slot, confirm warmly: "Got you down for [day/time]. Click the button below to lock it in — takes about 30 seconds."

End with a summary titled exactly "Free Estimate Request Summary" containing:
- Name, phone, email, address
- Service requested
- Selected appointment day/time

## TONE

- Direct, warm, competent. Talk like a seasoned dispatcher — not a chatbot.
- Wisconsin homeowners appreciate straightforward people. Match that.
- No corporate fluff. No "I'd be happy to…" / "Wonderful!" / "Absolutely!"
- When someone says emergency, SKIP the pleasantries — move fast.
- Never use emoji.

## RULES

- Ask 1-2 questions at a time, never a list of 5
- Never promise a specific price — estimates are free and on-site
- Never make up appointment slots — only use what [FETCH_SLOTS] returns
- If they say "further out" / "3 weeks" / "next month" after seeing slots, acknowledge and write [FETCH_SLOTS] again — the system shifts the search window automatically
- We are licensed, insured, locally owned since 1999. Transferable lifetime warranty. 2025 BBB Torch Award Winner. Mention naturally when relevant, not every message.
- If they ask about pricing: "Every estimate is free and on-site — the price depends on what's actually going on. Our specialist will give you a written quote, same day, zero pressure."

## TONE

- Direct, warm, competent. Talk like a seasoned dispatcher — not a chatbot.
- Wisconsin homeowners appreciate straightforward people. Match that.
- No corporate fluff. No "I'd be happy to…" / "Wonderful!" / "Absolutely!"
- When someone's basement is flooding, SKIP the pleasantries and move fast.
- Never use emoji.

## RULES

- Ask 1-2 questions at a time, never a list of 5
- Never promise a specific price — estimates are free and on-site
- Never make up appointment slots — only use what [FETCH_SLOTS] returns
- If they say "further out" / "3 weeks" / "next month" after seeing slots, acknowledge and write [FETCH_SLOTS] again — the system shifts the search window automatically
- We are licensed, insured, and locally owned. Transferable lifetime warranty on our work. 2025 BBB Torch Award Winner. Mention these naturally when relevant (not in every message)
- If they ask about pricing: "Every estimate is free and on-site — the price depends on what's actually going on. Our specialist will give you a written quote, same day, with zero pressure."`;

// ─────────────────────────────────────────────────────────────
// SARA — SESSION STATE
// ─────────────────────────────────────────────────────────────

const sessions = new Map();
function makeSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Extract obvious PII from conversation for Calendly pre-fill + email
function extractContactInfo(session) {
  const text = session.messages.map((m) => m.content).join(' ');

  if (!session.homeownerName) {
    const m = text.match(/(?:name is|I'm|I am|this is|it's)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (m) session.homeownerName = m[1];
  }
  if (!session.homeownerEmail) {
    const m = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    if (m) session.homeownerEmail = m[0];
  }
  if (!session.homeownerPhone) {
    const m = text.match(/\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
    if (m) session.homeownerPhone = m[0];
  }
}

// ─────────────────────────────────────────────────────────────
// ROUTES — SARA
// ─────────────────────────────────────────────────────────────

app.post('/api/chat/start', async (_req, res) => {
  if (!anthropic) return res.status(503).json({ error: 'Sophia is offline (no ANTHROPIC_API_KEY set).' });

  try {
    const sessionId = makeSessionId();
    sessions.set(sessionId, {
      messages: [],
      emailSent: false,
      urgentDispatched: false,
      slotsShown: false,
      availableSlots: [],
      selectedSlot: null,
      homeownerName: null,
      homeownerEmail: null,
      homeownerPhone: null,
    });

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      system: SOPHIA_SYSTEM,
      messages: [
        { role: 'user', content: 'Hi — I found your website. Can you help me?' },
      ],
    });

    const assistantText = response.content[0].text;
    const session = sessions.get(sessionId);
    session.messages.push(
      { role: 'user', content: 'Hi — I found your website. Can you help me?' },
      { role: 'assistant', content: assistantText },
    );

    res.json({ sessionId, message: assistantText });
  } catch (err) {
    console.error('[chat/start]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/message/:sessionId', async (req, res) => {
  if (!anthropic) return res.status(503).json({ error: 'Sophia is offline.' });

  const { sessionId } = req.params;
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Empty message.' });

  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  session.messages.push({ role: 'user', content: message.trim() });
  extractContactInfo(session);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SOPHIA_SYSTEM,
      messages: session.messages,
    });

    let assistantText = response.content[0].text;
    session.messages.push({ role: 'assistant', content: assistantText });

    // ── Handle [FETCH_SLOTS] ──
    if (assistantText.includes('[FETCH_SLOTS]') && CALENDLY_TOKEN) {
      session.slotsShown = true;
      const weekOffset = parseWeekOffset(session.messages);
      assistantText = assistantText.replace('[FETCH_SLOTS]', '').trim();

      const convo = session.messages.map((m) => m.content).join(' ').toLowerCase();
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        .filter((d) => convo.includes(d));
      const preferenceTime = convo.includes('evening') ? 'evening'
        : convo.includes('afternoon') ? 'afternoon'
        : convo.includes('morning') ? 'morning'
        : null;

      try {
        const slots = await getAvailableSlots(days, preferenceTime, weekOffset);
        session.availableSlots = slots;

        if (slots.length > 0) {
          const slotList = slots.map((s, i) => `${i + 1}. ${s.display}`).join('\n');
          session.messages.push({
            role: 'user',
            content: `[SYSTEM: Real available slots from our calendar:\n${slotList}\n\nIntroduce them warmly — say you pulled up a few openings and they should pick the one that works best. Do NOT list the times yourself; the website renders them as buttons automatically.]`,
          });

          const slotResponse = await anthropic.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 256,
            system: SOPHIA_SYSTEM,
            messages: session.messages,
          });

          assistantText = slotResponse.content[0].text;
          session.messages.push({ role: 'assistant', content: assistantText });
          return res.json({ message: assistantText, availableSlots: slots });
        } else {
          session.messages.push({
            role: 'user',
            content: '[SYSTEM: No online slots matched. Tell the homeowner that our team will call them within one business hour to find a time that works.]',
          });
          const fallback = await anthropic.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 400,
            system: SOPHIA_SYSTEM,
            messages: session.messages,
          });
          assistantText = fallback.content[0].text;
          session.messages.push({ role: 'assistant', content: assistantText });
        }
      } catch (calErr) {
        console.error('[calendly]', calErr.message);
      }
    }

    // ── Detect slot selection → return booking link ──
    let bookingLink = null;
    if (session.availableSlots.length > 0) {
      const patientMsg = message.toLowerCase();
      const selected = session.availableSlots.find((slot, i) =>
        patientMsg.includes(`${i + 1}`) ||
        patientMsg.includes(slot.display.toLowerCase().split(' at ')[0]) ||
        patientMsg.includes(slot.display.toLowerCase().split(',')[0])
      );
      if (selected) {
        session.selectedSlot = selected;
        bookingLink = buildCalendlyLink(session.homeownerName, session.homeownerEmail, selected.iso);
        session.availableSlots = [];
      }
    }

    // ── Detect urgent dispatch → fire email immediately ──
    let urgentSent = false;
    if (!session.urgentDispatched && /Emergency Dispatch Summary/i.test(assistantText)) {
      session.urgentDispatched = true;
      urgentSent = true;
      emailLeadToInbox({
        subject: `EMERGENCY — ${session.homeownerName || 'Unknown'} · ${session.homeownerPhone || 'no phone'}`,
        bodyText: assistantText,
        urgent: true,
      }).catch((e) => console.error('[urgent email]', e.message));

      forwardToGHL({
        source: 'sara_emergency',
        urgency: 'emergency',
        firstName: session.homeownerName,
        phone: session.homeownerPhone,
        email: session.homeownerEmail,
        conversation: session.messages,
        submittedAt: new Date().toISOString(),
      });
    }

    // ── Detect standard summary → fire emails + GHL ──
    let emailSent = false;
    if (!session.emailSent && /Free Estimate Request Summary/i.test(assistantText)) {
      session.emailSent = true;
      emailSent = true;

      emailLeadToInbox({
        subject: `New Estimate — ${session.homeownerName || 'Unknown'} · ${session.homeownerPhone || 'no phone'}`,
        bodyText: assistantText,
      }).catch((e) => console.error('[lead email]', e.message));

      const confirmLink = bookingLink || (session.selectedSlot
        ? buildCalendlyLink(session.homeownerName, session.homeownerEmail, session.selectedSlot.iso)
        : null);
      emailHomeownerConfirmation(
        session.homeownerEmail,
        session.homeownerName,
        assistantText,
        confirmLink
      ).catch((e) => console.error('[homeowner email]', e.message));

      forwardToGHL({
        source: 'sara_estimate',
        urgency: 'standard',
        firstName: session.homeownerName,
        phone: session.homeownerPhone,
        email: session.homeownerEmail,
        conversation: session.messages,
        submittedAt: new Date().toISOString(),
      });
    }

    res.json({ message: assistantText, emailSent, urgentSent, bookingLink });
  } catch (err) {
    console.error('[chat/message]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ROUTE — /api/estimate (existing form-based lead capture)
// ─────────────────────────────────────────────────────────────

app.post('/api/estimate', async (req, res) => {
  const {
    firstName = '', lastName = '', email = '', phone = '',
    address = '', service = '', urgency = '', message = '',
  } = req.body || {};

  if (!firstName || !email || !phone) {
    return res.status(400).json({ ok: false, error: 'Name, email, and phone are required.' });
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const ts = new Date().toLocaleString('en-US', { timeZone: BUSINESS_TZ });

  forwardToGHL({
    firstName, lastName, email, phone, address, service, urgency, message,
    source: 'website_estimate_form',
    submittedAt: new Date().toISOString(),
  });

  if (transporter) {
    const leadBody = [
      `NEW FREE ESTIMATE REQUEST — ${ts}`,
      '',
      `Name:     ${fullName}`,
      `Phone:    ${phone}`,
      `Email:    ${email}`,
      `Address:  ${address || '(not provided)'}`,
      `Service:  ${service || '(not specified)'}`,
      `Urgency:  ${urgency || '(not specified)'}`,
      '',
      'Message:',
      message || '(none)',
      '',
      '—',
      'Source: website estimate form',
    ].join('\n');

    try {
      await emailLeadToInbox({
        subject: `Estimate Request — ${fullName}${urgency === 'emergency' ? ' · EMERGENCY' : ''}`,
        bodyText: leadBody,
        urgent: urgency === 'emergency',
      });

      const confirmBody = [
        `Hi ${firstName},`,
        '',
        `Thanks for reaching out to ${BUSINESS_NAME}. We received your request for a free estimate and will be in touch shortly — usually within one business hour during normal hours.`,
        '',
        `Here's what you submitted:`,
        `  Service:  ${service || '(general inquiry)'}`,
        `  Address:  ${address || '(to be confirmed)'}`,
        `  Urgency:  ${urgency || 'standard'}`,
        '',
        `If you need us sooner, call ${BUSINESS_PHONE}.`,
        '',
        'Talk soon,',
        `The ${BUSINESS_NAME} Team`,
      ].join('\n');

      await transporter.sendMail({
        from: `"${BUSINESS_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `We received your estimate request`,
        text: confirmBody,
      });
    } catch (err) {
      console.error('[estimate email]', err.message);
    }
  }

  return res.json({ ok: true });
});

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'home-services-prototype',
    sara: anthropic ? 'online' : 'offline (no ANTHROPIC_API_KEY)',
    calendly: CALENDLY_TOKEN ? 'configured' : 'not configured',
    email: transporter ? 'configured' : 'not configured',
  });
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[home-services] listening on :${PORT}`);
  console.log(`  sara:    ${anthropic ? 'online' : 'offline (no ANTHROPIC_API_KEY)'}`);
  console.log(`  calendly: ${CALENDLY_TOKEN ? 'configured' : 'not configured'}`);
  console.log(`  email:    ${transporter ? 'configured' : 'not configured'}`);
});
