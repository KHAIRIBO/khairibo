import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";
import { inject } from "https://esm.sh/@vercel/analytics";
import { motion, AnimatePresence } from "https://esm.sh/framer-motion@11.1.7";

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

      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <motion.h2 
            initial=${{ opacity: 0, y: 20 }}
            whileInView=${{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            ${t.projectsTitle}
          </motion.h2>
          
          <motion.div 
            initial=${{ opacity: 0, y: 40 }}
            whileInView=${{ opacity: 1, y: 0 }}
            viewport=${{ once: true }}
            transition=${{ duration: 0.8, ease: "easeOut" }}
            className="relative bg-surface backdrop-blur-2xl border border-glass-border rounded-[2rem] p-8 md:p-12 mb-20 shadow-2xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-caramel to-indigo-600 text-white px-8 py-2 font-bold text-xs uppercase rounded-bl-3xl shadow-lg z-20">
              ${t.featuredTitle}
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="w-14 h-14 bg-caramel/10 rounded-2xl flex items-center justify-center text-3xl text-caramel shadow-inner">
                  <i className="fa-solid fa-rocket"></i>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-white mb-4 leading-tight">Edropo</h3>
                  <p className="text-muted text-lg leading-relaxed max-w-md">${t.edropoDesc}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  ${["SaaS", "AI", "E-commerce"].map(tag => html`
                    <motion.span 
                      whileHover=${{ scale: 1.05, y: -2 }}
                      className="px-4 py-1.5 bg-white/5 border border-glass-border rounded-full text-xs font-bold text-muted tracking-wider uppercase hover:text-caramel hover:border-caramel/50 transition-colors cursor-default"
                    >
                      ${tag}
                    </motion.span>
                  `)}
                </div>
                <div className="pt-4">
                  <motion.a 
                    href="https://edropo.com" 
                    target="_blank" 
                    whileHover=${{ scale: 1.02, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)" }}
                    whileTap=${{ scale: 0.98 }}
                    className="inline-block bg-caramel text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10">Visit Website</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-caramel opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  </motion.a>
                </div>
              </div>
              
              <div className="relative perspective-1000">
                <motion.div
                  whileHover=${{ rotateY: -10, rotateX: 5, scale: 1.05 }}
                  transition=${{ type: "spring", stiffness: 300, damping: 20 }}
                  className="rounded-3xl overflow-hidden shadow-2xl border border-glass-border bg-black/20"
                >
                  <img src="/photo/image.png" alt="Edropo Dashboard" className="w-full h-auto transform-gpu" />
                </motion.div>
                <div className="absolute -inset-4 bg-caramel/20 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${repos.length > 0 ? repos.map((repo, idx) => html`
              <motion.div 
                key=${repo.id}
                initial=${{ opacity: 0, y: 30 }}
                whileInView=${{ opacity: 1, y: 0 }}
                viewport=${{ once: true }}
                transition=${{ delay: idx * 0.1, duration: 0.5 }}
                whileHover=${{ y: -10 }}
                className="bg-surface backdrop-blur-xl border border-glass-border rounded-3xl p-8 shadow-xl hover:shadow-caramel/10 transition-all flex flex-col group"
              >
                <div className="w-12 h-12 bg-caramel/10 rounded-xl flex items-center justify-center text-xl text-caramel mb-6 group-hover:scale-110 transition-transform">
                  <i className="fa-brands fa-github"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-caramel transition-colors">${repo.name}</h3>
                <p className="text-muted text-sm leading-relaxed mb-6 flex-grow">${repo.description || "Premium project developed by Khairi Bouzakher."}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  ${repo.language ? html`<span className="text-[10px] font-bold px-3 py-1 bg-white/5 rounded-md text-muted uppercase tracking-tighter border border-glass-border">${repo.language}</span>` : ""}
                  <span className="text-[10px] font-bold px-3 py-1 bg-white/5 rounded-md text-muted uppercase tracking-tighter border border-glass-border">⭐ ${repo.stargazers_count}</span>
                </div>
                <motion.a 
                  href=${repo.html_url} 
                  target="_blank" 
                  whileHover=${{ scale: 1.05 }}
                  whileTap=${{ scale: 0.95 }}
                  className="w-full text-center py-3 bg-white/5 border border-glass-border rounded-xl text-white font-bold text-sm hover:bg-caramel hover:border-caramel transition-all"
                >
                  ${t.viewProject}
                </motion.a>
              </motion.div>
            `) : html`<div className="col-span-full py-20 text-center text-muted animate-pulse">${t.loading}</div>`}
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

