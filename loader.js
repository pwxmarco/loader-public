// ============================================
// LOADER.JS - UPDATED v2.0
// ============================================

console.log('🚀 PW Marco Loader v2.0 Started');

(function () {
  const API = 'https://js-injection-server.onrender.com'; // ← apna URL

  // ✅ Allowed sites jahan token valid rahega
  const ALLOWED_HOSTS = [
    'pwthor.live',
    'test.pwthor.live',
    'homepage-pw-marco.netlify.app'
  ];

  // ✅ Allowed paths (pwthor.live ke andar sirf ye pages)
  const ALLOWED_PATHS_PWTHOR = [
    '/auth',
    '/study',
    '/study/batches',
  ];

  let token = null;
  let verifyInterval = null;

  // ==================== LOADING SCREEN ====================
  function showLoadingScreen() {
    if (document.getElementById('pw-loading-screen')) return;

    const loader = document.createElement('div');
    loader.id = 'pw-loading-screen';
    loader.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      z-index: 9999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      transition: opacity 0.5s ease;
    `;
    loader.innerHTML = `
      <style>
        @keyframes pw-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pw-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pw-spinner {
          width: 60px; height: 60px;
          border: 4px solid rgba(255,255,255,0.1);
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: pw-spin 1s linear infinite;
          margin-bottom: 24px;
        }
        .pw-loading-text {
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          letter-spacing: 2px;
          text-transform: uppercase;
          animation: pw-pulse 1.5s ease infinite;
        }
        .pw-brand {
          color: white;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .pw-tagline {
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          margin-bottom: 40px;
          letter-spacing: 1px;
        }
      </style>
      <div class="pw-brand">PW Marco</div>
      <div class="pw-tagline">SECURE ACCESS PORTAL</div>
      <div class="pw-spinner"></div>
      <div class="pw-loading-text">Verifying Access...</div>
    `;
    document.documentElement.appendChild(loader);
  }

  function hideLoadingScreen() {
    const loader = document.getElementById('pw-loading-screen');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }

  // ==================== ALLOWED SITE CHECK ====================
  function isAllowedSite() {
    const host = window.location.hostname;
    const path = window.location.pathname;

    if (host === 'homepage-pw-marco.netlify.app') return true;
    if (host === 'test.pwthor.live') return true;

    if (host === 'pwthor.live') {
      return ALLOWED_PATHS_PWTHOR.some(p => path === p || path.startsWith(p + '/'));
    }

    return false;
  }

  // ==================== STORAGE (localStorage = across tabs/pages) ====================
  function getToken() {
    try {
      return localStorage.getItem('pw_marco_token');
    } catch (e) { return null; }
  }

  function setToken(t) {
    try {
      localStorage.setItem('pw_marco_token', t);
      localStorage.setItem('pw_marco_token_time', Date.now().toString());
    } catch (e) { }
  }

  function clearToken() {
    try {
      localStorage.removeItem('pw_marco_token');
      localStorage.removeItem('pw_marco_token_time');
    } catch (e) { }
  }

  // ==================== POPUP BASE STYLES ====================
  function injectPopupStyles() {
    if (document.getElementById('pw-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'pw-popup-styles';
    style.textContent = `
      @keyframes pw-fadeIn {
        from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes pw-overlayIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes pw-shake {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        25% { transform: translate(-52%, -50%) scale(1); }
        75% { transform: translate(-48%, -50%) scale(1); }
      }
      .pw-popup-overlay {
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(8px);
        z-index: 9999998;
        animation: pw-overlayIn 0.3s ease;
      }
      .pw-popup-box {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border: 1px solid rgba(102, 126, 234, 0.3);
        border-radius: 20px;
        padding: 40px 35px;
        z-index: 9999999;
        text-align: center;
        font-family: 'Segoe UI', Arial, sans-serif;
        max-width: 440px;
        width: 92%;
        box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
        animation: pw-fadeIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        color: white;
      }
      .pw-popup-icon {
        font-size: 54px;
        margin-bottom: 12px;
        display: block;
      }
      .pw-popup-title {
        font-size: 22px;
        font-weight: 700;
        margin: 0 0 10px;
        background: linear-gradient(135deg, #667eea, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .pw-popup-desc {
        color: rgba(255,255,255,0.6);
        font-size: 13px;
        line-height: 1.6;
        margin: 0 0 24px;
      }
      .pw-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 14px 0;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        margin-bottom: 10px;
        transition: all 0.3s;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      }
      .pw-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
      }
      .pw-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
      .pw-btn-secondary {
        background: rgba(255,255,255,0.05);
        color: rgba(255,255,255,0.6);
        border: 1px solid rgba(255,255,255,0.1);
        padding: 12px 0;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s;
      }
      .pw-btn-secondary:hover {
        background: rgba(255,255,255,0.1);
        color: white;
      }
      .pw-status-text {
        color: #f87171;
        margin-top: 12px;
        font-size: 13px;
        min-height: 18px;
      }
      .pw-divider {
        border: none;
        border-top: 1px solid rgba(255,255,255,0.08);
        margin: 20px 0 16px;
      }
      .pw-footer-note {
        color: rgba(255,255,255,0.3);
        font-size: 11px;
        line-height: 1.5;
      }
      .pw-reason-badge {
        display: inline-block;
        background: rgba(248, 113, 113, 0.15);
        border: 1px solid rgba(248, 113, 113, 0.3);
        color: #f87171;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 20px;
        letter-spacing: 0.5px;
      }
    `;
    document.head.appendChild(style);
  }

  // ==================== KEY GENERATION POPUP ====================
  function showKeyGenPopup() {
    if (document.getElementById('pw-marco-popup')) return;

    injectPopupStyles();

    const overlay = document.createElement('div');
    overlay.className = 'pw-popup-overlay';
    overlay.id = 'pw-overlay';

    const popup = document.createElement('div');
    popup.id = 'pw-marco-popup';
    popup.className = 'pw-popup-box';
    popup.innerHTML = `
      <span class="pw-popup-icon">🔐</span>
      <h2 class="pw-popup-title">Access Required</h2>
      <p class="pw-popup-desc">
        Generate your secure access key to unlock the app.<br>
        Key will be valid across all authorized pages.
      </p>
      <button id="pw-gen-btn" class="pw-btn-primary">⚡ Generate Access Key</button>
      <p id="pw-status" class="pw-status-text"></p>
      <hr class="pw-divider">
      <p class="pw-footer-note">🛡️ Your device will be registered &amp; verified in real-time.<br>VPN usage is not permitted.</p>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    document.getElementById('pw-gen-btn').onclick = generateKey;
  }

  // ==================== ALERT POPUP (Revoke / Ban / VPN) ====================
  function showAlertPopup({ icon, title, reason, reasonLabel, showNewKeyBtn }) {
    // Remove existing
    removeAllPopups();
    injectPopupStyles();

    const overlay = document.createElement('div');
    overlay.className = 'pw-popup-overlay';
    overlay.id = 'pw-overlay';

    const popup = document.createElement('div');
    popup.id = 'pw-marco-popup';
    popup.className = 'pw-popup-box';

    popup.innerHTML = `
      <span class="pw-popup-icon">${icon}</span>
      <h2 class="pw-popup-title">${title}</h2>
      ${reasonLabel ? `<div class="pw-reason-badge">📋 ${reasonLabel}</div>` : ''}
      <p class="pw-popup-desc">${reason}</p>
      ${showNewKeyBtn ? `<button id="pw-newkey-btn" class="pw-btn-primary">🔄 Generate New Key</button>` : ''}
      <hr class="pw-divider">
      <p class="pw-footer-note">Contact admin if you think this is a mistake.</p>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    if (showNewKeyBtn) {
      document.getElementById('pw-newkey-btn').onclick = () => {
        removeAllPopups();
        clearToken();
        token = null;
        // Redirect to homepage first, then key popup will show there
        window.location.href = 'https://homepage-pw-marco.netlify.app';
      };
    }
  }

  // ==================== VPN POPUP ====================
  function showVPNPopup() {
    showAlertPopup({
      icon: '🚫',
      title: 'VPN Detected',
      reasonLabel: 'VPN / Proxy Blocked',
      reason: 'VPN ya Proxy use karna allowed nahi hai.<br>Please VPN band karo aur dobara try karo.',
      showNewKeyBtn: false
    });
  }

  // ==================== REMOVE ALL POPUPS ====================
  function removeAllPopups() {
    ['pw-marco-popup', 'pw-overlay', 'pw-loading-screen'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  // ==================== GENERATE KEY ====================
  async function generateKey() {
    const btn = document.getElementById('pw-gen-btn');
    const status = document.getElementById('pw-status');

    btn.disabled = true;
    btn.textContent = '⏳ Verifying...';
    if (status) status.textContent = '';

    try {
      const response = await fetch(`${API}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.reason === 'vpn_detected') {
        showVPNPopup();
        return;
      }

      if (data.reason === 'device_banned') {
        showAlertPopup({
          icon: '🚫',
          title: 'Device Banned',
          reasonLabel: 'Permanent Ban',
          reason: 'Tumhara device permanently ban kar diya gaya hai.',
          showNewKeyBtn: false
        });
        return;
      }

      if (response.ok && data.token) {
        token = data.token;
        setToken(token);
        removeAllPopups();
        showLoadingScreen();
        startVerification();
        await injectMainJS();
        setTimeout(hideLoadingScreen, 4000);
      } else {
        if (status) status.textContent = `❌ ${data.error || 'Error generating key'}`;
        btn.disabled = false;
        btn.textContent = '⚡ Generate Access Key';
      }

    } catch (error) {
      if (status) status.textContent = '❌ Network error. Try again.';
      btn.disabled = false;
      btn.textContent = '⚡ Generate Access Key';
    }
  }

  // ==================== INJECT MAIN.JS ====================
  async function injectMainJS() {
    try {
      const response = await fetch(`${API}/api/get-main-js?token=${token}`);
      if (response.ok) {
        const code = await response.text();
        const script = document.createElement('script');
        script.id = 'pw-main-script';
        script.textContent = code;
        document.body.appendChild(script);
        console.log('✅ main.js injected!');
      } else {
        console.error('❌ Failed to fetch main.js:', response.status);
      }
    } catch (error) {
      console.error('❌ Injection error:', error);
    }
  }

  // ==================== VERIFICATION ====================
  function startVerification() {
    if (verifyInterval) clearInterval(verifyInterval);

    verifyInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const data = await response.json();
          handleTokenInvalid(data.reason, data.revokeReason || null);
        }
      } catch (error) {
        // Network error - don't revoke, just skip
        console.warn('⚠️ Verification network error');
      }
    }, 3000);
  }

  // ==================== HANDLE INVALID TOKEN ====================
  function handleTokenInvalid(reason, revokeReason) {
    clearToken();
    token = null;
    clearInterval(verifyInterval);
    verifyInterval = null;

    // Remove any existing injected script
    const sc = document.getElementById('pw-main-script');
    if (sc) sc.remove();

    const configs = {
      device_banned: {
        icon: '🚫',
        title: 'Device Banned',
        reasonLabel: 'Permanent Ban',
        reason: 'Tumhara device admin ne permanently ban kar diya hai.<br>Kisi aur device se try karo.',
        showNewKeyBtn: false
      },
      access_revoked: {
        icon: '⛔',
        title: 'Access Revoked',
        reasonLabel: revokeReason || 'Admin ne Revoke kiya',
        reason: `Tumhara access revoke ho gaya hai.<br><strong>Reason:</strong> ${revokeReason || 'Admin action'}.<br>Naya key generate karo ya admin se contact karo.`,
        showNewKeyBtn: true
      },
      vpn_detected: {
        icon: '🚫',
        title: 'VPN Detected',
        reasonLabel: 'VPN / Proxy Blocked',
        reason: 'VPN detect hua. Please VPN band karo phir try karo.',
        showNewKeyBtn: false
      },
      token_expired: {
        icon: '⏰',
        title: 'Key Expired',
        reasonLabel: 'Session Expire',
        reason: 'Tumhari access key expire ho gayi hai. Naya key generate karo.',
        showNewKeyBtn: true
      }
    };

    const config = configs[reason] || {
      icon: '⚠️',
      title: 'Access Blocked',
      reasonLabel: reason || 'Unknown',
      reason: 'Access block ho gaya. Naya key generate karo.',
      showNewKeyBtn: true
    };

    showAlertPopup(config);
  }

  // ==================== INIT ====================
  function initLoader() {
    // Agar allowed site nahi hai, kuch mat karo
    if (!isAllowedSite()) {
      console.log('🔕 Not an allowed site. Loader inactive.');
      return;
    }

    // Instant loading screen
    showLoadingScreen();

    const existingToken = getToken();

    if (existingToken) {
      token = existingToken;

      // Verify token first before showing content
      fetch(`${API}/api/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).then(async (res) => {
        if (res.ok) {
          startVerification();
          await injectMainJS();
          setTimeout(hideLoadingScreen, 4000);
        } else {
          const data = await res.json();
          hideLoadingScreen();
          handleTokenInvalid(data.reason, data.revokeReason);
        }
      }).catch(() => {
        // Network error on verify - show content anyway
        startVerification();
        injectMainJS().then(() => setTimeout(hideLoadingScreen, 4000));
      });

    } else {
      // No token - show key gen popup
      hideLoadingScreen();
      showKeyGenPopup();
    }
  }

  // Start immediately
  if (document.readyState === 'loading') {
    // Show loading screen before DOM ready
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  // Page visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && token) {
      if (!verifyInterval) startVerification();
    } else {
      if (verifyInterval) {
        clearInterval(verifyInterval);
        verifyInterval = null;
      }
    }
  });

})();
