// ============================================
// LOADER.JS - WITH LOADING SCREEN & FEATURES
// ============================================

console.log('🚀 Main Loader Started');

(function() {
  const API = 'https://js-injection-server.onrender.com'; // ← अपना URL
  let token = null;
  let verifyInterval = null;
  let currentDomain = getDomain();

  console.log('📍 API Server:', API);
  console.log('📍 Current Domain:', currentDomain);

  // ==================== GET DOMAIN ====================
  function getDomain() {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  }

  // ==================== STORAGE ====================
  function getToken() {
    try {
      const stored = localStorage.getItem(`pw_token_${currentDomain}`);
      return stored;
    } catch(e) {
      return null;
    }
  }

  function setToken(t) {
    try {
      localStorage.setItem(`pw_token_${currentDomain}`, t);
    } catch(e) {}
  }

  function clearToken() {
    try {
      localStorage.removeItem(`pw_token_${currentDomain}`);
    } catch(e) {}
  }

  // ==================== LOADING SCREEN ====================
  function showLoadingScreen() {
    console.log('⏳ Showing loading screen...');

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

    document.body.appendChild(loader);
  }

  function hideLoadingScreen() {
    const loader = document.getElementById('pw-loading-screen');
    if (loader) {
      loader.style.transition = 'opacity 0.5s ease-out';
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }

  // ==================== POPUP ====================
  function showPopup(title, message, buttons, isDanger = false) {
    if (document.getElementById('pw-popup')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pw-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999998;
      backdrop-filter: blur(5px);
    `;

    const popup = document.createElement('div');
    popup.id = 'pw-popup';
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
      z-index: 999999;
      text-align: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      max-width: 500px;
      width: 90%;
      animation: popupIn 0.3s ease-out forwards;
      border: 2px solid ${isDanger ? '#e74c3c' : '#667eea'};
    `;

    let buttonsHTML = '';
    buttons.forEach((btn, idx) => {
      buttonsHTML += `
        <button id="pw-btn-${idx}" style="
          background: ${btn.color || '#667eea'};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          margin: 10px 5px;
          font-weight: bold;
          transition: all 0.3s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          ${btn.text}
        </button>
      `;
    });

    popup.innerHTML = `
      <style>
        @keyframes popupIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      </style>

      <div style="font-size: 48px; margin-bottom: 15px;">
        ${isDanger ? '🚫' : '🔑'}
      </div>
      
      <h2 style="
        margin: 0 0 10px 0;
        color: ${isDanger ? '#e74c3c' : '#333'};
        font-size: 22px;
      ">${title}</h2>
      
      <p style="
        color: #666;
        margin: 15px 0;
        font-size: 14px;
        line-height: 1.6;
      ">${message}</p>
      
      <div style="margin-top: 30px;">
        ${buttonsHTML}
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    buttons.forEach((btn, idx) => {
      const btnEl = document.getElementById(`pw-btn-${idx}`);
      if (btnEl) {
        btnEl.onclick = () => {
          overlay.remove();
          popup.remove();
          if (btn.onclick) btn.onclick();
        };
      }
    });
  }

  // ==================== GENERATE KEY POPUP ====================
  function showGenerateKeyPopup() {
    console.log('📱 Showing generate key popup...');

    const overlay = document.createElement('div');
    overlay.id = 'pw-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999998;
      backdrop-filter: blur(5px);
    `;

    const popup = document.createElement('div');
    popup.id = 'pw-popup';
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
      z-index: 999999;
      text-align: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      max-width: 500px;
      width: 90%;
      animation: popupIn 0.3s ease-out forwards;
      border: 3px solid #667eea;
    `;

    popup.innerHTML = `
      <style>
        @keyframes popupIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      </style>

      <div style="
        font-size: 60px;
        margin-bottom: 15px;
        animation: bounce 0.6s ease-in-out infinite;
      ">🔑</div>

      <h2 style="
        margin: 0 0 10px 0;
        color: #333;
        font-size: 24px;
        font-weight: bold;
      ">Generate Access Key</h2>
      
      <p style="
        color: #666;
        margin: 15px 0;
        font-size: 14px;
        line-height: 1.6;
      ">
        Click below to authenticate and access the app
      </p>
      
      <button id="pw-gen-btn" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 14px 40px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        margin-top: 20px;
        transition: all 0.3s;
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        Generate Key
      </button>
      
      <p id="pw-status" style="
        color: #e74c3c;
        margin-top: 15px;
        font-size: 13px;
        min-height: 20px;
      "></p>

      <style>
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    document.getElementById('pw-gen-btn').onclick = generateKey;
  }

  // ==================== GENERATE KEY ====================
  async function generateKey() {
    try {
      const btn = document.getElementById('pw-gen-btn');
      const status = document.getElementById('pw-status');

      btn.disabled = true;
      btn.textContent = '⏳ Processing...';
      btn.style.background = '#95a5a6';
      status.textContent = '';

      console.log('🔄 Generating key...');

      const response = await fetch(`${API}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      console.log('Response Status:', response.status, 'Data:', data);

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
        if (overlay) overlay.remove();
        if (popup) popup.remove();

        // Show loading
        showLoadingScreen();

        // Redirect to homepage first
        setTimeout(() => {
          window.location.href = 'https://homepage-pw-marco.netlify.app';

          // Then start verification & inject
          setTimeout(() => {
            hideLoadingScreen();
            startVerification();
            injectMainJS();
          }, 4000);
        }, 1000);

      } else {
        console.error('❌ Error:', data.error);
        status.textContent = `❌ ${data.error || 'Error'}`;
        btn.disabled = false;
        btn.textContent = 'Generate Key';
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }

    } catch (error) {
      console.error('❌ Exception:', error);
      document.getElementById('pw-status').textContent = '❌ Network error';
      document.getElementById('pw-gen-btn').disabled = false;
      document.getElementById('pw-gen-btn').textContent = 'Generate Key';
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
        console.error('❌ Failed to fetch main.js');
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
      message = 'Your device has been banned by the administrator.\n\nPlease contact support if you think this is a mistake.';
    } else if (reason === 'access_revoked') {
      title = '🚫 Access Revoked';
      message = 'Your access has been revoked by the administrator.';
    } else if (reason === 'vpn_detected') {
      title = '⚠️ VPN Detected';
      message = 'We detected you are using a VPN. Please disable it to continue.';
    } else if (reason === 'network_error') {
      title = '⚠️ Connection Error';
      message = 'Network error occurred. Please check your connection and try again.';
    }

    showPopup(
      title,
      message,
      [
        {
          text: 'Generate New Key',
          color: '#667eea',
          onclick: () => {
            // Redirect to homepage first
            window.location.href = 'https://homepage-pw-marco.netlify.app';
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
    console.log('Domain:', currentDomain);

    const existingToken = getToken();

    if (existingToken) {
      console.log('✅ Token found for domain:', currentDomain);
      token = existingToken;

      showLoadingScreen();

      setTimeout(() => {
        startVerification();
        injectMainJS();
        hideLoadingScreen();
      }, 2000);
    } else {
      console.log('❌ No token for domain:', currentDomain);
      showGenerateKeyPopup();
    }
  }

  // Start when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  // ==================== ON PAGE UNLOAD ====================
  window.addEventListener('beforeunload', () => {
    clearInterval(verifyInterval);
  });

  // ==================== REDIRECT DETECTION ====================
  let previousPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== previousPath) {
      previousPath = window.location.pathname;
      console.log('📍 Page changed to:', previousPath);

      // Don't show popup again on same domain
      if (!token) {
        showGenerateKeyPopup();
      }
    }
  }, 500);

})();
