// ============================================
// LOADER.JS - Public Loader (छोटा file)
// यह file किसी भी webapp में inject हो सकता है
// ============================================

(function() {
  // ==================== CONFIG ====================
  const SERVER_URL = 'https://js-injection-server.onrender.com'; // ← CHANGE करो Render URL
  let accessToken = null;
  let verificationInterval = null;

  // ==================== STORAGE ====================
  function getStoredToken() {
    return sessionStorage.getItem('access_token_pw_marco');
  }

  function setStoredToken(token) {
    sessionStorage.setItem('access_token_pw_marco', token);
  }

  function clearStoredToken() {
    sessionStorage.removeItem('access_token_pw_marco');
  }

  // ==================== POPUP ====================
  function showPopup() {
    // Check if popup already exists
    if (document.getElementById('marco-access-popup')) {
      return;
    }

    const popup = document.createElement('div');
    popup.id = 'marco-access-popup';
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 99999;
      text-align: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      max-width: 500px;
      width: 90%;
    `;

    popup.innerHTML = `
      <h2 style="
        margin-bottom: 10px;
        color: #333;
        font-size: 24px;
      ">🔑 Generate Access Key</h2>
      
      <p style="
        color: #666;
        margin-bottom: 30px;
        font-size: 14px;
        line-height: 1.5;
      ">Click the button below to generate your access key and authenticate</p>
      
      <button id="generate-key-btn" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 14px 30px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        transition: transform 0.2s;
      ">Generate Key</button>
      
      <p id="popup-message" style="
        margin-top: 15px;
        color: #e74c3c;
        font-size: 14px;
        min-height: 20px;
      "></p>

      <div id="loading-spinner" style="
        display: none;
        margin-top: 15px;
        text-align: center;
      ">
        <p style="color: #667eea;">⏳ Processing...</p>
      </div>
    `;

    document.body.appendChild(popup);

    // Add overlay
    const overlay = document.createElement('div');
    overlay.id = 'marco-popup-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99998;
    `;
    document.body.appendChild(overlay);

    document.getElementById('generate-key-btn').onclick = generateAccessKey;
  }

  // ==================== GENERATE KEY ====================
  async function generateAccessKey() {
    try {
      const btn = document.getElementById('generate-key-btn');
      const msg = document.getElementById('popup-message');
      const spinner = document.getElementById('loading-spinner');

      btn.disabled = true;
      spinner.style.display = 'block';
      msg.textContent = '';

      console.log('🔄 Generating access key...');

      const response = await fetch(`${SERVER_URL}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Key generated successfully');
        accessToken = data.token;
        setStoredToken(accessToken);

        // Remove popup
        const popup = document.getElementById('marco-access-popup');
        const overlay = document.getElementById('marco-popup-overlay');
        if (popup) popup.remove();
        if (overlay) overlay.remove();

        startVerification();
        injectMainJS();
      } else {
        console.error('❌ Error:', data.error);
        msg.textContent = `❌ ${data.error || 'Error generating key'}`;
        btn.disabled = false;
        spinner.style.display = 'none';
      }
    } catch (error) {
      console.error('Network Error:', error);
      document.getElementById('popup-message').textContent = '❌ Network error. Try again.';
      document.getElementById('generate-key-btn').disabled = false;
      document.getElementById('loading-spinner').style.display = 'none';
    }
  }

  // ==================== VERIFICATION (हर 2-3 sec) ====================
  function startVerification() {
    console.log('🔍 Starting token verification (every 2.5 seconds)');

    verificationInterval = setInterval(async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: accessToken })
        });

        if (!response.ok) {
          const data = await response.json();
          console.warn('⚠️ Token invalid:', data.reason);
          handleTokenInvalid(data.reason);
        } else {
          console.log('✅ Token valid');
        }
      } catch (error) {
        console.error('❌ Verification error:', error.message);
        handleTokenInvalid('network_error');
      }
    }, 2500);
  }

  // ==================== HANDLE INVALID TOKEN ====================
  function handleTokenInvalid(reason) {
    clearStoredToken();
    accessToken = null;
    clearInterval(verificationInterval);

    console.log('🔴 Access revoked. Reason:', reason);

    let message = 'Your access has been revoked';
    if (reason === 'device_banned') {
      message = 'Your device has been banned';
    } else if (reason === 'access_revoked') {
      message = 'Your access has been revoked by admin';
    } else if (reason === 'network_error') {
      message = 'Network error. Please refresh and try again.';
    }

    // Show alert
    alert(`🚫 ${message}\n\nRedirecting to homepage...`);

    // Redirect
    window.location.href = 'https://homepage-pw-marco.netlify.app';
  }

  // ==================== INJECT MAIN.JS ====================
  async function injectMainJS() {
    try {
      console.log('📥 Fetching main.js from server...');

      const response = await fetch(
        `${SERVER_URL}/api/get-main-js?token=${accessToken}`
      );

      if (response.ok) {
        const code = await response.text();
        console.log('✅ main.js received. Injecting...');

        const script = document.createElement('script');
        script.id = 'marco-main-script';
        script.textContent = code;
        (document.head || document.documentElement).appendChild(script);

        console.log('✅ main.js injected successfully!');
      } else {
        console.error('❌ Failed to fetch main.js');
      }
    } catch (error) {
      console.error('❌ Injection error:', error.message);
    }
  }

  // ==================== ON PAGE LOAD ====================
  window.addEventListener('load', function() {
    console.log('📄 Page loaded. Checking for stored token...');

    const token = getStoredToken();

    if (token) {
      console.log('✅ Token found in storage. Using existing token.');
      accessToken = token;
      startVerification();
      injectMainJS();
    } else {
      console.log('❌ No token found. Showing popup...');
      showPopup();
    }
  });

  // ==================== ON PAGE UNLOAD ====================
  window.addEventListener('beforeunload', function() {
    console.log('👋 Page unloading. Clearing token...');
    clearStoredToken();
    if (verificationInterval) {
      clearInterval(verificationInterval);
    }
  });

  // ==================== VISIBILITY CHANGE ====================
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      console.log('📵 Page hidden');
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    } else {
      console.log('📱 Page visible. Resuming verification...');
      if (accessToken) {
        startVerification();
      }
    }
  });

})();
