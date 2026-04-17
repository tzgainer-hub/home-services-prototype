(function () {
  // ─────────────────────────────────────────────────────────────
  // Sarah — 24/7 Virtual Dispatcher Widget
  // Forked from dental-prototype; restyled with Trusted Trade palette
  // ─────────────────────────────────────────────────────────────

  const BUSINESS_NAME = 'Basement Repair Specialists';
  const BUSINESS_PHONE_DISPLAY = '(855) 554-7246';
  const BUSINESS_PHONE_TEL = '8555547246';

  // ── Styles ──
  const css = `
    #sarah-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 9999;
      background: #0f1e3a;
      color: #fff;
      border: none;
      border-radius: 50px;
      padding: 14px 22px 14px 18px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(15,30,58,0.35);
      transition: transform 0.2s, box-shadow 0.2s;
      letter-spacing: 0.01em;
    }
    #sarah-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(15,30,58,0.45);
    }
    #sarah-btn .sarah-pulse {
      width: 9px; height: 9px;
      background: #22c55e;
      border-radius: 50%;
      flex-shrink: 0;
      animation: sarah-pulse 2.2s infinite;
      box-shadow: 0 0 0 0 rgba(34,197,94,0.6);
    }
    @keyframes sarah-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
      70%  { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
      100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
    }
    #sarah-modal {
      display: none;
      position: fixed;
      bottom: 92px;
      right: 28px;
      width: 400px;
      max-width: calc(100vw - 32px);
      height: 580px;
      max-height: calc(100vh - 120px);
      z-index: 9998;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 28px 72px rgba(15,30,58,0.28);
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      border: 1px solid rgba(15,30,58,0.08);
    }
    #sarah-modal.open { display: flex; }
    .sarah-header {
      background: linear-gradient(135deg, #0f1e3a 0%, #1e3456 100%);
      color: #fff;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .sarah-header::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 140px; height: 140px;
      border-radius: 50%;
      background: rgba(234,106,31,0.18);
    }
    .sarah-avatar {
      width: 44px; height: 44px;
      background: #ea6a1f;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 17px;
      color: #fff;
      position: relative;
      box-shadow: 0 4px 12px rgba(234,106,31,0.4);
    }
    .sarah-avatar::after {
      content: '';
      position: absolute;
      bottom: -1px; right: -1px;
      width: 12px; height: 12px;
      background: #22c55e;
      border: 2px solid #0f1e3a;
      border-radius: 50%;
    }
    .sarah-header-text { position: relative; flex: 1; }
    .sarah-title {
      font-weight: 800;
      font-size: 15px;
      margin: 0 0 2px 0;
      font-family: 'Outfit', sans-serif;
      letter-spacing: -0.01em;
    }
    .sarah-subtitle {
      font-size: 12px;
      opacity: 0.82;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .sarah-subtitle::before {
      content: '';
      width: 6px; height: 6px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
    }
    .sarah-close {
      margin-left: auto;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.15s;
      position: relative;
    }
    .sarah-close:hover { opacity: 1; }
    .sarah-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
    }
    .sarah-bubble {
      max-width: 88%;
      padding: 11px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.55;
      color: #1e293b;
    }
    .sarah-bubble.agent {
      background: #fff;
      border: 1px solid #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(15,30,58,0.06);
    }
    .sarah-bubble.user {
      background: #0f1e3a;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .sarah-bubble.status {
      background: #fff4ec;
      border: 1px dashed #f4a368;
      align-self: center;
      font-size: 12.5px;
      color: #c2531a;
      padding: 9px 14px;
      text-align: center;
    }
    .sarah-typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 12px 14px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 3px rgba(15,30,58,0.06);
    }
    .sarah-typing span {
      width: 7px; height: 7px;
      background: #94a3b8;
      border-radius: 50%;
      animation: sarah-typing 1.3s infinite;
    }
    .sarah-typing span:nth-child(2) { animation-delay: 0.18s; }
    .sarah-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes sarah-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30%           { transform: translateY(-5px); opacity: 1; }
    }
    .sarah-success-notice {
      background: #ecfdf5;
      border: 1.5px solid #86efac;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 13px;
      color: #14532d;
      align-self: center;
      text-align: center;
      max-width: 94%;
      line-height: 1.5;
    }
    .sarah-urgent-notice {
      background: #fff7ed;
      border: 1.5px solid #fb923c;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 13px;
      color: #9a3412;
      align-self: center;
      text-align: center;
      max-width: 94%;
      line-height: 1.5;
      font-weight: 600;
    }
    .sarah-success-notice strong, .sarah-urgent-notice strong {
      display: block;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .sarah-save-btn {
      background: #0f1e3a;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      margin-top: 10px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .sarah-save-btn:hover { background: #1e3456; }
    .sarah-input-area {
      padding: 12px 14px;
      background: #fff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    #sarah-input {
      flex: 1;
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      padding: 11px 13px;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      outline: none;
      color: #1e293b;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    #sarah-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    #sarah-input:disabled { background: #f8fafc; color: #94a3b8; }
    #sarah-send {
      background: #ea6a1f;
      color: #fff;
      border: none;
      border-radius: 10px;
      width: 42px;
      height: 42px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
      align-self: flex-end;
    }
    #sarah-send:hover:not(:disabled) { background: #c2531a; }
    #sarah-send:disabled { background: #cbd5e1; cursor: default; }

    /* Hide floating button on mobile — chat opens from mobile sticky bar */
    @media (max-width: 768px) {
      #sarah-btn { display: none; }
      #sarah-modal { bottom: 76px; right: 0; left: 0; width: 100%; max-width: 100%; border-radius: 16px 16px 0 0; height: calc(100vh - 76px); max-height: none; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ──
  document.body.insertAdjacentHTML('beforeend', `
    <button id="sarah-btn" onclick="window.sarahChat.toggle()" aria-label="Chat with Sarah">
      <span class="sarah-pulse"></span>
      Chat with Sarah · 24/7
    </button>

    <div id="sarah-modal" role="dialog" aria-label="Chat with Sarah">
      <div class="sarah-header">
        <div class="sarah-avatar">S</div>
        <div class="sarah-header-text">
          <p class="sarah-title">Sarah · 24/7 Dispatcher</p>
          <p class="sarah-subtitle">Online now · Usually replies instantly</p>
        </div>
        <button class="sarah-close" onclick="window.sarahChat.toggle()" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="sarah-messages" id="sarah-messages"></div>
      <div class="sarah-input-area">
        <input type="text" id="sarah-input" placeholder="Type your message…" disabled autocomplete="off" />
        <button id="sarah-send" disabled onclick="window.sarahChat.sendMessage()" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  `);

  // ── State ──
  let sessionId = null;
  const transcript = [];

  const modal    = document.getElementById('sarah-modal');
  const messages = document.getElementById('sarah-messages');
  const input    = document.getElementById('sarah-input');
  const sendBtn  = document.getElementById('sarah-send');

  // ── Helpers ──
  function addBubble(text, role) {
    const div = document.createElement('div');
    div.className = `sarah-bubble ${role}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    if (role === 'agent' || role === 'user') transcript.push({ role, text });
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'sarah-typing';
    el.id = 'sarah-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    const el = document.getElementById('sarah-typing-indicator');
    if (el) el.remove();
  }

  function setInputEnabled(enabled) {
    input.disabled = !enabled;
    sendBtn.disabled = !enabled;
    if (enabled) input.focus();
  }

  function showUrgentNotice() {
    const div = document.createElement('div');
    div.className = 'sarah-urgent-notice';
    div.innerHTML = `
      <strong>Dispatched — Expect a call within 15 minutes</strong>
      A specialist will call you from ${BUSINESS_PHONE_DISPLAY}. If you don't hear from us in 15 minutes, call us directly.
      <div style="margin-top:10px;">
        <a href="tel:${BUSINESS_PHONE_TEL}" style="display:inline-block;background:#ea6a1f;color:#fff;text-decoration:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:800;font-family:'Outfit',sans-serif;">Call ${BUSINESS_PHONE_DISPLAY}</a>
      </div>
      <button class="sarah-save-btn" onclick="window.sarahChat.saveTranscript()" style="margin-top:10px;">
        Save My Conversation
      </button>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showSuccessNotice() {
    const div = document.createElement('div');
    div.className = 'sarah-success-notice';
    div.innerHTML = `
      <strong>✓ Got it — you're on the list</strong>
      Check your email for confirmation. A specialist will call within one business hour.
      <button class="sarah-save-btn" onclick="window.sarahChat.saveTranscript()">
        Save My Conversation
      </button>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  // ── Reserved for future Calendly integration — currently dormant in Option A flow ──
  function showSlotButtons(slots) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin:4px 0;align-self:flex-start;width:100%;';
    slots.forEach((slot) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'background:#fff;border:1.5px solid #2563eb;border-radius:10px;padding:11px 16px;font-size:14px;font-family:Inter,sans-serif;color:#2563eb;font-weight:700;cursor:pointer;text-align:left;transition:all 0.15s;';
      btn.textContent = slot.display;
      btn.onmouseenter = () => { btn.style.background = '#2563eb'; btn.style.color = '#fff'; };
      btn.onmouseleave = () => { btn.style.background = '#fff'; btn.style.color = '#2563eb'; };
      btn.onclick = () => {
        wrap.remove();
        addBubble(slot.display, 'user');
        setInputEnabled(false);
        showTyping();
        fetch(`/api/chat/message/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: slot.display }),
        })
          .then((r) => r.json())
          .then((data) => {
            hideTyping();
            if (data.error) throw new Error(data.error);
            addBubble(data.message, 'agent');
            if (data.bookingLink) showBookingButton(data.bookingLink);
            if (data.emailSent) showSuccessNotice();
            setInputEnabled(true);
          })
          .catch(() => {
            hideTyping();
            addBubble(`Something went wrong. Please try again or call ${BUSINESS_PHONE_DISPLAY}.`, 'status');
            setInputEnabled(true);
          });
      };
      wrap.appendChild(btn);
    });
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function showBookingButton(link) {
    const div = document.createElement('div');
    div.style.cssText = 'align-self:center;text-align:center;margin:8px 0;';
    div.innerHTML = `
      <a href="${link}" target="_blank" rel="noopener" style="display:inline-block;background:#ea6a1f;color:#fff;text-decoration:none;border-radius:10px;padding:12px 26px;font-size:14px;font-weight:800;font-family:'Outfit',sans-serif;box-shadow:0 6px 18px rgba(234,106,31,0.4);">
        Lock In My Appointment →
      </a>
      <p style="font-size:11px;color:#64748b;margin:8px 0 0;font-family:Inter,sans-serif;">Takes about 30 seconds</p>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  // ── Start session ──
  function startSession() {
    showTyping();
    fetch('/api/chat/start', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then((r) => r.json())
      .then((data) => {
        hideTyping();
        if (data.error) throw new Error(data.error);
        sessionId = data.sessionId;
        addBubble(data.message, 'agent');
        setInputEnabled(true);
      })
      .catch(() => {
        hideTyping();
        addBubble(`Sorry — I can't connect right now. Please call us at ${BUSINESS_PHONE_DISPLAY}.`, 'status');
      });
  }

  // ── Public API ──
  window.sarahChat = {
    toggle() {
      const isOpen = modal.classList.contains('open');
      if (isOpen) {
        modal.classList.remove('open');
      } else {
        modal.classList.add('open');
        if (!sessionId) startSession();
      }
    },

    saveTranscript() {
      const lines = transcript.map((m) => {
        const label = m.role === 'agent' ? `Sarah (${BUSINESS_NAME})` : 'You';
        return `${label}:\n${m.text}`;
      });
      const content = [
        `${BUSINESS_NAME} — Intake Conversation`,
        `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        '─'.repeat(50),
        '',
        lines.join('\n\n'),
        '',
        '─'.repeat(50),
        `${BUSINESS_NAME} · ${BUSINESS_PHONE_DISPLAY}`,
      ].join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BRS-Intake-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },

    sendMessage() {
      const text = input.value.trim();
      if (!text || !sessionId) return;
      addBubble(text, 'user');
      input.value = '';
      setInputEnabled(false);
      showTyping();

      fetch(`/api/chat/message/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
        .then((r) => r.json())
        .then((data) => {
          hideTyping();
          if (data.error) throw new Error(data.error);
          addBubble(data.message, 'agent');
          if (data.availableSlots && data.availableSlots.length > 0) showSlotButtons(data.availableSlots);
          if (data.bookingLink) showBookingButton(data.bookingLink);
          if (data.urgentSent) showUrgentNotice();
          else if (data.emailSent) showSuccessNotice();
          setInputEnabled(true);
        })
        .catch(() => {
          hideTyping();
          addBubble(`Something went wrong. Please try again or call ${BUSINESS_PHONE_DISPLAY}.`, 'status');
          setInputEnabled(true);
        });
    },
  };

  // ── Alias for any legacy handlers ──
  window.aiChat = window.sarahChat;

  // Enter to send
  document.getElementById('sarah-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      window.sarahChat.sendMessage();
    }
  });
})();
