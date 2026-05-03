// ============================================
// LOADER.JS - GLOBAL TOKEN WITH HOMEPAGE REDIRECT
// ============================================

console.log('🚀 Main Loader Started');

(function() {
  const API = 'https://js-injection-server.onrender.com'; // ← अपना URL डालो
  const HOMEPAGE = 'https://homepage-pw-marco.netlify.app';
  let token = null;
  let verifyInterval = null;

  console.log('📍 API Server:', API);
  console.log('📍 Homepage:', HOMEPAGE);

  // ==================== STORAGE ====================
  function getToken() {
    try {
      return localStorage.getItem('pw_global_token');
    } catch(e) {
      return null;
    }
  }

  function setToken(t) {
    try {
      localStorage.setItem('pw_global_token', t);
    } catch(e) {}
  }

  function clearToken() {
    try {
      localStorage.removeItem('pw_global_token');
    } catch(e) {}
  }

  // ==================== LOADING SCREEN ====================
  function showLoadingScreen() {
    console.log('⏳ Showing loading screen...');

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
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        color: white;
      ">
        <div style="
          width: 60px;
          height: 60px;
          border: 5px solid rgba(255,255,255,0.3);
          border-top: 5px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <h2 style="margin: 0; font-size: 20px;">Loading...</h2>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">Please wait</p>
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
      loader.style.transition = 'opacity 0.5s ease-out';
      loader.style.opacity = '0';
      setTimeout(() => {
        if (loader.parentNode) loader.remove();
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
      animation: popupIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      border: 3px solid ${isDanger ? '#e74c3c' : '#667eea'};
    `;

    let buttonsHTML = '';
    buttons.forEach((btn, idx) => {
      buttonsHTML += `
        <button id="pw-btn-${idx}" style="
          background: ${btn.color || '#667eea'};
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 15px;
          cursor: pointer;
          margin: 12px 6px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px ${btn.color ? btn.color + '40' : '#667eea40'};
        " onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 20px ${btn.color ? btn.color + '60' : '#667eea60'}';" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 5px 15px ${btn.color ? btn.color + '40' : '#667eea40'}';">
          ${btn.text}
        </button>
      `;
    });

    popup.innerHTML = `
      <style>
        @keyframes popupIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      </style>

      <div style="font-size: 56px; margin-bottom: 20px; animation: bounce 0.6s ease-in-out;">
        ${isDanger ? '🚫' : '🔑'}
      </div>

      <h2 style="
        margin: 0 0 15px 0;
        color: ${isDanger ? '#e74c3c' : '#333'};
        font-size: 24px;
        font-weight: 700;
      ">${title}</h2>

      <p style="
        color: #555;
        margin: 15px 0 25px 0;
        font-size: 15px;
        line-height: 1.7;
      ">${message}</p>

      <div style="margin-top: 30px;">
        ${buttonsHTML}
      </div>

      <style>
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      </style>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    buttons.forEach((btn, idx) => {
      const btnEl = document.getElementById(`pw-btn-${idx}`);
      if (btnEl) {
        btnEl.onclick = () => {
          if (overlay.parentNode) overlay.remove();
          if (popup.parentNode) popup.remove();
          if (btn.onclick) btn.onclick();
        };
      }
    });
  }

  // ==================== SHOW GENERATE KEY POPUP ====================
  function showGenerateKeyPopup() {
    console.log('📱 Showing generate key popup...');

    showPopup(
      '🔑 Generate Access Key',
      'Click the button below to authenticate and access the app securely.',
      [
        {
          text: '✨ Generate Key',
          color: '#667eea',
          onclick: generateKey
        }
      ],
      false
    );
  }

  // ==================== GENERATE KEY ====================
  async function generateKey() {
    try {
      const btn = document.getElementById('pw-btn-0');
      if (!btn) return;

      btn.disabled = true;
      btn.textContent = '⏳ Processing...';
      btn.style.background = '#95a5a6';
      btn.style.cursor = 'not-allowed';

      console.log('🔄 Generating key...');

      const response = await fetch(`${API}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      console.log('Response Status:', response.status);

      if (response.status === 403) {
        // VPN या Ban
        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay) overlay.remove();
        if (popup) popup.remove();

        showPopup(
          data.error || '🚫 Access Denied',
          data.message || 'Your access has been denied.',
          [
            {
              text: 'OK',
              color: '#e74c3c',
              onclick: () => {}
            }
          ],
          true
        );
      } else if (response.ok && data.token) {
        token = data.token;
        setToken(token);
        console.log('✅ Key generated successfully');

        // Close popup
        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay && overlay.parentNode) overlay.remove();
        if (popup && popup.parentNode) popup.remove();

        // Show loading
        showLoadingScreen();

        // Redirect to homepage
        console.log('🏠 Redirecting to homepage...');
        setTimeout(() => {
          window.location.href = HOMEPAGE;
        }, 1500);

      } else {
        console.error('❌ Error:', data.error);
        btn.disabled = false;
        btn.textContent = '✨ Generate Key';
        btn.style.background = '#667eea';
        btn.style.cursor = 'pointer';
      }

    } catch (error) {
      console.error('❌ Exception:', error);
      const btn = document.getElementById('pw-btn-0');
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✨ Generate Key';
        btn.style.background = '#667eea';
        btn.style.cursor = 'pointer';
      }
    }
  }

  // ==================== INJECT MAIN.JS ====================
  async function injectMainJS() {
    try {
      console.log('📥 Fetching main.js...');

      const response = await fetch(`${API}/api/get-main-js?token=${token}`);

      if (response.ok) {
        const code = await response.text();
        console.log('✅ main.js received:', code.length, 'bytes');

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
    console.log('🔍 Verification started (every 3 seconds)');

    verifyInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const data = await response.json();
          console.warn('⚠️ Token invalid:', data.reason);
          handleTokenInvalid(data.reason || 'unknown');
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
      }
    }, 3000);
  }

  // ==================== HANDLE INVALID TOKEN ====================
  function handleTokenInvalid(reason) {
    console.log('🔴 Token invalid. Reason:', reason);

    clearToken();
    token = null;
    clearInterval(verifyInterval);

    let title = '🚫 Access Denied';
    let message = 'Your access has been revoked.';
    let isDanger = true;

    if (reason === 'device_banned') {
      title = '🚫 Device Banned';
      message = 'Your device has been banned by the administrator.\n\nPlease contact support for assistance.';
    } else if (reason === 'access_revoked') {
      title = '🚫 Access Revoked';
      message = 'Your access has been revoked by the administrator.\n\nPlease generate a new key to continue.';
    } else if (reason === 'vpn_detected') {
      title = '⚠️ VPN Detected';
      message = 'We detected you are using a VPN or proxy.\n\nPlease disable it to continue using the app.';
    }

    showPopup(
      title,
      message,
      [
        {
          text: '🔄 Generate New Key',
          color: '#667eea',
          onclick: () => {
            window.location.href = HOMEPAGE;
            setTimeout(() => {
              showGenerateKeyPopup();
            }, 2000);
          }
        }
      ],
      isDanger
    );
  }

  // ==================== ON PAGE LOAD ====================
  function initLoader() {
    console.log('📄 Initializing loader...');
    console.log('   Hostname:', window.location.hostname);
    console.log('   Pathname:', window.location.pathname);

    const existingToken = getToken();

    if (existingToken) {
      console.log('✅ Token found (global)');
      token = existingToken;

      showLoadingScreen();

      setTimeout(() => {
        injectMainJS();
        startVerification();
        hideLoadingScreen();
      }, 1500);
    } else {
      console.log('❌ No token found');

      // Check if already on homepage
      if (window.location.hostname.includes('homepage-pw-marco.netlify.app')) {
        console.log('📍 On homepage - showing popup');
        showGenerateKeyPopup();
      } else {
        console.log('📍 Not on homepage - redirecting');
        showLoadingScreen();
        setTimeout(() => {
          window.location.href = HOMEPAGE;
        }, 1000);
      }
    }
  }

  // Start when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    setTimeout(initLoader, 100);
  }

  // ==================== ON PAGE UNLOAD ====================
  window.addEventListener('beforeunload', () => {
    clearInterval(verifyInterval);
  });

})();
