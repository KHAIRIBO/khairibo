import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";
import { inject } from "https://esm.sh/@vercel/analytics";

inject();


const html = htm.bind(React.createElement);

const translations = {
  en: {
    navHome: "Home",
    navLogin: "Login",
    intro: "Hi, I'm khairi,",
    title: "I'M A\nSTUDENT",
    lead: "Computer Science student specializing in Web Development and Robotics Engineering.",
    ctaProjects: "View Projects",
    ctaCv: "Download CV",
    loginTitle: "Dashboard Access",
    loginDesc: "Sign in to manage your submissions and database settings.",
    loginEmail: "Email",
    loginPassword: "Password",
    loginSubmit: "Sign In",
    aboutTitle: "About Me",
    aboutDesc: "Motivated Computer Science student specializing in Web Development and Robotics. Skilled in HTML, PHP, Python, and SQL with a strong interest in building real-world solutions. Active in clubs and robotics competitions with strong teamwork and problem-solving skills.",
    educationTitle: "Education",
    eduPlace: "ISIMG - Higher Institute of Computer Science and Multimedia of Gabès",
    eduSpec: "Specialization: Web Development & Robotics Engineering (LISI)",
    eduDate: "Baccalaureate (2023/2024) - Good average",
    skillsTitle: "Technical Skills",
    skillsList: ["HTML, PHP, Python, SQL", "Databases: MySQL, PostgreSQL", "Web Development (Front-end & Back-end basics)"],
    experienceTitle: "Experience & Activities",
    expList: ["Active member in music, social, and tech clubs", "Participated in robotics competitions", "Earned certificates in robotics and IT"],
    languagesTitle: "Languages",
    langList: ["Arabic (Native)", "French (Good)", "English (Good)"],
    projectsTitle: "My Projects",
    viewProject: "View on GitHub",
    featuredTitle: "Featured Project",
    edropoDesc: "Edropo - The Smart E-commerce System. Launch your dropshipping business with winning products, AI-powered insights, and a proven 90-day growth roadmap.",
    project1Desc: "E-commerce web application inspired by Shopify Collective, featuring full admin dashboard and user management.",
    project2Desc: "Tunisian cuisine collection featuring traditional and modern dishes from across Tunisia.",
    project3Desc: "Modern minimalist portfolio with dark mode, 3D animations, and Supabase integration.",
    loading: "Loading..."
  },
  fr: {
    navHome: "Accueil",
    navLogin: "Connexion",
    intro: "Salut, je suis khairi,",
    title: "JE SUIS\nÉTUDIANT",
    lead: "Étudiant en Informatique spécialisé en Développement Web et Ingénierie Robotique.",
    ctaProjects: "Mes Projets",
    ctaCv: "Télécharger CV",
    loginTitle: "Accès Dashboard",
    loginDesc: "Connectez-vous pour gérer vos soumissions et paramètres.",
    loginEmail: "Email",
    loginPassword: "Mot de passe",
    loginSubmit: "Se connecter",
    aboutTitle: "À propos",
    aboutDesc: "Étudiant motivé en informatique spécialisé en développement Web et robotique. Compétent en HTML, PHP, Python et SQL avec un fort intérêt pour la création de solutions réelles. Actif dans les clubs et les compétitions de robotique.",
    educationTitle: "Formation",
    eduPlace: "ISIMG - Institut Supérieur d'Informatique et de Multimédia de Gabès",
    eduSpec: "Spécialisation : Développement Web & Ingénierie Robotique (LISI)",
    eduDate: "Baccalauréat (2023/2024) - Mention Bien",
    skillsTitle: "Compétences",
    skillsList: ["HTML, PHP, Python, SQL", "Bases de données : MySQL, PostgreSQL", "Développement Web (Front-end & Back-end)"],
    experienceTitle: "Expériences & Activités",
    expList: ["Membre actif de clubs musicaux, sociaux et technologiques", "Participation à des compétitions de robotique", "Certificats en robotique et informatique"],
    languagesTitle: "Langues",
    langList: ["Arabe (Maternel)", "Français (Bien)", "Anglais (Bien)"],
    projectsTitle: "Mes Projets",
    viewProject: "Voir sur GitHub",
    featuredTitle: "Projet Phare",
    edropoDesc: "Edropo - Le Système E-commerce Intelligent. Lancez votre business de dropshipping avec des produits gagnants et des outils IA.",
    project1Desc: "Application e-commerce inspirée de Shopify Collective, avec tableau de bord complet et gestion d'utilisateurs.",
    project2Desc: "Collection de cuisine tunisienne présentant des plats traditionnels et modernes de toute la Tunisie.",
    project3Desc: "Portfolio moderne et minimaliste avec mode sombre, animations 3D et intégration Supabase.",
    loading: "Chargement..."
  },
  ar: {
    navHome: "الرئيسية",
    navLogin: "تسجيل الدخول",
    intro: "أهلاً، أنا خيري،",
    title: "أنا\nطالب",
    lead: "طالب هندسة إعلامية متخصص في تطوير الويب والروبوتات.",
    ctaProjects: "تصفح المشاريع",
    ctaCv: "تحميل السيرة الذاتية",
    loginTitle: "لوحة التحكم",
    loginDesc: "قم بتسجيل الدخول لإدارة بياناتك وإعدادات قاعدة البيانات.",
    loginEmail: "البريد الإلكتروني",
    loginPassword: "كلمة المرور",
    loginSubmit: "تسجيل الدخول",
    aboutTitle: "من أنا",
    aboutDesc: "طالب هندسة إعلامية متميز متخصص في تطوير الويب والروبوتات. متمرس في HTML، PHP، Python، و SQL مع شغف كبير ببناء حلول واقعية. عضو نشط في نوادي التكنولوجيا ومسابقات الروبوتات.",
    educationTitle: "التعليم",
    eduPlace: "ISIMG - المعهد العالي للإعلامية والملتيميديا بقابس",
    eduSpec: "التخصص: هندسة تطوير الويب والروبوتات (LISI)",
    eduDate: "بكالوريا (2023/2024) - معدل جيد",
    skillsTitle: "المهارات التقنية",
    skillsList: ["HTML, PHP, Python, SQL", "قواعد البيانات: MySQL, PostgreSQL", "تطوير الويب (الواجهات الأمامية والخلفية)"],
    experienceTitle: "الخبرات والأنشطة",
    expList: ["عضو نشط في نوادي الموسيقى، الاجتماع والتكنولوجيا", "مشارك في مسابقات الروبوتات الوطنية", "حاصل على شهادات في مجال الروبوتات والمعلوماتية"],
    languagesTitle: "اللغات",
    langList: ["العربية (اللغة الأم)", "الفرنسية (جيد)", "الإنجليزية (جيد)"],
    projectsTitle: "مشاريعي",
    viewProject: "عرض على GitHub",
    featuredTitle: "المشروع الأبرز",
    edropoDesc: "Edropo - النظام الذكي للتجارة الإلكترونية. ابدأ عملك في التجارة الإلكترونية مع منتجات رابحة وأدوات مدعومة بالذكاء الاصطناعي.",
    project1Desc: "تطبيق تجارة إلكترونية مستوحى من Shopify Collective، يتميز بلوحة تحكم كاملة وإدارة المستخدمين.",
    project2Desc: "مجموعة من المأكولات التونسية تضم أطباقًا تقليدية وحديثة من جميع أنحاء تونس.",
    project3Desc: "بورتفوليو عصري وبسيط مع وضع مظلم، رسوم متحركة ثلاثية الأبعاد، وتكامل مع Supabase.",
    loading: "جاري التحميل..."
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

  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch("/api/db-status")
      .then(res => res.json())
      .then(data => setDbConnected(data.connected))
      .catch(() => setDbConnected(false));

    // Dynamic GitHub Fetch
    fetch("https://api.github.com/users/KHAIRIBO/repos?sort=updated&per_page=6")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data.filter(r => r.name !== "khairibo" && r.name !== "-"));
        }
      })
      .catch(e => console.error("GitHub fetch failed", e));
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
              <a href="https://linkedin.com/in/khairi-bouzakher/" target="_blank" className="social-link" title="LinkedIn">
                <i className="fa-brands fa-linkedin"></i>
              </a>
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
              <p>${t.aboutDesc}</p>
            </div>
            
            <div className="cv-card education-card reveal">
              <h3>${t.educationTitle}</h3>
              <div className="cv-item">
                <p className="item-title">${t.eduPlace}</p>
                <p className="item-subtitle">${t.eduSpec}</p>
                <p className="item-date">${t.eduDate}</p>
              </div>
            </div>

            <div className="cv-card skills-card reveal">
              <h3>${t.skillsTitle}</h3>
              <ul className="skills-list">
                ${t.skillsList.map(item => html`<li>${item}</li>`)}
              </ul>
            </div>

            <div className="cv-card experience-card reveal">
              <h3>${t.experienceTitle}</h3>
              <ul className="cv-list">
                ${t.expList.map(item => html`<li>${item}</li>`)}
              </ul>
            </div>

            <div className="cv-card languages-card reveal">
              <h3>${t.languagesTitle}</h3>
              <div className="lang-items">
                ${t.langList.map(item => html`<span>${item}</span>`)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cv-section projects-section">
        <div className="container">
          <h2 className="section-title reveal">${t.projectsTitle}</h2>
          
          <div className="featured-project reveal active">
            <div className="featured-badge">${t.featuredTitle}</div>
            <div className="featured-grid">
              <div className="featured-content">
                <div className="project-icon">
                  <i className="fa-solid fa-rocket"></i>
                </div>
                <h3>Edropo</h3>
                <p>${t.edropoDesc}</p>
                <div className="project-tags">
                  <span>SaaS</span>
                  <span>AI</span>
                  <span>E-commerce</span>
                </div>
                <div className="cta-row">
                  <a href="https://edropo.com" target="_blank" className="cta mini">Visit Website</a>
                </div>
              </div>
              <div className="featured-image">
                <img src="/photo/image.png" alt="Edropo Dashboard" />
              </div>

            </div>
          </div>

          <div className="cv-grid projects-grid">
            ${repos.length > 0 ? repos.map(repo => html`
              <div key=${repo.id} className="cv-card project-card reveal active">
                <div className="project-icon">
                  <i className="fa-brands fa-github"></i>
                </div>
                <h3>${repo.name}</h3>
                <p>${repo.description || "Project created by Khairi Bouzakher."}</p>
                <div className="project-tags">
                  ${repo.language ? html`<span>${repo.language}</span>` : ""}
                  <span>⭐ ${repo.stargazers_count}</span>
                </div>
                <a href=${repo.html_url} target="_blank" className="cta secondary mini">${t.viewProject}</a>
              </div>
            `) : html`<p className="loading-text">${t.loading}</p>`}
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

