console.log("main.js starting...");
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";


const html = htm.bind(React.createElement);

let supabase;
const initSupabase = async () => {
  try {
    const res = await fetch("/api/config");
    const config = await res.json();
    if (config.supabaseUrl && config.supabaseKey) {
      supabase = createClient(config.supabaseUrl, config.supabaseKey);
      return supabase;
    }
  } catch (err) {
    console.error("Failed to init Supabase client", err);
  }
};

const translations = {
  en: {
    navHome: "Home",
    navLogin: "Login",
    intro: "Hi, I'm Khairi Bouzakher,",
    title: "I'M A\nSTUDENT",
    lead: "Computer Science student specializing in Web Development and Robotics Engineering.",
    ctaProjects: "View Projects",
    ctaCv: "Download CV",
    loginTitle: "Secure Access",
    loginDesc: "Use your Google account to access your personalized dashboard.",
    loginSubmit: "Sign In with Google",
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
    loading: "Loading...",
    navBlog: "Blog",
    blogTitle: "My Blog",
    readMore: "Read More",
    backToBlog: "Back to Blog",
    noBlogs: "No blog posts found yet. Check back soon!",
    navDashboard: "Dashboard",
    dashTitle: "User Dashboard",
    dashWelcome: "Welcome back,",
    dashProfile: "Profile Information",
    dashStats: "Quick Stats",
    dashSettings: "Settings"
  },
  fr: {
    navHome: "Accueil",
    navLogin: "Connexion",
    intro: "Salut, je suis Khairi Bouzakher,",
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
    intro: "أهلاً، أنا خيري بوزاخر،",
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
  // Simple typewriter component for subtitle
  const Typewriter = ({ text = "", speed = 60 }) => {
    const [displayed, setDisplayed] = useState("");
    useEffect(() => {
      let mounted = true;
      let i = 0;
      const tick = () => {
        if (!mounted) return;
        if (i <= text.length) {
          setDisplayed(text.slice(0, i));
          i++;
          setTimeout(tick, speed);
        } else {
          // pause then clear and restart
          setTimeout(() => {
            if (!mounted) return;
            i = 0;
            setDisplayed("");
            setTimeout(tick, 500);
          }, 1400);
        }
      };
      tick();
      return () => { mounted = false; };
    }, [text, speed]);
    return html`<span>${displayed}</span>`;
  };

  const projectsRef = useRef(null);
  const skillsRef = useRef(null);
  const contactRef = useRef(null);

  const scrollToProjects = () => projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToSkills = () => skillsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  const [lang, setLang] = useState(localStorage.getItem("site_lang") || "en");
  const [dbConnected, setDbConnected] = useState(null); 
  const [route, setRoute] = useState(window.location.pathname || "/");
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("is_admin") === "true");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    // Fetch Blogs
    fetch("/api/blogs")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogs(data);
      })
      .catch(err => console.error("Blog fetch failed", err));
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




  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (data.user) {
          // Flatten user object if it comes from Passport profile
          const userObj = {
            email: data.user.emails ? data.user.emails[0].value : data.user.email,
            displayName: data.user.displayName
          };
          setUser(userObj);
        }
      } catch (err) {
        console.error("Session check failed", err);
      }
    };
    checkUser();
    
    initSupabase();
  }, []);

  // Auth Protection for Dashboard
  useEffect(() => {
    if (route === "/dashboard" && !user) {
      navigate("/login");
    }
  }, [route, user]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 3) {
      setShowAdminAuth(true);
      setLogoClicks(0);
    } else {
      navigate("/");
    }
  };

  const verifyAdminCode = (e) => {
    e.preventDefault();
    if (adminCode === "6cc4aca9df") {
      setIsAdmin(true);
      localStorage.setItem("is_admin", "true");
      setShowAdminAuth(false);
      setAdminCode("");
      navigate("/admin");
    } else {
      alert("Invalid Code");
      setAdminCode("");
    }
  };

  const renderContent = () => {

    if (route === "/blog") {
      return html`
        <main className="hero">
          <div className="container">
            <header className="page-header">
              <h1 className="title text-center mb-12">${t.blogTitle}</h1>
            </header>
            
            <div className="blog-grid">
              ${blogs.length > 0 
                ? blogs.map(blog => html`
                    <${motion.article} 
                      key=${blog.id}
                      initial=${{ opacity: 0, y: 20 }}
                      animate=${{ opacity: 1, y: 0 }}
                      className="blog-card"
                      onClick=${() => { setSelectedBlog(blog); navigate(`/blog/${blog.id}`); }}
                    >
                      <div className="blog-image">
                        <img src=${blog.image_url || 'https://via.placeholder.com/400x250'} alt=${blog.title} />
                      </div>
                      <div className="blog-body">
                        <span className="blog-date">${new Date(blog.created_at).toLocaleDateString()}</span>
                        <h3>${blog.title}</h3>
                        <p>${blog.excerpt}</p>
                        <button className="read-more-btn">${t.readMore} <i className="fa-solid fa-arrow-right-long"></i></button>
                      </div>
                    </${motion.article}>
                  `)
                : html`<div className="col-span-full text-center py-20 opacity-50">${t.noBlogs}</div>`
              }
            </div>
          </div>
        </main>
      `;
    }

    if (route === "/dashboard" && user) {
      return html`
        <main className="dashboard-page hero">
          <div className="container">
            <header className="dash-header mb-12">
              <h1 className="title">${t.dashTitle}</h1>
              <p className="lead">${t.dashWelcome} <strong>${user.displayName || user.email.split('@')[0]}</strong></p>
            </header>

            <div className="dash-grid">
              <div className="dash-card profile-info-card">
                <h3><i className="fa-solid fa-user-circle mr-2"></i> ${t.dashProfile}</h3>
                <div className="profile-details">
                  <img src=${user.photos ? user.photos[0].value : 'https://via.placeholder.com/100'} className="dash-avatar" />
                  <div className="details">
                    <p><strong>Name:</strong> ${user.displayName || 'N/A'}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Provider:</strong> Google OAuth</p>
                  </div>
                </div>
              </div>

              <div className="dash-card stats-card">
                <h3><i className="fa-solid fa-chart-line mr-2"></i> ${t.dashStats}</h3>
                <div className="stats-row">
                  <div className="stat-item">
                    <span className="stat-value">${repos.length}</span>
                    <span className="stat-label">Projects</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">${blogs.length}</span>
                    <span className="stat-label">Posts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">Elite</span>
                    <span className="stat-label">Rank</span>
                  </div>
                </div>
              </div>

              <div className="dash-card settings-preview-card">
                <h3><i className="fa-solid fa-cog mr-2"></i> ${t.dashSettings}</h3>
                <p className="opacity-50 mb-6">Manage your account settings and preferences.</p>
                <button className="cta secondary w-full">Edit Profile</button>
                <button className="cta secondary w-full mt-3" onClick=${handleLogout}>Sign Out</button>
              </div>
            </div>
          </div>
        </main>
      `;
    }

    if (route === "/admin" && isAdmin) {
      return html`
        <main className="admin-page hero">
          <div className="container">
            <header className="page-header mb-12 flex justify-between items-center">
              <div>
                <h1 className="title">Admin Control</h1>
                <p className="lead text-caramel font-bold">Logged in as: ${user ? user.displayName : 'Guest Admin'}</p>
              </div>
              <button className="cta secondary" onClick=${() => { setIsAdmin(false); localStorage.removeItem("is_admin"); navigate("/"); }}>Deactivate</button>
            </header>

            <div className="admin-grid">
              <div className="dash-card">
                <h3>Active Session</h3>
                <div className="profile-details mb-6">
                  <img src=${user && user.photos ? user.photos[0].value : 'https://via.placeholder.com/60'} className="dash-avatar" style=${{ width: '50px', height: '50px' }} />
                  <div className="details">
                    <p className="font-bold">${user ? user.displayName : 'Anonymous'}</p>
                    <p className="text-xs opacity-60">${user ? user.email : 'No email'}</p>
                  </div>
                </div>
                <div className="admin-actions">
                  <button className="cta w-full mb-3" onClick=${() => alert("Blog editor opening...")}>Create Blog Post</button>
                  <button className="cta secondary w-full">Manage Content</button>
                </div>
              </div>

              <div className="dash-card">
                <h3>Access Logs</h3>
                <div className="logs-view bg-black/40 rounded-xl p-4 font-mono text-xs h-40 overflow-y-auto">
                  <p className="text-green-400">[AUTH]: ${user ? user.displayName : 'Guest'} authenticated via Google</p>
                  <p className="text-blue-400">[SESSION]: Token valid for 24h</p>
                  <p className="text-purple-400">[SYS]: Identity override active</p>
                  <p className="text-gray-500">[DB]: Blogs table connection verified</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }

    if (route.startsWith("/blog/")) {
      const blog = selectedBlog || blogs.find(b => b.id.toString() === route.split("/")[2]);
      if (!blog) return html`<div className="container py-40 text-center">${t.loading}</div>`;

      return html`
        <main className="blog-post-page">
          <div className="container">
            <button className="cta secondary mb-8" onClick=${() => navigate("/blog")}>
              <i className="fa-solid fa-arrow-left-long mr-2"></i> ${t.backToBlog}
            </button>
            
            <article className="blog-content page-card">
              <div className="blog-post-header">
                <span className="blog-date">${new Date(blog.created_at).toLocaleDateString()}</span>
                <h1>${blog.title}</h1>
                <div className="post-meta">By ${blog.author || 'Khairi'}</div>
              </div>
              
              <div className="blog-post-image">
                <img src=${blog.image_url || 'https://via.placeholder.com/1200x600'} alt=${blog.title} />
              </div>
              
              <div className="blog-post-body" dangerouslySetInnerHTML=${{ __html: blog.content }}></div>
            </article>
          </div>
        </main>
      `;
    }

    return html`
      <main className="hero" id="home">
        <div className="container hero-grid">
          <section className="hero-content">
            <p className="intro">${t.intro.replace(/,$/, '')} — ${t.title.split("\n").join(' ') } ${user ? html`<span>(Welcome, ${user.email.split('@')[0]})</span>` : ""}</p>
            <h1 className="title">${t.intro.replace(/,$/, '')} — ${t.title.split("\n").join(' ')}</h1>

            <div className="cta-row">
              <button className="cta" onClick=${scrollToProjects}>${t.ctaProjects}</button>
              <a href="/Khairi_Bouzakher_CV.pdf" download="Khairi_Bouzakher_CV.pdf" className="cta secondary">${t.ctaCv}</a>
              <a href="https://linkedin.com/in/khairi-bouzakher/" target="_blank" className="social-link" title="LinkedIn">
                <i className="fa-brands fa-linkedin"></i>
              </a>
            </div>

          </section>
          <figure className="hero-image" aria-hidden="true">
            <${motion.img} 
              src="photo/khairibo.png" 
              alt="Avatar" 
              className="avatar"
              style=${{ rotateY: mousePos.x * 0.5, rotateX: mousePos.y * -0.5 }}
              animate=${{ y: [0, -15, 0] }}
              transition=${{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </figure>
        </div>
      </main>

      <section className="cv-section" ref=${projectsRef}>
        <div className="container" ref=${projectsRef}>
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

      <section className="py-20" ref=${skillsRef} id="skills">
        <div className="container">
          <h2 className="title mb-6">Skills</h2>
          <div className="page-card reveal">
            <p>Core skills: HTML, CSS, JavaScript, PHP, Python, SQL. Interested in web systems and robotics.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#05050a]" ref=${contactRef} id="contact">
        <div className="container">
          <h2 className="title mb-6">Contact</h2>
          <div className="page-card reveal">
            <p>Want to collaborate? Reach out via email: <a href="mailto:khairi@example.com">khairi@example.com</a></p>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-6 overflow-hidden bg-gradient-to-br from-black via-purple-950 to-blue-950">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600 opacity-20 blur-[120px] rounded-full"></div>

        <${motion.div}
          initial=${{ opacity: 0, y: 80 }}
          whileInView=${{ opacity: 1, y: 0 }}
          transition=${{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 text-sm rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30">
              🚀 ${t.featuredTitle}
            </div>

            <h2 className="text-4xl font-bold text-white">
              Edropo
            </h2>

            <p className="text-gray-300 max-w-md">
              ${t.edropoDesc}
            </p>

            <div className="flex gap-3 flex-wrap">
              ${["SAAS", "AI", "E-COMMERCE"].map((tag) => html`
                <span
                  key=${tag}
                  className="px-3 py-1 text-sm rounded-full bg-white/10 border border-white/20 text-gray-200 hover:scale-105 hover:border-purple-400 transition cursor-default"
                >
                  ${tag}
                </span>
              `)}
            </div>

            <${motion.a}
              href="https://edropo.com"
              target="_blank"
              whileHover=${{ scale: 1.05 }}
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition"
            >
              Visit Website
            </${motion.a}>
          </div>

          <${motion.div}
            whileHover=${{ scale: 1.05, rotateY: 8 }}
            transition=${{ type: "spring", stiffness: 120 }}
            className="relative flex justify-center"
            style=${{ perspective: "1000px" }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-30 rounded-2xl"></div>

              <img
                src="/photo/image.png"
                alt="project"
                className="relative rounded-2xl shadow-2xl max-w-2xl border border-white/10 w-full h-auto"
              />
            </div>
          </${motion.div}>
        </${motion.div}>
      </section>

      <section className="py-24 bg-[#030303]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            ${repos.length > 0 ? repos.map((repo, idx) => html`
              <${motion.div} 
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
                    <${motion.a} 
                      href=${repo.html_url} 
                      target="_blank" 
                      whileHover=${{ x: 5 }}
                      className="inline-flex items-center gap-3 text-white font-bold text-sm hover:text-caramel transition-colors"
                    >
                      <span>Explore Repository</span>
                      <i className="fa-solid fa-arrow-right-long text-xs"></i>
                    </${motion.a}>
                  </div>
                </div>
              </${motion.div}>
            `) : html`<div className="col-span-full py-32 text-center text-muted font-bold tracking-widest animate-pulse uppercase">${t.loading}</div>`}
          </div>
        </div>
      </section>
    `;
  };

  return html`

    <div>
      <div className="bg-matrix"><div className="code-lines"></div></div>
      <header className="site-header">
        <div className="container header-inner">
          <${motion.a} 
            className="logo" 
            href="#" 
            onClick=${handleLogoClick}
            whileHover=${{ scale: 1.05, filter: "brightness(1.2)" }}
            whileTap=${{ scale: 0.95 }}
            transition=${{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Khairi <${motion.span} 
              className="logo-accent"
              animate=${{ 
                color: ["#94a3b8", "#38bdf8", "#94a3b8"],
                textShadow: ["0 0 0px rgba(56,189,248,0)", "0 0 12px rgba(56,189,248,0.4)", "0 0 0px rgba(56,189,248,0)"]
              }}
              transition=${{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >Bouzakher</${motion.span}>
          </${motion.a}>

          <div className="header-right">

            <button className="burger-menu" onClick=${() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <nav className="main-nav ${mobileMenuOpen ? 'mobile-open' : ''}" aria-label="Main navigation">
              <a href="#" onClick=${(e) => { e.preventDefault(); navigate("/"); setMobileMenuOpen(false); }}>${t.navHome}</a>
              <a href="#" onClick=${(e) => { e.preventDefault(); scrollToProjects(); setMobileMenuOpen(false); }}>Projects</a>
              <a href="#" onClick=${(e) => { e.preventDefault(); scrollToSkills(); setMobileMenuOpen(false); }}>Skills</a>
              <a href="#" onClick=${(e) => { e.preventDefault(); scrollToContact(); setMobileMenuOpen(false); }}>Contact</a>
              ${user 
                ? html`
                    <a href="#" onClick=${(e) => { e.preventDefault(); navigate("/dashboard"); setMobileMenuOpen(false); }}>${t.navDashboard}</a>
                    <a href="#" onClick=${(e) => { e.preventDefault(); handleLogout(); setMobileMenuOpen(false); }}>Logout</a>
                  `
                : html`
                    <button className="google-btn header-google-btn" onClick=${handleGoogleLogin}>
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                      Sign In
                    </button>
                  `
              }
            </nav>

            <div className="header-controls ${mobileMenuOpen ? 'mobile-open' : ''}">
              <div className="lang-switch" aria-label="Language switch">
                ${["en", "fr", "ar"].map((code) =>
    html`<button className=${`lang-btn ${lang === code ? "active" : ""}`} onClick=${() => setLang(code)}>${code.toUpperCase()}</button>`
  )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <${AnimatePresence} mode="wait">
        <${motion.div}
          key=${route}
          initial=${{ opacity: 0, y: 10 }}
          animate=${{ opacity: 1, y: 0 }}
          exit=${{ opacity: 0, y: -10 }}
          transition=${{ duration: 0.3, ease: "easeOut" }}
        >
          ${renderContent()}
        </${motion.div}>
      </${AnimatePresence}>

      <${AnimatePresence}>
        ${showAdminAuth && html`
          <${motion.div} 
            initial=${{ opacity: 0 }}
            animate=${{ opacity: 1 }}
            exit=${{ opacity: 0 }}
            className="admin-modal-overlay"
          >
            <${motion.div} 
              initial=${{ scale: 0.9, y: 20 }}
              animate=${{ scale: 1, y: 0 }}
              className="admin-modal"
            >
              <h2>Authorization Required</h2>
              <p>Enter the security override code</p>
              <form onSubmit=${verifyAdminCode}>
                <input 
                  type="password" 
                  autoFocus
                  placeholder="Secret Code" 
                  value=${adminCode} 
                  onChange=${(e) => setAdminCode(e.target.value)} 
                />
                <div className="modal-actions">
                  <button type="button" className="cta secondary" onClick=${() => setShowAdminAuth(false)}>Cancel</button>
                  <button type="submit" className="cta">Authorize</button>
                </div>
              </form>
            </${motion.div}>
          </${motion.div}>
        `}
      </${AnimatePresence}>

      <footer className="site-footer">
        <div className="container">&copy; ${new Date().getFullYear()} khairi bouzakher</div>
      </footer>
    </div>
  `;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);

