// ============================================
// LOADER.JS v2 - UPDATED
// Host on: loader-public GitHub repo
// ============================================

(function () {
  'use strict';

  // ==================== CONFIG ====================
  const API = 'https://js-injection-server.onrender.com'; // ← Your server URL
  const TOKEN_KEY = 'pw_marco_token_v2';

  // Sites where the key remains valid — no re-prompt on these
  const ALLOWED_HOSTNAMES = [
    'pwthor.live',
    'test.pwthor.live',
    'homepage-pw-marco.netlify.app'
  ];

  // Paths on pwthor.live where key is valid
  const ALLOWED_PATHS_ON_PWTHOR = [
    '/auth',
    '/study',
    '/study/batches'
  ];

  let token = null;
  let verifyInterval = null;
  let jsInjected = false;

  // ==================== DOMAIN CHECK ====================
  function isAllowedSite() {
    const host = window.location.hostname;
    const pathName = window.location.pathname;

    if (host === 'homepage-pw-marco.netlify.app') return true;
    if (host === 'test.pwthor.live') return true;

    if (host === 'pwthor.live') {
      return ALLOWED_PATHS_ON_PWTHOR.some(p => pathName === p || pathName.startsWith(p + '/'));
    }

    return false;
  }

  // ==================== STORAGE ====================
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try { localStorage.setItem(TOKEN_KEY, t); } catch (e) { }
  }
  function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { }
  }

  // ==================== LOADING OVERLAY ====================
  function showLoadingOverlay() {
    if (document.getElementById('pw-loading-overlay')) return;

    const el = document.createElement('div');
    el.id = 'pw-loading-overlay';
    el.innerHTML = `
      <style>
        #pw-loading-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          z-index: 2147483647;
          display: flex; align-items: center; justify-content: center; flex-direction: column;
          transition: opacity 0.6s ease;
        }
        #pw-loading-overlay .pw-spinner {
          width: 54px; height: 54px;
          border: 4px solid rgba(255,255,255,0.15);
          border-top: 4px solid #a78bfa;
          border-radius: 50%;
          animation: pw-spin 0.9s linear infinite;
          margin-bottom: 22px;
        }
        #pw-loading-overlay .pw-load-title {
          color: #e2d9f3; font-size: 18px; font-weight: 600;
          font-family: 'Segoe UI', system-ui, sans-serif; letter-spacing: 0.5px;
        }
        #pw-loading-overlay .pw-load-sub {
          color: rgba(255,255,255,0.45); font-size: 13px; margin-top: 8px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        @keyframes pw-spin { to { transform: rotate(360deg); } }
      </style>
      <div class="pw-spinner"></div>
      <div class="pw-load-title">Loading Content…</div>
      <div class="pw-load-sub">Please wait a moment</div>
    `;

    // Insert at very beginning of <html> so it appears before page content
    const target = document.documentElement || document.body;
    if (target) {
      target.insertBefore(el, target.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(el));
    }
  }

  function hideLoadingOverlay() {
    // Hide after 4.5 seconds — gives enough time for JS to inject
    setTimeout(() => {
      const el = document.getElementById('pw-loading-overlay');
      if (el) {
        el.style.opacity = '0';
        setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
      }
    }, 4500);
  }

  // ==================== POPUP BASE STYLES ====================
  function injectPopupStyles() {
    if (document.getElementById('pw-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'pw-popup-styles';
    style.textContent = `
      .pw-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(12px) saturate(0.8);
        -webkit-backdrop-filter: blur(12px) saturate(0.8);
        z-index: 2147483646;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      }
      .pw-card {
        background: linear-gradient(160deg, #1e1b4b 0%, #14103a 100%);
        border: 1px solid rgba(167, 139, 250, 0.25);
        border-radius: 20px;
        padding: 44px 40px 36px;
        max-width: 440px; width: 90%;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.1) inset;
        text-align: center; color: #e2d9f3; position: relative;
        animation: pw-card-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes pw-card-in {
        from { opacity: 0; transform: scale(0.88) translateY(24px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      .pw-icon { font-size: 50px; margin-bottom: 14px; display: block; }
      .pw-card h2 {
        margin: 0 0 10px; font-size: 22px; font-weight: 700; color: #f0ebff;
        letter-spacing: -0.3px;
      }
      .pw-card p {
        color: rgba(220,210,255,0.65); font-size: 14px; line-height: 1.6; margin: 0 0 24px;
      }
      .pw-btn {
        display: block; width: 100%; padding: 14px 20px;
        background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
        color: white; border: none; border-radius: 12px;
        font-size: 15px; font-weight: 600; cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        box-shadow: 0 6px 24px rgba(124, 58, 237, 0.45);
        letter-spacing: 0.2px; margin-top: 6px;
      }
      .pw-btn:hover  { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124,58,237,0.55); }
      .pw-btn:active { transform: translateY(0); }
      .pw-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
      .pw-btn-ghost {
        background: transparent;
        border: 1px solid rgba(167,139,250,0.35);
        color: rgba(220,210,255,0.7);
        box-shadow: none; margin-top: 10px;
      }
      .pw-btn-ghost:hover { background: rgba(167,139,250,0.08); box-shadow: none; }
      .pw-status-msg {
        color: #f87171; font-size: 13px; min-height: 20px; margin-top: 14px;
      }
      .pw-badge {
        display: inline-block; padding: 4px 12px; border-radius: 20px;
        font-size: 12px; font-weight: 600; text-transform: uppercase;
        letter-spacing: 0.8px; margin-bottom: 18px;
      }
      .pw-badge-warn  { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
      .pw-badge-error { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
      .pw-badge-vpn   { background: rgba(234,88,12,0.15);  color: #fb923c; border: 1px solid rgba(234,88,12,0.3); }
      .pw-divider { border: none; border-top: 1px solid rgba(167,139,250,0.12); margin: 20px 0 16px; }
      .pw-footer { color: rgba(180,170,220,0.4); font-size: 11px; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // ==================== KEY GENERATION POPUP ====================
  function showKeyPopup() {
    if (document.getElementById('pw-key-popup')) return;
    injectPopupStyles();

    const wrap = document.createElement('div');
    wrap.id = 'pw-key-popup';
    wrap.className = 'pw-overlay';
    wrap.innerHTML = `
      <div class="pw-card">
        <span class="pw-icon">🔑</span>
        <h2>Access Required</h2>
        <p>Generate your free access key to continue. This is a one-time step — your key will be saved automatically.</p>
        <button class="pw-btn" id="pw-gen-btn">Generate Access Key</button>
        <div class="pw-status-msg" id="pw-gen-status"></div>
        <hr class="pw-divider">
        <div class="pw-footer">Your device will be registered &amp; verified securely</div>
      </div>
    `;

    document.body.appendChild(wrap);
    document.getElementById('pw-gen-btn').onclick = generateKey;
  }

  // ==================== REVOKE / BAN / BLOCK POPUP ====================
  function showBlockPopup(type, reason) {
    removeExistingPopup();
    injectPopupStyles();

    const configs = {
      access_revoked: {
        icon: '🔒',
        badge: '<span class="pw-badge pw-badge-warn">Access Revoked</span>',
        title: 'Access Has Been Revoked',
        message: reasonToMessage(reason),
        showRegenBtn: true,
      },
      device_banned: {
        icon: '🚫',
        badge: '<span class="pw-badge pw-badge-error">Device Banned</span>',
        title: 'Device Permanently Banned',
        message: 'Your device has been banned by the administrator. This action is permanent.',
        showRegenBtn: false,
      },
      vpn_detected: {
        icon: '🛡️',
        badge: '<span class="pw-badge pw-badge-vpn">VPN Detected</span>',
        title: 'VPN / Proxy Detected',
        message: 'A VPN or proxy connection was detected. Please disable it and try again to access the content.',
        showRegenBtn: true,
      },
      token_expired: {
        icon: '⏳',
        badge: '<span class="pw-badge pw-badge-warn">Session Expired</span>',
        title: 'Your Session Has Expired',
        message: 'Your 24-hour access key has expired. Generate a new key to continue.',
        showRegenBtn: true,
      }
    };

    const cfg = configs[type] || configs.access_revoked;

    const wrap = document.createElement('div');
    wrap.id = 'pw-key-popup';
    wrap.className = 'pw-overlay';
    wrap.innerHTML = `
      <div class="pw-card">
        ${cfg.badge}
        <span class="pw-icon">${cfg.icon}</span>
        <h2>${cfg.title}</h2>
        <p>${cfg.message}</p>
        ${cfg.showRegenBtn
        ? `<button class="pw-btn" id="pw-regen-btn">🔄 Generate New Key</button>
             <button class="pw-btn pw-btn-ghost" id="pw-close-btn">Dismiss</button>`
        : ''
      }
      </div>
    `;

    document.body.appendChild(wrap);

    if (cfg.showRegenBtn) {
      document.getElementById('pw-regen-btn').onclick = () => {
        clearToken();
        // Go to homepage first, key popup will appear there
        window.location.href = 'https://homepage-pw-marco.netlify.app';
      };
      const closeBtn = document.getElementById('pw-close-btn');
      if (closeBtn) closeBtn.onclick = () => removeExistingPopup();
    }
  }

  function reasonToMessage(reason) {
    const msgs = {
      admin_revoked:          'The administrator has manually revoked your access.',
      policy_violation:       'Your access was revoked due to a policy violation.',
      suspicious_activity:    'Suspicious activity was detected on your account.',
      vpn_detected:           'Access was revoked because a VPN/proxy was detected.',
      device_banned:          'Your device has been banned.',
      network_issue:          'A network issue caused your access to be revoked.',
      manual:                 'Access was manually revoked by the administrator.',
    };
    return msgs[reason] || 'Your access has been revoked. Generate a new key to continue.';
  }

  function removeExistingPopup() {
    const el = document.getElementById('pw-key-popup');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // ==================== GENERATE KEY ====================
  async function generateKey() {
    const btn = document.getElementById('pw-gen-btn');
    const status = document.getElementById('pw-gen-status');

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Processing…'; }
    if (status) status.textContent = '';

    try {
      const response = await fetch(`${API}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok && data.token) {
        token = data.token;
        setToken(token);

        removeExistingPopup();

        // Show loading overlay while JS injects
        showLoadingOverlay();

        startVerification();
        await injectMainJS();
        hideLoadingOverlay();

      } else {
        const reason = data.reason || '';
        if (reason === 'vpn_detected') {
          removeExistingPopup();
          showBlockPopup('vpn_detected', reason);
          return;
        }
        if (reason === 'device_banned') {
          removeExistingPopup();
          showBlockPopup('device_banned', reason);
          return;
        }
        if (status) status.textContent = `❌ ${data.error || 'Error generating key. Try again.'}`;
        if (btn) { btn.disabled = false; btn.textContent = 'Generate Access Key'; }
      }

    } catch (error) {
      if (status) status.textContent = '❌ Network error. Please check your connection.';
      if (btn) { btn.disabled = false; btn.textContent = 'Generate Access Key'; }
    }
  }

  // ==================== INJECT MAIN.JS ====================
  async function injectMainJS() {
    if (jsInjected) return;
    try {
      const response = await fetch(`${API}/api/get-main-js?token=${token}`);
      if (response.ok) {
        const code = await response.text();
        const script = document.createElement('script');
        script.id = 'pw-main-script';
        script.textContent = code;
        document.body.appendChild(script);
        jsInjected = true;
      }
    } catch (error) {
      console.error('[PW] Injection error:', error);
    }
  }

  // ==================== VERIFICATION ====================
  function startVerification() {
    if (verifyInterval) clearInterval(verifyInterval);

    verifyInterval = setInterval(async () => {
      if (!token) { clearInterval(verifyInterval); return; }
      try {
        const res = await fetch(`${API}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const reason = data.reason || 'access_revoked';
          const revokeReason = data.revokeReason || reason;

          clearInterval(verifyInterval);
          clearToken();
          token = null;

          // Show appropriate block popup
          if (reason === 'device_banned') {
            showBlockPopup('device_banned', revokeReason);
          } else if (reason === 'token_expired') {
            showBlockPopup('token_expired', revokeReason);
          } else {
            showBlockPopup('access_revoked', revokeReason);
          }
        }
      } catch (err) {
        // Network errors — don't revoke, just skip this ping
      }
    }, 3000);
  }

  // ==================== INIT ====================
  function init() {
    // Only run on allowed sites
    if (!isAllowedSite()) {
      // Not an allowed site — don't inject or ask for key
      return;
    }

    const storedToken = getToken();

    if (storedToken) {
      // Show loading overlay immediately — page redirect happened
      showLoadingOverlay();
      token = storedToken;

      // Verify the stored token is still valid before using it
      fetch(`${API}/api/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: storedToken })
      })
        .then(res => res.json().then(data => ({ ok: res.ok, status: res.status, data })))
        .then(({ ok, data }) => {
          if (ok) {
            // Token valid — inject JS
            startVerification();
            return injectMainJS().then(() => hideLoadingOverlay());
          } else {
            // Token invalid — show appropriate popup
            const reason = data.reason || 'access_revoked';
            const revokeReason = data.revokeReason || reason;
            clearToken();
            token = null;

            // Hide overlay and show popup
            const overlay = document.getElementById('pw-loading-overlay');
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);

            if (reason === 'device_banned') {
              showBlockPopup('device_banned', revokeReason);
            } else if (reason === 'token_expired') {
              showBlockPopup('token_expired', revokeReason);
            } else {
              showBlockPopup('access_revoked', revokeReason);
            }
          }
        })
        .catch(() => {
          // Can't reach server — hide overlay, show stored content anyway
          hideLoadingOverlay();
          startVerification();
          injectMainJS();
        });

    } else {
      // No token — show key generation popup
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showKeyPopup);
      } else {
        showKeyPopup();
      }
    }
  }

  // Run immediately (before DOMContentLoaded) so overlay appears fast
  if (document.readyState === 'loading') {
    // Show overlay right away even before DOM
    const earlyOverlay = document.createElement('div');
    earlyOverlay.id = 'pw-loading-overlay';
    earlyOverlay.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'width:100%', 'height:100%',
      'background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
      'z-index:2147483647', 'display:flex', 'align-items:center',
      'justify-content:center', 'flex-direction:column', 'transition:opacity 0.6s'
    ].join(';');
    earlyOverlay.innerHTML = `
      <style>
        @keyframes pw-spin2{to{transform:rotate(360deg)}}
        #pw-loading-overlay .s{width:54px;height:54px;border:4px solid rgba(255,255,255,.15);
          border-top:4px solid #a78bfa;border-radius:50%;animation:pw-spin2 .9s linear infinite;margin-bottom:22px;}
        #pw-loading-overlay .t{color:#e2d9f3;font-size:18px;font-weight:600;
          font-family:'Segoe UI',system-ui,sans-serif;}
        #pw-loading-overlay .sub{color:rgba(255,255,255,.4);font-size:13px;margin-top:8px;
          font-family:'Segoe UI',system-ui,sans-serif;}
      </style>
      <div class="s"></div>
      <div class="t">Loading Content…</div>
      <div class="sub">Please wait a moment</div>
    `;

    // If token exists, show overlay instantly while page loads
    if (localStorage.getItem(TOKEN_KEY)) {
      document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('pw-loading-overlay')) {
          document.body.insertBefore(earlyOverlay, document.body.firstChild);
        }
      });
    }

    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Tab visibility: resume/pause verification ──
  document.addEventListener('visibilitychange', () => {
    if (!token) return;
    if (document.hidden) {
      clearInterval(verifyInterval);
      verifyInterval = null;
    } else {
      if (!verifyInterval) startVerification();
    }
  });

})();
