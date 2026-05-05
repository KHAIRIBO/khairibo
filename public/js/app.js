import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, ArrowRight, Github, Linkedin, ExternalLink, Mail, Code, Terminal, Brain } from "lucide-react";

const html = htm.bind(React.createElement);

// --- Typewriter Component ---
const Typewriter = ({ texts = [], speed = 100, pause = 2000 }) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentFullText = texts[index];

    if (!isDeleting && text === currentFullText) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
    } else {
      timer = setTimeout(() => {
        setText(currentFullText.substring(0, text.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? speed / 2 : speed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, texts, speed, pause]);

  return html`<span className="inline-block border-r-2 border-accentBlue pr-1 animate-pulse">${text || "\u00A0"}</span>`;
};

// --- Main App Component ---
function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);

  // Fetch Session
  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({
            email: data.user.emails ? data.user.emails[0].value : data.user.email,
            displayName: data.user.displayName,
            photo: data.user.photos ? data.user.photos[0].value : null
          });
        }
      })
      .catch(err => console.error("Session check failed", err));

    // Fetch GitHub Repos
    fetch("https://api.github.com/users/KHAIRIBO/repos?sort=updated&per_page=6")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data.filter(r => r.name !== "khairibo" && r.name !== "-"));
        }
      })
      .catch(e => console.error("GitHub fetch failed", e));
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Handle Loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      document.getElementById('loading-screen')?.remove();
    }, 1500);
  }, []);

  // Handle Dark Mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Smooth Scroll
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  if (loading) {
    return html`
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-lightBg dark:bg-darkBg transition-colors duration-500">
        <div className="w-12 h-12 border-4 border-accentBlue/20 border-t-accentBlue rounded-full animate-spin"></div>
      </div>
    `;
  }

  return html`
    <div className="relative w-full min-h-screen font-sans selection:bg-accentBlue selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accentBlue/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accentPurple/20 rounded-full blur-[120px] animate-blob" style=${{ animationDelay: "2s" }}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <${motion.a} 
            href="#" 
            onClick=${(e) => { e.preventDefault(); scrollTo('home'); }}
            className="text-2xl font-display font-bold tracking-tighter"
            initial=${{ opacity: 0, x: -20 }}
            animate=${{ opacity: 1, x: 0 }}
          >
            KBO<span className="text-accentBlue">.</span>
          </${motion.a}>

          <div className="hidden md:flex items-center gap-8">
            ${['Home', 'Projects', 'Skills', 'About', 'Contact'].map((item, i) => html`
              <${motion.a}
                key=${item}
                href=${`#${item.toLowerCase()}`}
                onClick=${(e) => { e.preventDefault(); scrollTo(item.toLowerCase()); }}
                className=${`text-sm font-medium transition-colors hover:text-accentBlue ${activeSection === item.toLowerCase() ? 'text-accentBlue' : 'text-gray-600 dark:text-gray-300'}`}
                initial=${{ opacity: 0, y: -10 }}
                animate=${{ opacity: 1, y: 0 }}
                transition=${{ delay: i * 0.1 }}
              >
                ${item}
              </${motion.a}>
            `)}
          </div>

          <div className="flex items-center gap-4">
            ${user ? html`
              <div className="hidden md:flex items-center gap-3">
                <img src=${user.photo || 'https://via.placeholder.com/32'} onError=${(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32'; }} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10" />
                <button onClick=${handleLogout} className="text-sm font-medium hover:text-red-500 transition-colors">Logout</button>
              </div>
            ` : html`
              <button onClick=${handleGoogleLogin} className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-accentBlue transition-colors px-4 py-2 rounded-full glass-card hover:bg-gray-100 dark:hover:bg-white/5">
                <i className="fa-brands fa-google text-red-500"></i> Sign In
              </button>
            `}

            <${motion.button}
              onClick=${toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center glass-card hover:scale-110 transition-transform"
              initial=${{ opacity: 0, scale: 0 }}
              animate=${{ opacity: 1, scale: 1 }}
              aria-label="Toggle Dark Mode"
            >
              ${darkMode ? html`<${Sun} size=${18} className="text-yellow-400" />` : html`<${Moon} size=${18} className="text-gray-800" />`}
            </${motion.button}>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <${motion.div}
            initial=${{ opacity: 0, y: 30 }}
            animate=${{ opacity: 1, y: 0 }}
            transition=${{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8 text-accentPurple dark:text-accentBlue">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentBlue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accentBlue"></span>
              </span>
              Available for new opportunities
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
              Hi, I'm <br className="md:hidden" />
              <span className="text-gradient">Khairi Bouzakher</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 h-10">
              <${Typewriter} texts=${["Full Stack Developer", "AI Enthusiast", "Creative Problem Solver"]} speed=${80} pause=${2000} />
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick=${() => scrollTo('projects')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                View Projects <${ArrowRight} size=${18} />
              </button>
              <button 
                onClick=${() => scrollTo('contact')}
                className="w-full sm:w-auto px-8 py-4 rounded-full glass-card font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Contact Me
              </button>
            </div>
          </${motion.div}>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Selected Work</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">A showcase of my recent projects, blending modern web technologies with clean, intuitive design.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            ${repos.length > 0 ? repos.map((repo, idx) => html`
              <${motion.div}
                key=${repo.id}
                initial=${{ opacity: 0, y: 50 }}
                whileInView=${{ opacity: 1, y: 0 }}
                viewport=${{ once: true, margin: "-100px" }}
                transition=${{ duration: 0.6, delay: idx * 0.1 }}
                className="group glass-card rounded-3xl overflow-hidden glow-hover p-8 flex flex-col"
              >
                <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center mb-6 text-accentBlue group-hover:bg-accentBlue group-hover:text-white transition-all duration-500">
                  <${Github} size=${28} />
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  ${repo.language ? html`<span className="px-3 py-1 text-xs font-semibold rounded-full bg-accentPurple/10 text-accentPurple border border-accentPurple/20 uppercase tracking-wider">${repo.language}</span>` : null}
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">⭐ ${repo.stargazers_count}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">${repo.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 flex-grow line-clamp-3">${repo.description || "A project built by Khairi Bouzakher. Click below to explore the codebase."}</p>
                <a href=${repo.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold hover:text-accentBlue transition-colors mt-auto">
                  View Repository <${ExternalLink} size=${16} />
                </a>
              </${motion.div}>
            `) : html`<div className="col-span-full py-20 text-center text-gray-500 font-medium animate-pulse">Loading GitHub Projects...</div>`}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Tech Arsenal</h2>
            <p className="text-gray-600 dark:text-gray-400">Tools and technologies I use to build robust applications.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            ${[
              { name: "React / Next.js", icon: Code, color: "text-blue-500" },
              { name: "Node.js", icon: Terminal, color: "text-green-500" },
              { name: "Python / AI", icon: Brain, color: "text-yellow-500" },
              { name: "Tailwind CSS", icon: Code, color: "text-cyan-500" },
            ].map((skill, i) => html`
              <${motion.div}
                key=${skill.name}
                initial=${{ opacity: 0, scale: 0.8 }}
                whileInView=${{ opacity: 1, scale: 1 }}
                viewport=${{ once: true }}
                whileHover=${{ y: -10 }}
                transition=${{ duration: 0.3, delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-white dark:bg-black/50 flex items-center justify-center shadow-lg">
                  <${skill.icon} className=${skill.color} size=${24} />
                </div>
                <span className="font-semibold text-sm">${skill.name}</span>
              </${motion.div}>
            `)}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <${motion.div}
              initial=${{ opacity: 0, x: -50 }}
              whileInView=${{ opacity: 1, x: 0 }}
              viewport=${{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden glass-card p-2">
                <img src="/photo/khairibo.png" alt="Khairi Bouzakher" className="w-full h-full object-cover rounded-2xl filter grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-accentBlue to-accentPurple rounded-full blur-2xl opacity-50 -z-10"></div>
            </${motion.div}>

            <${motion.div}
              initial=${{ opacity: 0, x: 50 }}
              whileInView=${{ opacity: 1, x: 0 }}
              viewport=${{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">About Me</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                I'm a passionate Full Stack Developer and Computer Science student specializing in Web Development and AI. I love turning complex problems into simple, beautiful, and intuitive designs.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                When I'm not coding, you can find me exploring new technologies, participating in robotics competitions, or building side projects that solve real-world problems.
              </p>
              <div className="flex gap-4">
                <a href="/Khairi_Bouzakher_CV.pdf" download className="px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Download CV
                </a>
              </div>
            </${motion.div}>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-accentPurple/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <${motion.div}
            initial=${{ opacity: 0, y: 30 }}
            whileInView=${{ opacity: 1, y: 0 }}
            viewport=${{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Let's work together.</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">Feel free to reach out for collaborations or just a friendly hello.</p>
            
            <a href="mailto:khairibo32@gmail.com" className="inline-flex items-center gap-3 text-2xl md:text-4xl font-bold hover:text-accentBlue transition-colors mb-16">
              khairibo32@gmail.com <${ArrowRight} className="w-8 h-8 md:w-10 md:h-10" />
            </a>

            <div className="flex items-center justify-center gap-6">
              <a href="https://github.com/KHAIRIBO" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:-translate-y-1 transition-transform hover:text-accentBlue">
                <${Github} size=${20} />
              </a>
              <a href="https://linkedin.com/in/khairi-bouzakher/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:-translate-y-1 transition-transform hover:text-accentBlue">
                <${Linkedin} size=${20} />
              </a>
              <a href="mailto:khairibo32@gmail.com" className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:-translate-y-1 transition-transform hover:text-accentBlue">
                <${Mail} size=${20} />
              </a>
            </div>
          </${motion.div}>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-white/10 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © ${new Date().getFullYear()} Khairi Bouzakher. Built with React & Tailwind.
        </p>
      </footer>

    </div>
  `;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(html`<${App} />`);
}
