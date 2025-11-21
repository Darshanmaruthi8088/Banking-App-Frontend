let failedAttempts = 0, blockTimeout = null;
const MAX_ATTEMPTS = 5;
const loginBtn = document.getElementById('loginBtn');
const errorBox = document.getElementById('errorMsg');
const loading = document.getElementById('loading');
const countdownDiv = document.getElementById('countdown');
const serverStatus = document.getElementById('serverStatus');
const togglePwdBtn = document.getElementById('togglePwd');
const pwdInput = document.getElementById('password');

// Only one toggle icon: set with JS (no SVG, no extra span)
togglePwdBtn.textContent = '👁️';

togglePwdBtn.onclick = () => {
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    togglePwdBtn.textContent = '🙈';
  } else {
    pwdInput.type = 'password';
    togglePwdBtn.textContent = '👁️';
  }
};

pwdInput.oninput = e => {
  const pwd = e.target.value;
  let score = 0;
  if (pwd.length > 7) score += 40;
  if (/[A-Z]/.test(pwd)) score += 20;
  if (/[0-9]/.test(pwd)) score += 20;
  if (/[\W]/.test(pwd)) score += 20;
  document.getElementById('strengthBar').value = score;
};

function blockUI(seconds) {
  loginBtn.disabled = true;
  showCountdown(seconds);
  blockTimeout = setInterval(() => {
    seconds--;
    showCountdown(seconds);
    if (seconds <= 0) {
      clearInterval(blockTimeout);
      loginBtn.disabled = false;
      countdownDiv.textContent = '';
      failedAttempts = 0;
    }
  }, 1000);
}

function showCountdown(s) {
  countdownDiv.textContent = s > 0 ? `Blocked for ${s}s due to failed attempts.` : '';
}

serverStatus.textContent = "";

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add('shake');
  setTimeout(() => errorBox.classList.remove('shake'), 340);
}

function setLoading(state) {
  loading.classList.toggle('hidden', !state);
  loginBtn.disabled = state;
}

function saveToken(token, remember) {
  if (remember) localStorage.setItem('jwt', token);
  else sessionStorage.setItem('jwt', token);
}

function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  if (blockTimeout) return;

  setLoading(true);
  showError('');

  const username = document.getElementById('username').value.trim();
  const password = pwdInput.value;
  const remember = document.getElementById('rememberMe').checked;

  // Fake delay / demo
  await new Promise(r => setTimeout(r, 1000));

  let res = {};
  if (username === "admin" && password === "Admin123!") {
    res = {
      success: true,
      token: "header." + btoa(JSON.stringify({role:"admin", name:"admin", exp:Date.now()+90000})) + ".sig",
      userRole: "admin"
    };
  } else if (username === "user" && password === "User123!") {
    res = {
      success: true,
      token: "header." + btoa(JSON.stringify({role:"customer", name:"user", exp:Date.now()+90000})) + ".sig",
      userRole: "customer"
    };
  } else if (username === "" || password === "") {
    res = { success: false, error: "All fields required." };
  } else {
    res = { success: false, error: "Wrong username or password." };
  }

  if (!res.success) {
    setLoading(false);
    failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) blockUI(13);
    showError(res.error || "Login failed.");
    return;
  }

  failedAttempts = 0;
  setLoading(false);
  showError('');
  saveToken(res.token, remember);

  const profile = decodeJWT(res.token);
  if (profile) {
    window.location.href = profile.role === "admin" ? "admin-dashboard.html" : "dashboard.html";
  } else {
    showError("Token error.");
  }
};

document.getElementById('forgotLink').onclick = e => {
  e.preventDefault();
  const email = prompt("Enter your email to receive reset link:");
  if (!email || !email.includes('@')) {
    showError("Enter valid email.");
    return;
  }
  setLoading(true);
  showError('');
  setTimeout(() => {
    setLoading(false);
    alert("Password reset link sent (demo).");
  }, 900);
};
