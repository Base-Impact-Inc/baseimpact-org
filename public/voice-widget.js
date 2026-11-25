/* Base Impact — free browser voice/text helper.
   No API keys, no per-minute fees. Questions go to the Twilio Function /webqa.
   Add <script defer src="/voice-widget.js"></script> to the site layout. */
(function () {
  'use strict';
  var ENDPOINT = 'https://base-impact-helper-2977.twil.io/webqa';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var TTS = 'speechSynthesis' in window;

  var css = document.createElement('style');
  css.textContent = [
    '#bi-ai-launch{position:fixed;bottom:5.6rem;right:1.5rem;z-index:9998;display:flex;align-items:center;gap:.5rem;padding:.7rem 1.1rem;border:0;border-radius:999px;background:#1717e5;color:#fff;font:700 .9rem system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.35)}',
    '#bi-ai-panel{position:fixed;bottom:9.2rem;right:1.5rem;z-index:9998;width:min(370px,calc(100vw - 3rem));max-height:min(70vh,560px);display:none;flex-direction:column;border-radius:16px;background:#101a15;color:#f5f5f0;box-shadow:0 18px 60px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.14);font:14px/1.45 system-ui,sans-serif;overflow:hidden}',
    '#bi-ai-panel.open{display:flex}',
    '#bi-ai-head{padding:.9rem 1rem;background:#183326;font-weight:700;display:flex;justify-content:space-between;align-items:center}',
    '#bi-ai-head button{background:transparent;border:0;color:inherit;font-size:1.3rem;cursor:pointer;line-height:1}',
    '#bi-ai-log{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.65rem;min-height:160px}',
    '#bi-ai-log .bi-msg{padding:.6rem .8rem;border-radius:12px;max-width:92%;white-space:pre-wrap}',
    '#bi-ai-log .bi-msg.user{align-self:flex-end;background:#2a4a39}',
    '#bi-ai-log .bi-msg.bot{align-self:flex-start;background:#243029}',
    '#bi-ai-urgent{padding:.55rem 1rem;font-size:.82rem;background:#3a2a1d;color:#ffdca8}',
    '#bi-ai-urgent a{color:#ffe9b0;font-weight:700}',
    '#bi-ai-form{display:flex;gap:.5rem;padding:.75rem;border-top:1px solid rgba(255,255,255,.12)}',
    '#bi-ai-input{flex:1;min-width:0;padding:.6rem .7rem;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:#1b2620;color:#fff;font:inherit}',
    '#bi-ai-form button{border:0;border-radius:10px;padding:.55rem .8rem;background:var(--color-accent,#f4d96c);color:#0f1a14;font-weight:700;cursor:pointer}',
    '#bi-ai-mic{background:#fff!important;color:#163222!important}',
    '#bi-ai-mic.listening{background:#e02020!important;color:#fff!important;animation:pulse 1s infinite}',
    '#bi-ai-mic.error{background:#f44!important;color:#fff!important}',
    '#bi-ai-mic.unsupported{background:#666!important;color:#fff!important;cursor:not-allowed}',
    '@keyframes pulse{0%{opacity:1}50%{opacity:.5}100%{opacity:1}}',
    '#bi-ai-opts{display:flex;gap:1rem;padding:0 .75rem .65rem;font-size:.78rem;color:#cbd8d0}',
    '#bi-ai-opts label{display:flex;align-items:center;gap:.3rem;cursor:pointer}',
    '.bi-toast{position:fixed;bottom:5.6rem;right:1.5rem;z-index:9999;padding:.75rem 1rem;background:#183326;color:#f5f5f0;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.35);font:13px/1.4 system-ui,sans-serif;animation:slideUp .3s ease}',
    '@keyframes slideUp{from{transform:translateY(1rem);opacity:0}to{transform:translateY(0);opacity:1}}'
  ].join('');
  document.head.appendChild(css);

  var launch = document.createElement('button');
  launch.id = 'bi-ai-launch';
  launch.type = 'button';
  launch.setAttribute('aria-expanded', 'false');
  launch.textContent = '💬 Ask AI about Base Impact';

  var panel = document.createElement('div');
  panel.id = 'bi-ai-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Ask Base Impact AI');
  panel.innerHTML =
    '<div id="bi-ai-head"><span>Ask Base Impact AI</span><button type="button" aria-label="Close">×</button></div>' +
    '<div id="bi-ai-urgent">Need urgent help? <a href="tel:211">Call 211 — free, 24/7</a></div>' +
    '<div id="bi-ai-log"><div class="bi-msg bot">Hi! I can answer questions about food and shelter help, devices, internet, job and computer skills, our nonprofits support, and donating. Ask me anything, or use the 211 link for urgent needs.</div></div>' +
    '<div id="bi-ai-opts"><label><input type="checkbox" id="bi-ai-voice"' + (TTS ? ' checked' : '') + '> Speak replies</label></div>' +
    '<form id="bi-ai-form">' +
      (SR ? '<button type="button" id="bi-ai-mic" title="Speak your question">🎤</button>' : '') +
      '<input id="bi-ai-input" autocomplete="off" placeholder="Type your question…" aria-label="Your question">' +
      '<button type="submit">Send</button>' +
    '</form>';

  document.body.appendChild(launch);
  document.body.appendChild(panel);

  var log = panel.querySelector('#bi-ai-log');
  var input = panel.querySelector('#bi-ai-input');
  var voice = panel.querySelector('#bi-ai-voice');
  var mic = panel.querySelector('#bi-ai-mic');
  var form = panel.querySelector('#bi-ai-form');

  function addMsg(who, text) {
    var d = document.createElement('div');
    d.className = 'bi-msg ' + who;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function speak(text) {
    if (!voice || !voice.checked || !TTS) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 1.03;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function showToast(msg, type) {
    var t = document.createElement('div');
    t.className = 'bi-toast' + (type ? ' ' + type : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 4000);
  }
  function ask(text) {
    text = (text || '').trim();
    if (!text) return;
    addMsg('user', text);
    input.value = '';
    var pending = addMsg('bot', 'Thinking…');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: text })
    }).then(function (r) { return r.json(); }).then(function (d) {
      pending.textContent = d.answer || 'Sorry, I could not answer that. Please call 321 323 0999.';
      log.scrollTop = log.scrollHeight;
      speak(pending.textContent);
    }).catch(function () {
      pending.textContent = 'I could not reach the helper just now. Please call 321 323 0999, or dial 211 for urgent help.';
    });
  }

  launch.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    launch.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) input.focus();
    else if (TTS) window.speechSynthesis.cancel();
  });
  panel.querySelector('#bi-ai-head button').addEventListener('click', function () {
    panel.classList.remove('open');
    launch.setAttribute('aria-expanded', 'false');
    if (TTS) window.speechSynthesis.cancel();
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });

  if (SR) {
    var rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = function (e) {
      var text = e.results[0][0].transcript;
      input.value = text;
      ask(text);
    };
    rec.onerror = function (e) {
      mic.textContent = '🎤';
      mic.classList.remove('listening');
      var msg = 'Speech recognition error';
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        msg = 'Microphone access denied. Please allow microphone access in your browser settings.';
      } else if (e.error === 'no-speech') {
        msg = 'No speech detected. Please try again.';
      } else if (e.error === 'network') {
        msg = 'Network error. Please check your connection.';
      }
      mic.classList.add('error');
      showToast(msg, 'error');
      setTimeout(function () { mic.classList.remove('error'); }, 3000);
    };
    rec.onend = function () {
      mic.textContent = '🎤';
      mic.classList.remove('listening');
    };
    mic.addEventListener('click', function () {
      if (TTS) window.speechSynthesis.cancel();
      try {
        rec.start();
        mic.textContent = '🔴';
        mic.classList.add('listening');
        mic.title = 'Listening… click to stop';
      } catch (e) {
        mic.textContent = '🎤';
        mic.classList.remove('listening');
        showToast('Could not start microphone. Please check permissions.', 'error');
      }
    });
  } else if (mic) {
    // SpeechRecognition not supported in this browser
    mic.textContent = '❌';
    mic.title = 'Speech recognition not supported in this browser';
    mic.classList.add('unsupported');
    mic.disabled = true;
    showToast('Voice input not supported in this browser. Use Chrome, Edge, or Safari.', 'error');
  }
})();