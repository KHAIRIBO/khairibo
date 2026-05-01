import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

// Senior Data Fetching Helpers (Communicating via Server API)
// Static Data (No longer communicating with server API)
const api = {
  fetchProjects: async () => [
    { id: 1, title: "Modern Portfolio", description: "A high-end Bento style portfolio design.", link: "#" },
    { id: 2, title: "SaaS Dashboard", description: "A minimalist dashboard for SaaS platforms.", link: "#" },
    { id: 3, title: "E-commerce App", description: "A full-featured shopping experience.", link: "#" }
  ],
  fetchAbout: async () => ({
    bio: "I'm a passionate developer building modern web experiences with Node.js and React.",
    skills: "JavaScript, Node.js, React, CSS, HTML5",
    experience: "5+ years of web development",
    education: "Bachelor's in Computer Science"
  }),
  fetchContacts: async () => [
    { name: "Email", platform: "Email", url: "mailto:hello@example.com" },
    { name: "LinkedIn", platform: "LinkedIn", url: "https://linkedin.com" }
  ],
  submitContactForm: async (name, email, message) => {
    console.log("Form submitted locally:", { name, email, message });
    return { success: true };
  },
  fetchContactSubmissions: async () => [],
  deleteProject: async () => ({ success: true }),
  deleteContactSubmission: async () => ({ success: true })
};


const ADMIN_PASSWORD_KEY = "admin_password";
const ADMIN_AUTH_KEY = "admin_authed";
const DEFAULT_TEST_PASSWORD = "6cc4aca9df";

const translations = {
  en: {
    intro: "Hi, I'm khairi,",
    title: "I'M A\nSTUDENT",
    lead: "Welcome to my portfolio. Feel free to explore my projects and download my CV at any time. Do not hesitate to contact me.",
    ctaProjects: "View My Projects",
    ctaCv: "Download CV",
    navHome: "Home",
    navProjects: "Projects",
    navAbout: "About",
    navContacts: "Contacts",
    dataTitle: "Local Test Data",
    dataDesc: "This page saves the admin password in localStorage for testing.",
    dataSave: "Save Password Locally",
    dataSaved: "Saved in localStorage.",
    adminTitle: "Admin Page",
    adminDesc: "You are authenticated via local test password.",
    logout: "Logout",
    wrongPassword: "Wrong password",
    askPassword: "Admin password",
    projectsTitle: "My Projects",
    projectsDesc: "Explore my recent work and portfolio.",
    loading: "Loading...",
    noProjects: "No projects found.",
    aboutTitle: "About Me",
    aboutDesc: "Learn more about my background and skills.",
    contactsTitle: "Contact",
    contactsDesc: "Get in touch with me.",
    contactName: "Name",
    contactEmail: "Email",
    contactMessage: "Message",
    contactSend: "Send",
    contactSuccess: "Message sent successfully!",
    contactError: "Error sending message."
  },
  fr: {
    intro: "Salut, je suis khairi,",
    title: "JE SUIS\nETUDIANT",
    lead: "Bienvenue sur mon portfolio. N'hesitez pas a explorer mes projets et a telecharger mon CV a tout moment.",
    ctaProjects: "Voir mes projets",
    ctaCv: "Telecharger CV",
    navHome: "Accueil",
    navProjects: "Projets",
    navAbout: "A propos",
    navContacts: "Contacts",
    dataTitle: "Donnees locales de test",
    dataDesc: "Cette page enregistre le mot de passe admin dans localStorage pour les tests.",
    dataSave: "Enregistrer le mot de passe",
    dataSaved: "Enregistre dans localStorage.",
    adminTitle: "Page Admin",
    adminDesc: "Vous etes authentifie via le mot de passe local.",
    logout: "Se deconnecter",
    wrongPassword: "Mot de passe incorrect",
    askPassword: "Mot de passe admin",
    projectsTitle: "Mes Projets",
    projectsDesc: "Explorez mon travail recent et mon portfolio.",
    loading: "Chargement...",
    noProjects: "Aucun projet trouve.",
    aboutTitle: "A propos de moi",
    aboutDesc: "En savoir plus sur mon parcours et mes competences.",
    contactsTitle: "Contact",
    contactsDesc: "Me contacter.",
    contactName: "Nom",
    contactEmail: "Email",
    contactMessage: "Message",
    contactSend: "Envoyer",
    contactSuccess: "Message envoye avec succes!",
    contactError: "Erreur lors de l'envoi du message."
  },
  ar: {
    intro: "مرحبا، انا خيري،",
    title: "انا\nطالب",
    lead: "مرحبا بكم في معرض اعمالي. لا تتردد في استعراض مشاريعي وتحميل سيرتي الذاتية في اي وقت.",
    ctaProjects: "عرض مشاريعي",
    ctaCv: "تحميل السيرة الذاتية",
    navHome: "الرئيسية",
    navProjects: "المشاريع",
    navAbout: "من انا",
    navContacts: "تواصل",
    dataTitle: "بيانات اختبار محلية",
    dataDesc: "هذه الصفحة تحفظ كلمة مرور الادمن في localStorage للاختبار.",
    dataSave: "حفظ كلمة المرور محليا",
    dataSaved: "تم الحفظ في localStorage.",
    adminTitle: "صفحة الادمن",
    adminDesc: "تمت المصادقة بواسطة كلمة المرور المحلية.",
    logout: "تسجيل الخروج",
    wrongPassword: "كلمة المرور غير صحيحة",
    askPassword: "كلمة مرور الادمن",
    projectsTitle: "مشاريعي",
    projectsDesc: "استكشف عملي الحديث والمحفظة.",
    loading: "جاري التحميل...",
    noProjects: "لا توجد مشاريع.",
    aboutTitle: "عن نفسي",
    aboutDesc: "تعرف على المزيد عن خلفيتي ومهاراتي.",
    contactsTitle: "تواصل",
    contactsDesc: "تواصل معي.",
    contactName: "الاسم",
    contactEmail: "البريد الالكتروني",
    contactMessage: "الرسالة",
    contactSend: "ارسال",
    contactSuccess: "تم ارسال الرسالة بنجاح!",
    contactError: "خطأ في ارسال الرسالة."
  }
};

