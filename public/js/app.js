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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

      <section className="py-32 relative overflow-hidden bg-[#030303]">
        {/* Radial Glow Layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-caramel/10 blur-[120px] rounded-full -z-10 opacity-50"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial=${{ opacity: 0, y: 20 }}
            whileInView=${{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-4">
              Featured <span className="text-caramel">Work</span>
            </h2>
            <div className="h-1.5 w-24 bg-caramel mx-auto rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
          </motion.div>
          
          <motion.div 
            initial=${{ opacity: 0, y: 60 }}
            whileInView=${{ opacity: 1, y: 0 }}
            viewport=${{ once: true }}
            style=${{ 
              rotateX: mousePos.y * -0.1, 
              rotateY: mousePos.x * 0.1,
              transformStyle: "preserve-3d"
            }}
            className="relative bg-surface backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 md:p-16 mb-32 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-caramel/30 transition-colors duration-500"
          >
            {/* Subtle Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            
            <div className="absolute top-8 right-8 z-20">
              <span className="px-6 py-2 bg-caramel text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                ${t.featuredTitle}
              </span>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10" style=${{ transform: "translateZ(50px)" }}>
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl text-caramel shadow-2xl">
                  <i className="fa-solid fa-rocket"></i>
                </div>
                <div>
                  <h3 className="text-5xl font-black text-white mb-6 tracking-tight">Edropo</h3>
                  <p className="text-muted text-xl leading-relaxed max-w-lg font-medium opacity-80">
                    ${t.edropoDesc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  ${["SaaS", "AI", "E-commerce"].map(tag => html`
                    <motion.span 
                      whileHover=${{ scale: 1.1, backgroundColor: "rgba(99, 102, 241, 0.2)", borderColor: "rgba(99, 102, 241, 0.4)" }}
                      className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-muted uppercase tracking-widest transition-all cursor-default"
                    >
                      ${tag}
                    </motion.span>
                  `)}
                </div>
                <div className="pt-6">
                  <motion.a 
                    href="https://edropo.com" 
                    target="_blank" 
                    whileHover=${{ scale: 1.05, y: -5 }}
                    whileTap=${{ scale: 0.95 }}
                    className="inline-flex items-center gap-4 bg-gradient-to-r from-caramel to-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.5)] transition-all"
                  >
                    <span>Visit Website</span>
                    <i className="fa-solid fa-arrow-right text-sm"></i>
                  </motion.a>
                </div>
              </div>
              
              <div className="relative flex justify-center items-center" style=${{ transform: "translateZ(100px)" }}>
                <motion.div
                  animate=${{ y: [0, -15, 0] }}
                  transition=${{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  whileHover=${{ rotateY: -15, rotateX: 10, scale: 1.08 }}
                  className="relative w-full max-w-[500px] rounded-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 bg-black/40 group-hover:border-caramel/50 transition-all duration-700"
                >
                  <img src="/photo/image.png" alt="Edropo Dashboard" className="w-full h-auto object-cover" />
                  
                  {/* Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </motion.div>
                
                {/* Glow behind image */}
                <div className="absolute -inset-10 bg-caramel/20 blur-[100px] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                {/* Visual Reflection under image */}
                <div className="absolute -bottom-16 w-3/4 h-12 bg-caramel/20 blur-3xl rounded-[100%] opacity-0 group-hover:opacity-40 transition-all duration-700"></div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            ${repos.length > 0 ? repos.map((repo, idx) => html`
              <motion.div 
                key=${repo.id}
                initial=${{ opacity: 0, y: 30 }}
                whileInView=${{ opacity: 1, y: 0 }}
                viewport=${{ once: true }}
                transition=${{ delay: idx * 0.1 }}
                whileHover=${{ y: -15, borderColor: "rgba(99, 102, 241, 0.4)" }}
                className="bg-surface backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl transition-all flex flex-col group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-caramel/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl text-caramel group-hover:bg-caramel group-hover:text-white transition-all duration-500">
                    <i className="fa-brands fa-github"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">${repo.name}</h3>
                  <p className="text-muted text-base leading-relaxed opacity-70 line-clamp-3">${repo.description || "Elite engineering project by Khairi Bouzakher."}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-4">
                    ${repo.language ? html`<span className="text-[10px] font-black px-4 py-1.5 bg-white/5 rounded-lg text-muted uppercase tracking-widest border border-white/5">${repo.language}</span>` : ""}
                    <span className="text-[10px] font-black px-4 py-1.5 bg-white/5 rounded-lg text-muted uppercase tracking-widest border border-white/5">⭐ ${repo.stargazers_count}</span>
                  </div>
                  
                  <div className="pt-6">
                    <motion.a 
                      href=${repo.html_url} 
                      target="_blank" 
                      whileHover=${{ x: 5 }}
                      className="inline-flex items-center gap-3 text-white font-bold text-sm hover:text-caramel transition-colors"
                    >
                      <span>Explore Repository</span>
                      <i className="fa-solid fa-arrow-right-long text-xs"></i>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            `) : html`<div className="col-span-full py-32 text-center text-muted font-bold tracking-widest animate-pulse uppercase">${t.loading}</div>`}
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

