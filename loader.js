// ============================================
// LOADER.JS - MEDIAN APP VERSION
// ============================================

(function() {
  const SERVER_URL = 'https://js-injection-server.onrender.com'; // ← अपना URL डालो
  let accessToken = null;
  let verificationInterval = null;

  console.log('🔍 Loader Started in Median App');

  // ==================== STORAGE ====================
  function getStoredToken() {
    try {
      return localStorage.getItem('pw_marco_token');
    } catch(e) {
      return null;
    }
  }

  function setStoredToken(token) {
    try {
      localStorage.setItem('pw_marco_token', token);
    } catch(e) {
      console.error('Storage error:', e);
    }
  }

  function clearStoredToken() {
    try {
      localStorage.removeItem('pw_marco_token');
    } catch(e) {}
  }

  // ==================== POPUP (Median-compatible) ====================
  function showPopup() {
    if (document.getElementById('pw-marco-popup')) return;

    // Container बनाओ
    const container = document.createElement('div');
    container.id = 'pw-marco-popup';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999999;
      font-family: Arial, sans-serif;
    `;

    container.innerHTML = `
      <div style="
        background: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      ">
        <h2 style="margin: 0 0 10px 0; color: #333;">🔑 Access Key Required</h2>
        <p style="color: #666; margin: 0 0 20px 0; font-size: 14px;">Click to generate your access key</p>
        
        <button id="pw-gen-btn" style="
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
          font-weight: bold;
        ">Generate Key</button>
        
        <p id="pw-msg" style="color: red; margin-top: 10px; font-size: 12px;"></p>
      </div>
    `;

    document.body.appendChild(container);
    document.getElementById('pw-gen-btn').onclick = generateAccessKey;
  }

  // ==================== GENERATE KEY ====================
  async function generateAccessKey() {
    try {
      const btn = document.getElementById('pw-gen-btn');
      const msg = document.getElementById('pw-msg');
      
      btn.disabled = true;
      btn.textContent = '⏳ Generating...';

      const response = await fetch(`${SERVER_URL}/api/generate-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        accessToken = data.token;
        setStoredToken(accessToken);

        const popup = document.getElementById('pw-marco-popup');
        if (popup) popup.remove();

        console.log('✅ Key generated');
        startVerification();
        injectMainJS();
      } else {
        msg.textContent = data.error || 'Error occurred';
        btn.disabled = false;
        btn.textContent = 'Generate Key';
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('pw-msg').textContent = 'Network error';
      document.getElementById('pw-gen-btn').disabled = false;
      document.getElementById('pw-gen-btn').textContent = 'Generate Key';
    }
  }

  // ==================== VERIFICATION ====================
  function startVerification() {
    console.log('✅ Verification started');
    
    verificationInterval = setInterval(async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/verify-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: accessToken })
        });

        if (!response.ok) {
          console.warn('⚠️ Token invalid');
          handleTokenInvalid();
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    }, 2500);
  }

  // ==================== INJECT MAIN.JS ====================
  async function injectMainJS() {
    try {
      console.log('📥 Fetching main.js...');

      const response = await fetch(
        `${SERVER_URL}/api/get-main-js?token=${accessToken}`
      );

      if (response.ok) {
        const code = await response.text();
        console.log('✅ main.js received');

        const script = document.createElement('script');
        script.textContent = code;
        document.body.appendChild(script);

        console.log('✅ main.js injected');
      }
    } catch (error) {
      console.error('Injection error:', error);
    }
  }

  // ==================== HANDLE INVALID ====================
  function handleTokenInvalid() {
    clearStoredToken();
    accessToken = null;
    clearInterval(verificationInterval);
    
    alert('Access revoked. Reload page to generate new key.');
    location.reload();
  }

  // ==================== INIT ====================
  function init() {
    console.log('🚀 Initializing...');
    
    const token = getStoredToken();
    if (token) {
      console.log('✅ Token found');
      accessToken = token;
      startVerification();
      injectMainJS();
    } else {
      console.log('❌ No token, showing popup');
      showPopup();
    }
  }

  // Page load पर init करो
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearStoredToken();
    clearInterval(verificationInterval);
  });

})();
