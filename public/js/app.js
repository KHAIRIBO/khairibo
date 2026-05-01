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
    aboutTitle: "About Me",
    educationTitle: "Education",
    skillsTitle: "Technical Skills",
    experienceTitle: "Experience & Activities",
    languagesTitle: "Languages",
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
    aboutTitle: "À propos de moi",
    educationTitle: "Éducation",
    skillsTitle: "Compétences Techniques",
    experienceTitle: "Expérience & Activités",
    languagesTitle: "Langues",
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
    aboutTitle: "?? ???",
    educationTitle: "???????",
    skillsTitle: "??????? ??????",
    experienceTitle: "??????? ????????",
    languagesTitle: "??????",
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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [route]);



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
              <a href="/Khairi_Bouzakher_CV.pdf" download="Khairi_Bouzakher_CV.pdf" className="cta secondary">${t.ctaCv}</a>
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

      <section className="cv-section">
        <div className="container">
          <div className="cv-grid">
            <div className="cv-card profile-card reveal">
              <h2>${t.aboutTitle}</h2>
              <p>Motivated Computer Science student specializing in Web Development and Robotics. Skilled in HTML, PHP, Python, and SQL with a strong interest in building real-world solutions. Active in clubs and robotics competitions with strong teamwork and problem-solving skills.</p>
            </div>
            
            <div className="cv-card education-card reveal">
              <h3>${t.educationTitle}</h3>
              <div className="cv-item">
                <p className="item-title">ISIMG - Higher Institute of Computer Science and Multimedia of Gabès</p>
                <p className="item-subtitle">Specialization: Web Development & Robotics Engineering (LISI)</p>
                <p className="item-date">Baccalaureate (2023/2024) - Good average</p>
              </div>
            </div>

            <div className="cv-card skills-card reveal">
              <h3>${t.skillsTitle}</h3>
              <ul className="skills-list">
                <li>HTML, PHP, Python, SQL</li>
                <li>Databases: MySQL, PostgreSQL</li>
                <li>Web Development (Front-end & Back-end basics)</li>
              </ul>
            </div>

            <div className="cv-card experience-card reveal">
              <h3>${t.experienceTitle}</h3>
              <ul className="cv-list">
                <li>Active member in music, social, and tech clubs</li>
                <li>Participated in robotics competitions</li>
                <li>Earned certificates in robotics and IT</li>
              </ul>
            </div>

            <div className="cv-card languages-card reveal">
              <h3>${t.languagesTitle}</h3>
              <div className="lang-items">
                <span>Arabic (Native)</span>
                <span>French (Good)</span>
                <span>English (Good)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
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

