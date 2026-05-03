// ============================================
// LOADER.JS - MAIN LOADER
// ============================================

console.log('🚀 Loader.js started');

(function() {
  const API = 'https://js-injection-server.onrender.com'; // ← बदलो यहाँ
  const HOMEPAGE = 'https://homepage-pw-marco.netlify.app';
  let token = null;
  let verifyInterval = null;

  console.log('API:', API);

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
      loader.style.opacity = '0';
      setTimeout(() => {
        if (loader.parentNode) loader.remove();
      }, 500);
    }
  }

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
      background: rgba(0, 0, 0, 0.8);
      z-index: 999998;
    `;

    const popup = document.createElement('div');
    popup.id = 'pw-popup';
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      text-align: center;
      font-family: Arial, sans-serif;
      max-width: 400px;
      border: 2px solid ${isDanger ? '#e74c3c' : '#667eea'};
    `;

    let buttonsHTML = '';
    buttons.forEach((btn, idx) => {
      buttonsHTML += `
        <button id="pw-btn-${idx}" style="
          background: ${btn.color};
          color: white;
          border: none;
          padding: 10px 20px;
          margin: 10px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        ">${btn.text}</button>
      `;
    });

    popup.innerHTML = `
      <div style="font-size: 40px; margin-bottom: 15px;">${isDanger ? '🚫' : '🔑'}</div>
      <h2 style="margin: 0; color: ${isDanger ? '#e74c3c' : '#333'};">${title}</h2>
      <p style="color: #666; margin: 15px 0;">${message}</p>
      <div>${buttonsHTML}</div>
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

  function showGenerateKeyPopup() {
    showPopup(
      '🔑 Generate Key',
      'Click to authenticate',
      [{ text: 'Generate', color: '#667eea', onclick: generateKey }]
    );
  }

  async function generateKey() {
    try {
      const btn = document.getElementById('pw-btn-0');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Generating...';
      }

      console.log('POST', API + '/api/generate-key');

      const response = await fetch(`${API}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (response.status === 403) {
        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay) overlay.remove();
        if (popup) popup.remove();

        showPopup(data.error, data.message, [{ text: 'OK', color: '#e74c3c' }], true);

      } else if (response.ok && data.token) {
        console.log('✅ Key generated');
        token = data.token;
        setToken(token);

        const overlay = document.getElementById('pw-overlay');
        const popup = document.getElementById('pw-popup');
        if (overlay) overlay.remove();
        if (popup) popup.remove();

        showLoadingScreen();

        setTimeout(() => {
          injectMainJS();
          startVerification();
          hideLoadingScreen();
        }, 2000);

      } else {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Generate';
        }
      }

    } catch (error) {
      console.error('Error:', error);
      const btn = document.getElementById('pw-btn-0');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Generate';
      }
    }
  }

  async function injectMainJS() {
    try {
      console.log('Fetching main.js');

      const response = await fetch(`${API}/api/get-main-js?token=${token}`);

      if (response.ok) {
        const code = await response.text();
        console.log('main.js received:', code.length, 'bytes');

        const script = document.createElement('script');
        script.id = 'pw-main-script';
        script.textContent = code;
        document.body.appendChild(script);

        console.log('✅ main.js injected');
      }
    } catch (error) {
      console.error('Injection error:', error);
    }
  }

  function startVerification() {
    verifyInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          const data = await response.json();
          handleTokenInvalid(data.reason);
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    }, 3000);
  }

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
      [{ text: 'Generate New Key', color: '#667eea', onclick: () => { window.location.href = HOMEPAGE; } }],
      true
    );
  }

  function initLoader() {
    const existingToken = getToken();

    if (existingToken) {
      console.log('Token found');
      token = existingToken;

      showLoadingScreen();

      setTimeout(() => {
        injectMainJS();
        startVerification();
        hideLoadingScreen();
      }, 1500);
    } else {
      console.log('No token');

      if (window.location.hostname.includes('homepage-pw-marco.netlify.app')) {
        showGenerateKeyPopup();
      } else {
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
