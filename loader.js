// ============================================
// LOADER.JS - v3.0 FINAL FIX
// ============================================
// KEY FIXES:
// 1. localStorage use - tab/page change pe token nahi jaata
// 2. beforeunload pe clearToken NAHI - redirect pe token safe rehta hai
// 3. Loading screen INSTANTLY inject hoti hai script ke load hote hi
// 4. Allowed sites check - sirf specific pages pe kaam karta hai
// 5. VPN detect hone pe generate button kaam nahi karta
// ============================================

(function () {

  const API = 'https://js-injection-server.onrender.com'; // ← apna server URL yahan

  // ✅ Allowed hostnames
  const ALLOWED_HOSTS = [
    'homepage-pw-marco.netlify.app',
    'test.pwthor.live',
    'pwthor.live'
  ];

  // ✅ pwthor.live ke andar sirf ye paths allowed hain
  const ALLOWED_PWTHOR_PATHS = ['/auth', '/study', '/study/batches'];

  let _token = null;
  let _verifyTimer = null;

  // ─────────────────────────────────────────
  // 0. SITE CHECK — sabse pehle
  // ─────────────────────────────────────────
  function isAllowedSite() {
    const host = location.hostname;
    const path = location.pathname.replace(/\/$/, '') || '/';

    if (host === 'homepage-pw-marco.netlify.app') return true;
    if (host === 'test.pwthor.live') return true;
    if (host === 'pwthor.live') {
      return ALLOWED_PWTHOR_PATHS.some(p =>
        path === p || path.startsWith(p + '/')
      );
    }
    return false;
  }

  // Agar allowed site nahi hai — bilkul kuch mat karo
  if (!isAllowedSite()) return;

  // ─────────────────────────────────────────
  // 1. LOADING SCREEN — INSTANT (DOM ready hone se pehle bhi)
  //    Script inject hote hi yeh run ho jaata hai
  // ─────────────────────────────────────────
  var _loaderStyle = document.createElement('style');
  _loaderStyle.textContent = [
    '@keyframes _pw_spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}',
    '@keyframes _pw_pulse{0%,100%{opacity:1}50%{opacity:0.4}}',
    '#_pw_ls{position:fixed;top:0;left:0;width:100%;height:100%;',
    'background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);',
    'z-index:2147483647;display:flex;flex-direction:column;',
    'align-items:center;justify-content:center;',
    'font-family:"Segoe UI",Arial,sans-serif;',
    'transition:opacity 0.5s ease;}',
    '#_pw_ls ._sp{width:56px;height:56px;border:4px solid rgba(255,255,255,0.1);',
    'border-top:4px solid #667eea;border-radius:50%;',
    'animation:_pw_spin 1s linear infinite;margin-bottom:22px;}',
    '#_pw_ls ._br{font-size:26px;font-weight:800;',
    'background:linear-gradient(135deg,#667eea,#a78bfa);',
    '-webkit-background-clip:text;-webkit-text-fill-color:transparent;',
    'margin-bottom:6px;}',
    '#_pw_ls ._tg{color:rgba(255,255,255,0.35);font-size:11px;',
    'letter-spacing:2px;margin-bottom:36px;text-transform:uppercase;}',
    '#_pw_ls ._lt{color:rgba(255,255,255,0.7);font-size:14px;',
    'letter-spacing:1.5px;text-transform:uppercase;',
    'animation:_pw_pulse 1.4s ease infinite;}'
  ].join('');

  // Style inject — document.head ready ho ya na ho
  (document.head || document.documentElement).appendChild(_loaderStyle);

  // Loading div
  var _ls = document.createElement('div');
  _ls.id = '_pw_ls';
  _ls.innerHTML = '<div class="_br">PW Marco</div><div class="_tg">Secure Access</div><div class="_sp"></div><div class="_lt">Verifying...</div>';

  // documentElement mein daal do — body ka wait nahi
  document.documentElement.appendChild(_ls);

  function _hideLoader() {
    var el = document.getElementById('_pw_ls');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(function () { el && el.remove(); }, 500);
  }

  // ─────────────────────────────────────────
  // 2. TOKEN STORAGE — localStorage (persistent)
  // ─────────────────────────────────────────
  function _getToken() {
    try { return localStorage.getItem('_pw_marco_tk'); } catch (e) { return null; }
  }
  function _saveToken(t) {
    try {
      localStorage.setItem('_pw_marco_tk', t);
    } catch (e) { }
  }
  function _deleteToken() {
    try { localStorage.removeItem('_pw_marco_tk'); } catch (e) { }
  }

  // ─────────────────────────────────────────
  // 3. POPUP STYLES
  // ─────────────────────────────────────────
  function _injectPopupCSS() {
    if (document.getElementById('_pw_pstyle')) return;
    var s = document.createElement('style');
    s.id = '_pw_pstyle';
    s.textContent = [
      '@keyframes _pw_fi{from{opacity:0;transform:translate(-50%,-48%) scale(0.93)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
      '@keyframes _pw_oi{from{opacity:0}to{opacity:1}}',
      '._pw_ov{position:fixed;top:0;left:0;width:100%;height:100%;',
      'background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);',
      'z-index:2147483646;animation:_pw_oi 0.3s ease;}',
      '._pw_box{position:fixed;top:50%;left:50%;',
      'transform:translate(-50%,-50%);',
      'background:linear-gradient(145deg,#1a1a2e,#16213e);',
      'border:1px solid rgba(102,126,234,0.25);border-radius:22px;',
      'padding:38px 32px;z-index:2147483647;text-align:center;',
      'font-family:"Segoe UI",Arial,sans-serif;',
      'max-width:420px;width:92%;',
      'box-shadow:0 30px 80px rgba(0,0,0,0.7);',
      'animation:_pw_fi 0.35s cubic-bezier(0.34,1.56,0.64,1);color:#e2e8f0;}',
      '._pw_icon{font-size:52px;display:block;margin-bottom:14px;}',
      '._pw_title{font-size:22px;font-weight:800;margin:0 0 10px;',
      'background:linear-gradient(135deg,#667eea,#a78bfa);',
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;}',
      '._pw_desc{color:rgba(255,255,255,0.55);font-size:13px;',
      'line-height:1.65;margin:0 0 22px;}',
      '._pw_badge{display:inline-block;',
      'background:rgba(248,113,113,0.12);',
      'border:1px solid rgba(248,113,113,0.3);',
      'color:#f87171;padding:5px 14px;border-radius:20px;',
      'font-size:11px;font-weight:700;margin-bottom:18px;letter-spacing:0.5px;}',
      '._pw_btn_p{background:linear-gradient(135deg,#667eea,#764ba2);',
      'color:#fff;border:none;padding:14px 0;border-radius:12px;',
      'font-size:15px;font-weight:700;cursor:pointer;width:100%;',
      'margin-bottom:10px;transition:all 0.3s;letter-spacing:0.5px;',
      'box-shadow:0 4px 20px rgba(102,126,234,0.35);}',
      '._pw_btn_p:hover{transform:translateY(-2px);',
      'box-shadow:0 8px 25px rgba(102,126,234,0.55);}',
      '._pw_btn_p:disabled{opacity:0.5;cursor:not-allowed;transform:none;}',
      '._pw_hr{border:none;border-top:1px solid rgba(255,255,255,0.07);',
      'margin:18px 0 14px;}',
      '._pw_note{color:rgba(255,255,255,0.28);font-size:11px;line-height:1.5;}',
      '._pw_err{color:#f87171;font-size:12px;margin-top:10px;min-height:16px;}',
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  function _removePopups() {
    ['_pw_ov', '_pw_box'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  // ─────────────────────────────────────────
  // 4. KEY GENERATION POPUP
  // ─────────────────────────────────────────
  function _showKeyPopup() {
    _removePopups();
    _injectPopupCSS();

    var ov = document.createElement('div');
    ov.className = '_pw_ov'; ov.id = '_pw_ov';

    var box = document.createElement('div');
    box.className = '_pw_box'; box.id = '_pw_box';
    box.innerHTML = [
      '<span class="_pw_icon">🔐</span>',
      '<h2 class="_pw_title">Access Required</h2>',
      '<p class="_pw_desc">Secure access key generate karo.<br>Key ek baar banao — sari allowed sites pe valid rahegi.</p>',
      '<button id="_pw_gbtn" class="_pw_btn_p">⚡ Generate Access Key</button>',
      '<p id="_pw_gerr" class="_pw_err"></p>',
      '<hr class="_pw_hr">',
      '<p class="_pw_note">🛡️ Device register hoga. VPN allowed nahi hai.</p>',
    ].join('');

    document.body.appendChild(ov);
    document.body.appendChild(box);
    document.getElementById('_pw_gbtn').onclick = _generateKey;
  }

  // ─────────────────────────────────────────
  // 5. ALERT POPUP (Revoke / Ban / VPN / Expire)
  // ─────────────────────────────────────────
  function _showAlertPopup(icon, title, badge, desc, showNewKeyBtn) {
    _removePopups();
    _injectPopupCSS();

    var ov = document.createElement('div');
    ov.className = '_pw_ov'; ov.id = '_pw_ov';

    var box = document.createElement('div');
    box.className = '_pw_box'; box.id = '_pw_box';

    var html = [
      '<span class="_pw_icon">' + icon + '</span>',
      '<h2 class="_pw_title">' + title + '</h2>',
    ];
    if (badge) html.push('<div class="_pw_badge">' + badge + '</div>');
    html.push('<p class="_pw_desc">' + desc + '</p>');
    if (showNewKeyBtn) {
      html.push('<button id="_pw_nkbtn" class="_pw_btn_p">🔄 Generate New Key</button>');
    }
    html.push('<hr class="_pw_hr"><p class="_pw_note">Admin se contact karo agar galti lage.</p>');

    box.innerHTML = html.join('');
    document.body.appendChild(ov);
    document.body.appendChild(box);

    if (showNewKeyBtn) {
      document.getElementById('_pw_nkbtn').onclick = function () {
        _deleteToken();
        _token = null;
        // Pehle homepage pe jaao, wahan key popup dikhega
        location.href = 'https://homepage-pw-marco.netlify.app';
      };
    }
  }

  // ─────────────────────────────────────────
  // 6. GENERATE KEY
  // ─────────────────────────────────────────
  async function _generateKey() {
    var btn = document.getElementById('_pw_gbtn');
    var err = document.getElementById('_pw_gerr');
    btn.disabled = true;
    btn.textContent = '⏳ Verifying...';
    if (err) err.textContent = '';

    try {
      var res = await fetch(API + '/api/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      var data = await res.json();

      if (data.reason === 'vpn_detected') {
        _showAlertPopup('🚫', 'VPN Detected', '⚠️ VPN / Proxy Blocked',
          'VPN ya Proxy detect hua hai.<br>Disable karo aur dobara try karo.<br><br><strong>VPN use strictly prohibited hai.</strong>',
          false);
        return;
      }

      if (data.reason === 'device_banned') {
        _showAlertPopup('🚫', 'Device Banned', '🔒 Permanent Ban',
          'Tumhara device permanently ban hai.<br>Admin se contact karo.',
          false);
        return;
      }

      if (res.ok && data.token) {
        _token = data.token;
        _saveToken(_token);
        _removePopups();
        // Loading screen dikhao phir inject karo
        _showLoaderAgain();
        _startVerify();
        await _injectMainJS();
        setTimeout(_hideLoader, 4500);
      } else {
        if (err) err.textContent = '❌ ' + (data.error || 'Error. Try again.');
        btn.disabled = false;
        btn.textContent = '⚡ Generate Access Key';
      }

    } catch (e) {
      if (err) err.textContent = '❌ Network error. Try again.';
      btn.disabled = false;
      btn.textContent = '⚡ Generate Access Key';
    }
  }

  // Loading screen ko popup ke baad phir se dikhao
  function _showLoaderAgain() {
    var el = document.getElementById('_pw_ls');
    if (el) {
      el.style.opacity = '1';
    } else {
      var ls2 = document.createElement('div');
      ls2.id = '_pw_ls';
      ls2.innerHTML = '<div class="_br">PW Marco</div><div class="_tg">Secure Access</div><div class="_sp"></div><div class="_lt">Loading App...</div>';
      document.documentElement.appendChild(ls2);
    }
  }

  // ─────────────────────────────────────────
  // 7. INJECT MAIN.JS
  // ─────────────────────────────────────────
  async function _injectMainJS() {
    try {
      var res = await fetch(API + '/api/get-main-js?token=' + _token);
      if (res.ok) {
        var code = await res.text();
        var sc = document.createElement('script');
        sc.id = '_pw_main';
        sc.textContent = code;
        document.body.appendChild(sc);
        console.log('✅ main.js injected');
      }
    } catch (e) {
      console.error('Inject error:', e);
    }
  }

  // ─────────────────────────────────────────
  // 8. TOKEN VERIFICATION (har 3 sec)
  // ─────────────────────────────────────────
  function _startVerify() {
    if (_verifyTimer) clearInterval(_verifyTimer);
    _verifyTimer = setInterval(async function () {
      try {
        var res = await fetch(API + '/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: _token })
        });
        if (!res.ok) {
          var data = await res.json();
          _onInvalidToken(data.reason, data.revokeReason);
        }
      } catch (e) {
        // Network error — skip, block mat karo
      }
    }, 3000);
  }

  function _onInvalidToken(reason, revokeReason) {
    clearInterval(_verifyTimer);
    _verifyTimer = null;
    _deleteToken();
    _token = null;

    // injected script remove karo
    var sc = document.getElementById('_pw_main');
    if (sc) sc.remove();

    var map = {
      'access_revoked': {
        icon: '⛔', title: 'Access Revoked',
        badge: '📋 ' + (revokeReason || 'Admin action'),
        desc: 'Tumhara access revoke ho gaya.<br><strong>Reason:</strong> ' + (revokeReason || 'Admin ne revoke kiya') + '.',
        newKey: true
      },
      'device_banned': {
        icon: '🚫', title: 'Device Banned',
        badge: '🔒 Permanent Ban',
        desc: 'Tumhara device permanently ban hai.',
        newKey: false
      },
      'vpn_detected': {
        icon: '🚫', title: 'VPN Detected',
        badge: '⚠️ VPN / Proxy',
        desc: 'VPN detect hua. Disable karo.',
        newKey: false
      },
      'token_expired': {
        icon: '⏰', title: 'Key Expired',
        badge: '⏱ Session Over',
        desc: 'Teri key expire ho gayi. Naya generate karo.',
        newKey: true
      }
    };

    var cfg = map[reason] || {
      icon: '⚠️', title: 'Access Blocked',
      badge: reason || 'Unknown',
      desc: 'Access block ho gaya. Naya key generate karo.',
      newKey: true
    };

    _showAlertPopup(cfg.icon, cfg.title, cfg.badge, cfg.desc, cfg.newKey);
  }

  // ─────────────────────────────────────────
  // 9. INIT — token check
  // ─────────────────────────────────────────
  function _init() {
    var saved = _getToken();

    if (saved) {
      // Token mil gaya — verify karo pehle
      _token = saved;
      fetch(API + '/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: saved })
      }).then(function (res) {
        if (res.ok) {
          // Valid hai — content load karo
          _startVerify();
          _injectMainJS().then(function () {
            setTimeout(_hideLoader, 4500);
          });
        } else {
          return res.json().then(function (data) {
            _hideLoader();
            _deleteToken();
            _token = null;
            _onInvalidToken(data.reason, data.revokeReason);
          });
        }
      }).catch(function () {
        // Network issue — token ko safe maan ke chalao
        _startVerify();
        _injectMainJS().then(function () {
          setTimeout(_hideLoader, 4500);
        });
      });

    } else {
      // Koi token nahi — loading hide karo, popup dikhao
      _hideLoader();
      // Body ready hone ka wait karo popup ke liye
      if (document.body) {
        _showKeyPopup();
      } else {
        document.addEventListener('DOMContentLoaded', _showKeyPopup);
      }
    }
  }

  // Script inject hote hi init — DOMContentLoaded ka wait nahi
  _init();

  // ─────────────────────────────────────────
  // 10. VISIBILITY CHANGE
  // ─────────────────────────────────────────
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && _token) {
      if (!_verifyTimer) _startVerify();
    } else if (document.hidden) {
      if (_verifyTimer) {
        clearInterval(_verifyTimer);
        _verifyTimer = null;
      }
    }
  });

  // ⚠️ beforeunload pe TOKEN CLEAR NAHI KARNA — redirect pe token safe rahe

})();
