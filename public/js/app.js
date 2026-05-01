import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";
import { inject } from "https://esm.sh/@vercel/analytics";

inject();


const html = htm.bind(React.createElement);

const translations = {
  en: {
    intro: "Hi, I'm khairi,",
    title: "I'M A\nSTUDENT",
    lead: "Welcome to my portfolio. Feel free to explore my projects and download my CV at any time. Do not hesitate to contact me.",
    ctaProjects: "View My Projects",
    ctaCv: "Download CV",
    navHome: "Home",
    navLogin: "Login",
    loginTitle: "Sign In",
    loginDesc: "Enter your credentials to access your account.",
    loginEmail: "Email",
    loginPassword: "Password",
    loginSubmit: "Sign In",
    loading: "Loading..."
  },
  fr: {
    intro: "Salut, je suis khairi,",
    title: "JE SUIS\nETUDIANT",
    lead: "Bienvenue sur mon portfolio. N'hesitez pas a explorer mes projets et a telecharger mon CV a tout moment.",
    ctaProjects: "Voir mes projets",
    ctaCv: "Telecharger CV",
    navHome: "Accueil",
    navLogin: "Connexion",
    loginTitle: "Se connecter",
    loginDesc: "Entrez vos identifiants pour acceder a votre compte.",
    loginEmail: "Email",
    loginPassword: "Mot de passe",
    loginSubmit: "Se connecter",
    loading: "Chargement..."
  },
  ar: {
    intro: "?????? ??? ?????",
    title: "???\n????",
    lead: "????? ??? ?? ???? ??????. ?? ????? ?? ??????? ??????? ?????? ????? ??????? ?? ?? ???.",
    ctaProjects: "??? ???????",
    ctaCv: "????? ?????? ???????",
    navHome: "????????",
    navLogin: "????? ?????",
    loginTitle: "????? ?????",
    loginDesc: "???? ??????? ????? ??????? ??? ??????.",
    loginEmail: "????? ??????????",
    loginPassword: "word ?????",
    loginSubmit: "????? ?????",
    loading: "???? ???????..."
  },
};

function App() {
  const [lang, setLang] = useState(localStorage.getItem("site_lang") || "en");
  const [dbConnected, setDbConnected] = useState(null); 
  const [route, setRoute] = useState(window.location.pathname || "/");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [user, setUser] = useState(null);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setRoute(path);
  };

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("site_lang", lang);
  }, [lang]);

  useEffect(() => {
    fetch("/api/db-status")
      .then(res => res.json())
      .then(data => setDbConnected(data.connected))
      .catch(() => setDbConnected(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    // For demo purposes, we'll just check if email exists. 
    // In production, this would call a Supabase Auth API.
    if (loginForm.email && loginForm.password) {
      setUser({ email: loginForm.email });
      navigate("/");
    }
  };

  const renderContent = () => {
    if (route === "/login") {
      return html`
        <main className="hero">
          <div className="container">
            <section className="page-card login-card">
              <h1>${t.loginTitle}</h1>
              <p>${t.loginDesc}</p>
              <form onSubmit=${handleLogin} className="contact-form">
                <input
                  type="email"
                  placeholder=${t.loginEmail}
                  value=${loginForm.email}
                  onChange=${(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder=${t.loginPassword}
                  value=${loginForm.password}
                  onChange=${(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <button type="submit" className="cta">${t.loginSubmit}</button>
              </form>
              <div className="cta-row">
                <button className="cta secondary" onClick=${() => navigate("/")}>${t.navHome}</button>
              </div>
            </section>
          </div>
        </main>
      `;
    }

    return html`
      <main className="hero">
        <div className="container hero-grid">
          <section className="hero-content">
            <p className="intro">${t.intro} ${user ? html`<span>(Welcome, ${user.email.split('@')[0]})</span>` : ""}</p>
            <h1 className="title">${t.title.split("\n").map((line, idx, arr) => html`${line}${idx < arr.length - 1 ? html`<br />` : null}`)}</h1>
            <p className="lead">${t.lead}</p>
            <div className="cta-row">
              <button className="cta" onClick=${() => alert("Projects clicked")}>${t.ctaProjects}</button>
              <button className="cta secondary" onClick=${() => alert("CV clicked")}>${t.ctaCv}</button>
              <button className="cta secondary" onClick=${async () => {
                try {
                  const res = await fetch("/api/db-test");
                  const data = await res.json();
                  alert(data.success ? "Connected to Supabase!" : `Error: ${data.error}`);
                } catch (e) {
                  alert("Failed to connect to API");
                }
              }}>Check Database</button>
            </div>
          </section>
          <figure className="hero-image" aria-hidden="true">
            <img src="photo/khairibo.png" alt="Avatar" />
          </figure>
        </div>
      </main>
    `;
  };

  return html`
    <div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="logo" href="#" onClick=${(e) => { e.preventDefault(); navigate("/"); }}
            >khairi<span className="logo-accent">bouzakher</span></a
          >

          <div className="header-right">
            <div className="db-status-pill" title="Database Connection Status">
               <span className=${`status-dot ${dbConnected === true ? "online" : dbConnected === false ? "offline" : "checking"}`}></span>
               <span className="status-text">${dbConnected === true ? "DB Online" : dbConnected === false ? "DB Offline" : "Checking..."}</span>
            </div>

            <nav className="main-nav" aria-label="Main navigation">
              <a href="#" onClick=${(e) => { e.preventDefault(); navigate("/"); }}>${t.navHome}</a>
              ${user 
                ? html`<a href="#" onClick=${(e) => { e.preventDefault(); setUser(null); }}>Logout</a>`
                : html`<a href="#" onClick=${(e) => { e.preventDefault(); navigate("/login"); }}>${t.navLogin}</a>`
              }
            </nav>

            <div className="header-controls">
              <div className="lang-switch" aria-label="Language switch">
                ${["en", "fr", "ar"].map((code) =>
    html`<button className=${`lang-btn ${lang === code ? "active" : ""}`} onClick=${() => setLang(code)}>${code.toUpperCase()}</button>`
  )}
              </div>
            </div>
          </div>
        </div>
      </header>

      ${renderContent()}

      <footer className="site-footer">
        <div className="container">&copy; ${new Date().getFullYear()} khairi bouzakher</div>
      </footer>
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);