if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
  localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_TEST_PASSWORD);
}

function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  }
}

function App() {
  const [lang, setLang] = useState(localStorage.getItem("site_lang") || "en");
  const [route, setRoute] = useState(window.location.pathname || "/");
  const [statusText, setStatusText] = useState("");

  // Supabase data states
  const [projects, setProjects] = useState([]);
  const [about, setAbout] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("");
  const [adminTab, setAdminTab] = useState("projects");

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const t = useMemo(() => translations[lang] || translations.en, [lang]);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("site_lang", lang);
  }, [lang]);

  // Fetch projects when navigating to /projects
  useEffect(() => {
    if (route === "/projects" && projects.length === 0) {
      setLoading(true);
      api.fetchProjects().then((data) => {
        setProjects(data);
        setLoading(false);
      });
    }
  }, [route, projects.length]);

  // Fetch about when navigating to /about
  useEffect(() => {
    if (route === "/about" && !about) {
      setLoading(true);
      api.fetchAbout().then((data) => {
        setAbout(data);
        setLoading(false);
      });
    }
  }, [route, about]);

  // Fetch contacts when navigating to /contacts
  useEffect(() => {
    if (route === "/contacts" && contacts.length === 0) {
      setLoading(true);
      api.fetchContacts().then((data) => {
        setContacts(data);
        setLoading(false);
      });
    }
  }, [route, contacts.length]);

  // Fetch admin data when entering /admin
  useEffect(() => {
    if (route === "/admin") {
      loadAdminData();
    }
  }, [route]);

  const loadAdminData = async () => {
    setLoading(true);

    const [projectsData, contactsData, aboutData, submissionsData] = await Promise.all([
      api.fetchProjects(),
      api.fetchContacts(),
      api.fetchAbout(),
      api.fetchContactSubmissions()
    ]);

    setProjects(projectsData);
    setContacts(contactsData);
    setAbout(aboutData);
    setContactSubmissions(submissionsData);
    setLoading(false);
  };

  const onLogoClick = (e) => {
    e.preventDefault();
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1200);

    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      clearTimeout(clickTimerRef.current);

      const entered = window.prompt(t.askPassword);
      const expected = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_TEST_PASSWORD;
      if (entered === expected) {
        localStorage.setItem(ADMIN_AUTH_KEY, "1");
        window.location.href = "/admin";
      } else if (entered !== null) {
        window.alert(t.wrongPassword);
      }
    }
  };

  const saveTestPassword = () => {
    localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_TEST_PASSWORD);
    setStatusText(t.dataSaved);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    navigate("/");
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await api.submitContactForm(contactForm.name, contactForm.email, contactForm.message);
    setLoading(false);

    if (result.success) {
      setFormStatus(t.contactSuccess);
      setContactForm({ name: "", email: "", message: "" });
    } else {
      setFormStatus(t.contactError);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    const result = await api.deleteProject(id);
    if (result.success) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm("Delete this submission?")) return;
    const result = await api.deleteContactSubmission(id);
    if (result.success) {
      setContactSubmissions(contactSubmissions.filter(s => s.id !== id));
    }
  };

  const isAdminAuthed = localStorage.getItem(ADMIN_AUTH_KEY) === "1";

  const renderContent = () => {
    return html`
      <main className="hero">
        <div className="container hero-grid">
          <section className="hero-content">
            <p className="intro">${t.intro}</p>
            <h1 className="title">${t.title.split("\n").map((line, idx, arr) => html`${line}${idx < arr.length - 1 ? html`<br />` : null}`)}</h1>
            <p className="lead">${t.lead}</p>
            <div className="cta-row">
              <button className="cta" onClick=${() => alert("Projects clicked")}>${t.ctaProjects}</button>
              <button className="cta secondary" onClick=${() => alert("CV clicked")}>${t.ctaCv}</button>
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
          <a className="logo" href="#" onClick=${(e) => e.preventDefault()}
            >khairi<span className="logo-accent">bouzakher</span></a
          >

          <div className="header-right">
            <nav className="main-nav" aria-label="Main navigation">
              <a href="#" onClick=${(e) => { e.preventDefault(); }}>${t.navHome}</a>
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

