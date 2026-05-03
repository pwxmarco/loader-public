// ============================================
// LOADER.JS - DEEP FIXED
// ============================================

console.clear();
console.log('🚀 LOADER.JS STARTED');

(function() {
  const API = 'https://js-injection-server.onrender.com'; // ← UPDATE यहाँ
  const HOMEPAGE = 'https://homepage-pw-marco.netlify.app';
  let token = null;
  let verifyInterval = null;
  let isGenerating = false;

  const log = (msg, type = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${msg}`);
  };

  log(`API: ${API}`, 'info');
  log(`Homepage: ${HOMEPAGE}`, 'info');

  // ==================== STORAGE ====================
  function getToken() {
    try {
      const t = localStorage.getItem('pw_global_token');
      if (t) log(`Token found in storage`, 'success');
      return t;
    } catch(e) {
      log(`Storage read error: ${e.message}`, 'error');
      return null;
    }
  }

  function setToken(t) {
    try {
      localStorage.setItem('pw_global_token', t);
      log(`Token saved to storage`, 'success');
    } catch(e) {
      log(`Storage write error: ${e.message}`, 'error');
    }
  }

  function clearToken() {
    try {
      localStorage.removeItem('pw_global_token');
    } catch(e) {}
  }

  // ==================== LOADING SCREEN ====================
  function showLoadingScreen() {
    const existing = document.getElementById('pw-loading-screen');
    if (existing) existing.remove();

    const loader = document.createElement('div');
    loader.id = 'pw-loading-screen';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `;

    loader.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; color: white;">
        <div style="width: 60px; height: 60px; border: 5px solid rgba(255,255,255,0.3); border-top: 5px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <h2 style="margin: 0; font-size: 20px;">Loading...</h2>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">Authenticating</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.insertBefore(loader, document.body.firstChild);
  }

  function hideLoadingScreen() {
    const loader = document.getElementById('pw-loading-screen');
    if (loader) {
      loader.style.transition = 'opacity 0.5s';
      loader.style.opacity = '0';
      setTimeout(() => {
        if (loader && loader.parentNode) loader.remove();
      }, 500);
    }
  }

  // ==================== POPUP ====================
  function showPopup(title, message, buttons, isDanger = false) {
    const existing = document.getElementById('pw-popup');
    const existingOverlay = document.getElementById('pw-overlay');
    if (existing) existing.remove();
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pw-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 999998;
      backdrop-filter: blur(8px);
    `;

    const popup = document.createElement('div');
    popup.id = 'pw-popup';
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: white;
      padding: 45px;
      border-radius: 25px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
      z-index: 999999;
      text-align: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      max-width: 500px;
      width: 92%;
      animation: popupIn 0.4s ease-out forwards;
      border: 3px solid ${isDanger ? '#e74c3c' : '#667eea'};
    `;

    let buttonsHTML = '';
    buttons.forEach((btn, idx) => {
      buttonsHTML += `<button id="pw-btn-${idx}" style="background: ${btn.color || '#667eea'}; color: white; border: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; cursor: pointer; margin: 12px 6px; font-weight: 600; transition: all 0.3s;">${btn.text}</button>`;
    });

    popup.innerHTML = `
      <style>
        @keyframes popupIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      </style>
      <div style="font-size: 56px; margin-bottom: 20px;">${isDanger ? '🚫' : '🔑'}</div>
      <h2 style="margin: 0 0 15px 0; color: ${isDanger ? '#e74c3c' : '#333'}; font-size: 24px; font-weight: 700;">${title}</h2>
      <p style="color: #555; margin: 15px 0 25px 0; font-size: 15px; line-height: 1.7;">${message}</p>
      <div style="margin-top: 30px;">${buttonsHTML}</div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    buttons.forEach((btn, idx) => {
      const btnEl = document.getElementById(`pw-btn-${idx}`);
      if (btnEl) {
        btnEl.onclick = () => {
          if (overlay && overlay.parentNode) overlay.remove();
          if (popup && popup.parentNode) popup.remove();
          if (btn.onclick) btn.onclick();
        };
      }
    });
  }

  // ==================== GENERATE KEY POPUP ====================
  function showGenerateKeyPopup() {
    log(`Showing generate key popup`, 'info');
    isGenerating = false;

    showPopup(
      '🔑 Generate Access Key',
      'Click to authenticate and access.',
      [{ text: '✨ Generate Key', color: '#667eea', onclick: generateKey }],
      false
    );
  }

  // ==================== GENERATE KEY ====================
  async function generateKey() {
    if (isGenerating) {
      log(`Already generating...`, 'warn');
      return;
    }

    isGenerating = true;
    log(`Generating key...`, 'info');

    try {
      const btn = document.getElementById('pw-btn-0');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Generating...';
      }

      log(`POST ${API}/api/generate-key`, 'debug');

      const response = await fetch(`${API}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      log(`Response status: ${response.status}`, 'debug');
      const data = await response.json();
      log(`Response data: ${JSON.stringify(data)}`, 'debug');

      if (response.status === 403) {
        log(`Access denied: ${data.reason}`, 'error');

        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay) overlay.remove();
        if (popup) popup.remove();

        showPopup(data.error, data.message, [{ text: 'OK', color: '#e74c3c' }], true);
        isGenerating = false;

      } else if (response.ok && data.success && data.token) {
        log(`Key generated successfully`, 'success');
        token = data.token;
        setToken(token);

        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay && overlay.parentNode) overlay.remove();
        if (popup && popup.parentNode) popup.remove();

        showLoadingScreen();

        setTimeout(() => {
          log(`Redirecting to homepage`, 'info');
          window.location.href = HOMEPAGE;
        }, 1500);

      } else {
        log(`Error: ${data.error}`, 'error');

        if (btn) {
          btn.disabled = false;
          btn.textContent = '✨ Generate Key';
        }

        isGenerating = false;
      }

    } catch (error) {
      log(`Exception: ${error.message}`, 'error');

      const btn = document.getElementById('pw-btn-0');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✨ Generate Key';
      }

      isGenerating = false;
    }
  }

  // ==================== INJECT MAIN.JS ====================
  async function injectMainJS() {
    try {
      log(`Fetching main.js`, 'info');

      const response = await fetch(`${API}/api/get-main-js?token=${token}`);

      if (response.ok) {
        const code = await response.text();
        log(`main.js received: ${code.length} bytes`, 'success');

        const script = document.createElement('script');
        script.id = 'pw-main-script';
        script.textContent = code;
        document.body.appendChild(script);

        log(`main.js injected`, 'success');
      } else {
        log(`Failed to fetch main.js: ${response.status}`, 'error');
      }
    } catch (error) {
      log(`Injection error: ${error.message}`, 'error');
    }
  }

  // ==================== VERIFICATION ====================
  function startVerification() {
    log(`Verification started`, 'info');

    verifyInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const data = await response.json();
          log(`Token invalid: ${data.reason}`, 'warn');
          handleTokenInvalid(data.reason);
        }
      } catch (error) {
        log(`Verification error: ${error.message}`, 'error');
      }
    }, 3000);
  }

  // ==================== HANDLE INVALID ====================
  function handleTokenInvalid(reason) {
    clearToken();
    token = null;
    clearInterval(verifyInterval);

    let title = '🚫 Access Denied';
    let message = 'Your access has been revoked.';

    if (reason === 'device_banned') {
      title = '🚫 Device Banned';
      message = 'Your device is banned.';
    }

    showPopup(
      title,
      message,
      [{ text: '🔄 Generate New Key', color: '#667eea', onclick: () => { window.location.href = HOMEPAGE; } }],
      true
    );
  }

  // ==================== INIT ====================
  function initLoader() {
    log(`Initializing...`, 'info');

    const existingToken = getToken();

    if (existingToken) {
      log(`Token exists`, 'success');
      token = existingToken;

      showLoadingScreen();

      setTimeout(() => {
        injectMainJS();
        startVerification();
        hideLoadingScreen();
      }, 1500);
    } else {
      log(`No token`, 'warn');

      if (window.location.hostname.includes('homepage-pw-marco.netlify.app')) {
        log(`On homepage`, 'info');
        showGenerateKeyPopup();
      } else {
        log(`Redirecting to homepage`, 'info');
        showLoadingScreen();
        setTimeout(() => {
          window.location.href = HOMEPAGE;
        }, 1000);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    setTimeout(initLoader, 100);
  }

  window.addEventListener('beforeunload', () => {
    clearInterval(verifyInterval);
  });

})();
