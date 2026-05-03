// ============================================
// LOADER.JS - COMPLETE & FINAL
// ============================================

console.log('🚀 Main Loader Started');

(function() {
  const API = 'https://js-injection-server.onrender.com'; // ← अपना URL डालो
  const HOMEPAGE = 'https://homepage-pw-marco.netlify.app';
  let token = null;
  let verifyInterval = null;
  let isGenerating = false;

  console.log('📍 API:', API);
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
      loader.style.transition = 'opacity 0.5s';
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
          transition: all 0.3s;
          box-shadow: 0 5px 15px ${btn.color ? btn.color + '40' : '#667eea40'};
        ">
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
      <div style="font-size: 56px; margin-bottom: 20px; animation: bounce 0.6s;">
        ${isDanger ? '🚫' : '🔑'}
      </div>
      <h2 style="margin: 0 0 15px 0; color: ${isDanger ? '#e74c3c' : '#333'}; font-size: 24px; font-weight: 700;">
        ${title}
      </h2>
      <p style="color: #555; margin: 15px 0 25px 0; font-size: 15px; line-height: 1.7;">
        ${message}
      </p>
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
        btnEl.onmouseover = function() {
          this.style.transform = 'translateY(-3px)';
        };
        btnEl.onmouseout = function() {
          this.style.transform = 'translateY(0)';
        };
        btnEl.onclick = () => {
          if (overlay.parentNode) overlay.remove();
          if (popup.parentNode) popup.remove();
          if (btn.onclick) btn.onclick();
        };
      }
    });
  }

  // ==================== GENERATE KEY POPUP ====================
  function showGenerateKeyPopup() {
    console.log('📱 Showing generate key popup');
    isGenerating = false;

    showPopup(
      '🔑 Generate Access Key',
      'Click the button to authenticate and access the app.',
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
    if (isGenerating) {
      console.log('⚠️ Already generating...');
      return;
    }

    isGenerating = true;

    try {
      console.log('🔄 Starting key generation...');

      const btn = document.getElementById('pw-btn-0');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ Processing...';
      }

      console.log('📤 Sending request to:', `${API}/api/generate-key`);

      const response = await fetch(`${API}/api/generate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      console.log('📥 Response Status:', response.status);

      const data = await response.json();
      console.log('📥 Response Data:', data);

      if (response.status === 403) {
        console.log('❌ Access Denied');

        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay) overlay.remove();
        if (popup) popup.remove();

        showPopup(
          data.error || '🚫 Access Denied',
          data.message || 'Your access has been denied.',
          [{ text: 'OK', color: '#e74c3c', onclick: () => {} }],
          true
        );

        isGenerating = false;

      } else if (response.ok && data.success && data.token) {
        console.log('✅ Key generated successfully');
        token = data.token;
        setToken(token);

        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay && overlay.parentNode) overlay.remove();
        if (popup && popup.parentNode) popup.remove();

        console.log('⏳ Showing loading screen');
        showLoadingScreen();

        setTimeout(() => {
          console.log('🏠 Redirecting to homepage');
          window.location.href = HOMEPAGE;
        }, 1500);

      } else {
        console.error('❌ Error:', data);

        if (btn) {
          btn.disabled = false;
          btn.textContent = '✨ Generate Key';
        }

        isGenerating = false;
      }

    } catch (error) {
      console.error('❌ Exception:', error);

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
      console.log('📥 Fetching main.js');

      const response = await fetch(`${API}/api/get-main-js?token=${token}`);

      if (response.ok) {
        const code = await response.text();
        console.log('✅ main.js received:', code.length, 'bytes');

        const script = document.createElement('script');
        script.id = 'pw-main-script';
        script.textContent = code;
        document.body.appendChild(script);

        console.log('✅ main.js injected!');
      }
    } catch (error) {
      console.error('❌ Injection error:', error);
    }
  }

  // ==================== VERIFICATION ====================
  function startVerification() {
    console.log('🔍 Verification started');

    verifyInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const data = await response.json();
          console.warn('⚠️ Token invalid');
          handleTokenInvalid(data.reason);
        }
      } catch (error) {
        console.error('❌ Verification error:', error);
      }
    }, 3000);
  }

  // ==================== HANDLE INVALID TOKEN ====================
  function handleTokenInvalid(reason) {
    clearToken();
    token = null;
    clearInterval(verifyInterval);

    let title = '🚫 Access Denied';
    let message = 'Your access has been revoked.';

    if (reason === 'device_banned') {
      title = '🚫 Device Banned';
      message = 'Your device has been banned by administrator.';
    } else if (reason === 'access_revoked') {
      title = '🚫 Access Revoked';
      message = 'Your access has been revoked by administrator.';
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
          }
        }
      ],
      true
    );
  }

  // ==================== ON PAGE LOAD ====================
  function initLoader() {
    console.log('📄 Initializing...');

    const existingToken = getToken();

    if (existingToken) {
      console.log('✅ Token found');
      token = existingToken;

      showLoadingScreen();

      setTimeout(() => {
        injectMainJS();
        startVerification();
        hideLoadingScreen();
      }, 1500);
    } else {
      console.log('❌ No token');

      if (window.location.hostname.includes('homepage-pw-marco.netlify.app')) {
        console.log('📍 On homepage');
        showGenerateKeyPopup();
      } else {
        console.log('📍 Redirecting to homepage');
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
