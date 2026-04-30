import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

// Dynamic import of Supabase utilities
async function loadSupabaseUtils() {
  const utils = await import("/js/supabase.js");
  return utils;
}

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
  const supabaseRef = useRef(null);

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

  // Load Supabase utilities
  useEffect(() => {
    loadSupabaseUtils().then((utils) => {
      supabaseRef.current = utils;
    });
  }, []);

  // Fetch projects when navigating to /projects
  useEffect(() => {
    if (route === "/projects" && supabaseRef.current && projects.length === 0) {
      setLoading(true);
      supabaseRef.current.fetchProjects().then((data) => {
        setProjects(data);
        setLoading(false);
      });
    }
  }, [route, projects.length]);

  // Fetch about when navigating to /about
  useEffect(() => {
    if (route === "/about" && supabaseRef.current && !about) {
      setLoading(true);
      supabaseRef.current.fetchAbout().then((data) => {
        setAbout(data);
        setLoading(false);
      });
    }
  }, [route, about]);

  // Fetch contacts when navigating to /contacts
  useEffect(() => {
    if (route === "/contacts" && supabaseRef.current && contacts.length === 0) {
      setLoading(true);
      supabaseRef.current.fetchContacts().then((data) => {
        setContacts(data);
        setLoading(false);
      });
    }
  }, [route, contacts.length]);

  // Fetch admin data when entering /admin
  useEffect(() => {
    if (route === "/admin" && supabaseRef.current) {
      loadAdminData();
    }
  }, [route]);

  const loadAdminData = async () => {
    if (!supabaseRef.current) return;
    setLoading(true);
    
    const [projectsData, contactsData, aboutData, submissionsData] = await Promise.all([
      supabaseRef.current.fetchProjects(),
      supabaseRef.current.fetchContacts(),
      supabaseRef.current.fetchAbout(),
      supabaseRef.current.fetchContactSubmissions()
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
    if (!supabaseRef.current) return;
    
    setLoading(true);
    const result = await supabaseRef.current.submitContactForm(contactForm.name, contactForm.email, contactForm.message);
    setLoading(false);
    
    if (result.success) {
      setFormStatus(t.contactSuccess);
      setContactForm({ name: "", email: "", message: "" });
    } else {
      setFormStatus(t.contactError);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!supabaseRef.current || !window.confirm("Delete this project?")) return;
    const result = await supabaseRef.current.deleteProject(id);
    if (result.success) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleDeleteSubmission = async (id) => {
    if (!supabaseRef.current || !window.confirm("Delete this submission?")) return;
    const result = await supabaseRef.current.deleteContactSubmission(id);
    if (result.success) {
      setContactSubmissions(contactSubmissions.filter(s => s.id !== id));
    }
  };

  const isAdminAuthed = localStorage.getItem(ADMIN_AUTH_KEY) === "1";

  const renderContent = () => {
    if (route === "/projects") {
      return html`
        <main className="hero">
          <div className="container">
            <section className="page-card">
              <h1>${t.projectsTitle}</h1>
              <p>${t.projectsDesc}</p>
              ${loading ? html`<p>${t.loading}</p>` : projects.length > 0 ? html`
                <div className="projects-grid">
                  ${projects.map((project) => html`
                    <div className="project-item">
                      <h3>${project.title}</h3>
                      <p>${project.description}</p>
                      ${project.link ? html`<a href=${project.link} target="_blank" rel="noopener noreferrer" className="cta secondary">View</a>` : null}
                    </div>
                  `)}
                </div>
              ` : html`<p>${t.noProjects}</p>`}
              <div className="cta-row">
                <button className="cta secondary" onClick=${() => navigate("/")}>${t.navHome}</button>
              </div>
            </section>
          </div>
        </main>
      `;
    }

    if (route === "/about") {
      return html`
        <main className="hero">
          <div className="container">
            <section className="page-card">
              <h1>${t.aboutTitle}</h1>
              <p>${t.aboutDesc}</p>
              ${loading ? html`<p>${t.loading}</p>` : about ? html`
                <div>
                  <p>${about.bio}</p>
                  ${about.skills ? html`<p><strong>Skills:</strong> ${about.skills}</p>` : null}
                </div>
              ` : html`<p>No about information available.</p>`}
              <div className="cta-row">
                <button className="cta secondary" onClick=${() => navigate("/")}>${t.navHome}</button>
              </div>
            </section>
          </div>
        </main>
      `;
    }

    if (route === "/contacts") {
      return html`
        <main className="hero">
          <div className="container">
            <section className="page-card">
              <h1>${t.contactsTitle}</h1>
              <p>${t.contactsDesc}</p>
              <form onSubmit=${handleContactSubmit} className="contact-form">
                <input
                  type="text"
                  placeholder=${t.contactName}
                  value=${contactForm.name}
                  onChange=${(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder=${t.contactEmail}
                  value=${contactForm.email}
                  onChange=${(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
                <textarea
                  placeholder=${t.contactMessage}
                  value=${contactForm.message}
                  onChange=${(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows="5"
                  required
                ></textarea>
                <button type="submit" className="cta" disabled=${loading}>${t.contactSend}</button>
              </form>
              ${formStatus ? html`<p className="status-text">${formStatus}</p>` : null}
              <div className="cta-row">
                <button className="cta secondary" onClick=${() => navigate("/")}>${t.navHome}</button>
              </div>
            </section>
          </div>
        </main>
      `;
    }

    if (route === "/data") {
      return html`
        <main className="hero">
          <div className="container">
            <section className="page-card">
              <h1>${t.dataTitle}</h1>
              <p>${t.dataDesc}</p>
              <p>Password key: <strong>${ADMIN_PASSWORD_KEY}</strong></p>
              <p>Current test password: <strong>${DEFAULT_TEST_PASSWORD}</strong></p>
              <div className="cta-row">
                <button className="cta" onClick=${saveTestPassword}>${t.dataSave}</button>
                <button className="cta secondary" onClick=${() => navigate("/")}>${t.navHome}</button>
              </div>
              ${statusText ? html`<p className="status-text">${statusText}</p>` : null}
            </section>
          </div>
        </main>
      `;
    }

    if (route === "/admin") {
      if (!isAdminAuthed) {
        navigate("/");
        return null;
      }

      return html`
        <main className="hero">
          <div className="container">
            <section className="admin-dashboard">
              <h1>${t.adminTitle}</h1>
              <p>${t.adminDesc}</p>
              
              <div className="admin-tabs">
                <button className=${`admin-tab ${adminTab === "projects" ? "active" : ""}`} onClick=${() => setAdminTab("projects")}>Projects</button>
                <button className=${`admin-tab ${adminTab === "about" ? "active" : ""}`} onClick=${() => setAdminTab("about")}>About</button>
                <button className=${`admin-tab ${adminTab === "contacts" ? "active" : ""}`} onClick=${() => setAdminTab("contacts")}>Contacts</button>
                <button className=${`admin-tab ${adminTab === "submissions" ? "active" : ""}`} onClick=${() => setAdminTab("submissions")}>Submissions</button>
              </div>

              <div className="admin-content">
                ${adminTab === "projects" ? html`
                  <div>
                    <h2>Projects (${projects.length})</h2>
                    ${loading ? html`<p>${t.loading}</p>` : projects.length > 0 ? html`
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Link</th>
                            <th>Created</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${projects.map(p => html`
                            <tr>
                              <td>${p.title}</td>
                              <td>${p.category || "—"}</td>
                              <td>${p.link ? html`<a href=${p.link} target="_blank">View</a>` : "—"}</td>
                              <td>${new Date(p.created_at).toLocaleDateString()}</td>
                              <td><button className="btn-delete" onClick=${() => handleDeleteProject(p.id)}>Delete</button></td>
                            </tr>
                          `)}
                        </tbody>
                      </table>
                    ` : html`<p>No projects</p>`}
                  </div>
                ` : ""}

                ${adminTab === "about" ? html`
                  <div>
                    <h2>About</h2>
                    ${loading ? html`<p>${t.loading}</p>` : about ? html`
                      <div className="info-box">
                        <p><strong>Bio:</strong> ${about.bio}</p>
                        <p><strong>Skills:</strong> ${about.skills}</p>
                        <p><strong>Experience:</strong> ${about.experience}</p>
                        <p><strong>Education:</strong> ${about.education}</p>
                      </div>
                    ` : html`<p>No about info</p>`}
                  </div>
                ` : ""}

                ${adminTab === "contacts" ? html`
                  <div>
                    <h2>Contact Links (${contacts.length})</h2>
                    ${loading ? html`<p>${t.loading}</p>` : contacts.length > 0 ? html`
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Platform</th>
                            <th>URL</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${contacts.map(c => html`
                            <tr>
                              <td>${c.name}</td>
                              <td>${c.platform}</td>
                              <td>${c.url ? html`<a href=${c.url} target="_blank">Link</a>` : "—"}</td>
                              <td>${new Date(c.created_at).toLocaleDateString()}</td>
                            </tr>
                          `)}
                        </tbody>
                      </table>
                    ` : html`<p>No contacts</p>`}
                  </div>
                ` : ""}

                ${adminTab === "submissions" ? html`
                  <div>
                    <h2>Contact Form Submissions (${contactSubmissions.length})</h2>
                    ${loading ? html`<p>${t.loading}</p>` : contactSubmissions.length > 0 ? html`
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${contactSubmissions.map(s => html`
                            <tr>
                              <td>${s.name}</td>
                              <td>${s.email}</td>
                              <td>${s.message.substring(0, 50)}...</td>
                              <td>${new Date(s.created_at).toLocaleDateString()}</td>
                              <td><button className="btn-delete" onClick=${() => handleDeleteSubmission(s.id)}>Delete</button></td>
                            </tr>
                          `)}
                        </tbody>
                      </table>
                    ` : html`<p>No submissions</p>`}
                  </div>
                ` : ""}
              </div>

              <div className="cta-row admin-actions">
                <button className="cta" onClick=${logout}>${t.logout}</button>
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
            <p className="intro">${t.intro}</p>
            <h1 className="title">${t.title.split("\n").map((line, idx, arr) => html`${line}${idx < arr.length - 1 ? html`<br />` : null}`)}</h1>
            <p className="lead">${t.lead}</p>
            <div className="cta-row">
              <button className="cta" onClick=${() => navigate("/projects")}>${t.ctaProjects}</button>
              <button className="cta secondary" onClick=${() => navigate("/data")}>${t.ctaCv}</button>
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
          <a className="logo" href="#" onClick=${onLogoClick}
            >khairi<span className="logo-accent">bouzakher</span></a
          >

          <div className="header-right">
            <nav className="main-nav" aria-label="Main navigation">
              <a href="#" onClick=${(e) => { e.preventDefault(); navigate("/"); }}>${t.navHome}</a>
              <a href="#" onClick=${(e) => { e.preventDefault(); navigate("/projects"); }}>${t.navProjects}</a>
              <a href="#" onClick=${(e) => { e.preventDefault(); navigate("/about"); }}>${t.navAbout}</a>
              <a href="#" onClick=${(e) => { e.preventDefault(); navigate("/contacts"); }}>${t.navContacts}</a>
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
