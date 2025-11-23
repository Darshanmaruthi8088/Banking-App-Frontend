// src/components/LoginPage.jsx
import { useState, useEffect } from "react";
import "../LoginPage.css";
import sampleImg from "../assets/1763719490411-sample.jpeg";

export default function LoginPage() {
  // React states
  const [passwordType, setPasswordType] = useState("password");
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const MAX_ATTEMPTS = 5;

  // Countdown effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // reset attempts when unblocked
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Toggle password visibility
  function togglePassword() {
    setPasswordType((prev) => (prev === "password" ? "text" : "password"));
  }

  // Password strength meter
  function updateStrength(e) {
    const pwd = e.target.value;
    let score = 0;
    if (pwd.length > 7) score += 40;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 20;
    if (/[\W]/.test(pwd)) score += 20;
    setStrength(score);
  }
  <input
  type="text"
  id="username"
  name="username"
  required
  autoComplete="username"
  placeholder=" "
/>


  function blockUI(seconds) {
    setCountdown(seconds);
  }

  // Submit handler (converted from your script.js)
  async function handleSubmit(e) {
    e.preventDefault();
    if (countdown > 0) return; // blocked

    setLoading(true);
    setErrorMsg("");

    const username = e.target.username.value.trim();
    const password = e.target.password.value;
    const remember = e.target.rememberMe.checked;

    // fake delay (demo)
    await new Promise((r) => setTimeout(r, 1000));

    let res;
    if (username === "admin" && password === "Admin123!") {
      res = {
        success: true,
        token:
          "header." +
          btoa(
            JSON.stringify({
              role: "admin",
              name: "admin",
              exp: Date.now() + 90000,
            })
          ) +
          ".sig",
      };
    } else if (username === "user" && password === "User123!") {
      res = {
        success: true,
        token:
          "header." +
          btoa(
            JSON.stringify({
              role: "customer",
              name: "user",
              exp: Date.now() + 90000,
            })
          ) +
          ".sig",
      };
    } else if (!username || !password) {
      res = { success: false, error: "All fields required." };
    } else {
      res = { success: false, error: "Wrong username or password." };
    }

    if (!res.success) {
      setLoading(false);
      setFailedAttempts((prev) => {
        const newFail = prev + 1;
        if (newFail >= MAX_ATTEMPTS) blockUI(13);
        return newFail;
      });
      setErrorMsg(res.error || "Login failed.");
      return;
    }

    // success
    setLoading(false);
    setErrorMsg("");
    setFailedAttempts(0);

    // save token
    if (remember) localStorage.setItem("jwt", res.token);
    else sessionStorage.setItem("jwt", res.token);

    let payload;
    try {
      payload = JSON.parse(atob(res.token.split(".")[1]));
    } catch {
      setErrorMsg("Token error.");
      return;
    }

    if (payload.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }
  }

  // Forgot password handler
  function handleForgot(e) {
    e.preventDefault();
    const email = prompt("Enter your email to receive reset link:");
    if (!email || !email.includes("@")) {
      setErrorMsg("Enter valid email.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      setLoading(false);
      alert("Password reset link sent (demo).");
    }, 900);
  }

  const toggleIcon = passwordType === "password" ? "👁️" : "🙈";

  return (
    <main className="bank-login">
      <section className="login-card">
        <header>
          <img src={sampleImg} alt="Bank Logo" className="bank-logo" />
          <h1 className="bank-name">BLAZEBANK</h1>
          <p className="bank-slogan">Unlock the Power of Digital Finance.</p>
        </header>

        <form id="loginForm" autoComplete="off" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              required
              autoComplete="username"
              placeholder=" "
            />
            <label htmlFor="username" className="floating-label">
              Email/Username
            </label>
          </div>

          <div className="form-group password-group">
            <input
              type={passwordType}
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder=" "
              onChange={updateStrength}
            />
            <label htmlFor="password" className="floating-label">
              Password
            </label>

            <button
              type="button"
              id="togglePwd"
              tabIndex={-1}
              title="Show/Hide Password"
              onClick={togglePassword}
            >
              {toggleIcon}
            </button>

            <meter
              id="strengthBar"
              value={strength}
              min="0"
              max="100"
            ></meter>
          </div>

          <div className="flex-row gap">
            <label className="checkbox-label">
              <input type="checkbox" id="rememberMe" name="rememberMe" />{" "}
              Remember Me
            </label>
            <a href="#" id="forgotLink" onClick={handleForgot}>
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            id="loginBtn"
            className="btn-primary"
            disabled={loading || countdown > 0}
          >
            {loading ? "Logging you in…" : "Login"}
          </button>

          <div
            id="loading"
            className={`loading ${loading ? "" : "hidden"}`}
          >
            <span className="spinner"></span> Logging you in…
          </div>

          <div
            id="errorMsg"
            className={`error-msg ${errorMsg ? "shake" : ""}`}
          >
            {errorMsg}
          </div>

          <div id="countdown" className="countdown">
            {countdown > 0
              ? `Blocked for ${countdown}s due to failed attempts.`
              : ""}
          </div>
        </form>

        <footer className="redirect-row">
          <span>New user?</span>
          <a href="register.html">Create account</a>
        </footer>

        <div className="server-status" id="serverStatus">
          {/* placeholder for real server status */}
        </div>

        <figure className="illustration"></figure>
      </section>
    </main>
  );
}
