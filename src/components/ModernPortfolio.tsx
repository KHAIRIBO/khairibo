"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Code2,
  Database,
  Layers3,
  Mail,
  Menu,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";
import { supabase } from "@/lib/supabase";
import AdminLoginModal from "@/components/AdminLoginModal";
import InteractiveMascot from "@/components/InteractiveMascot";
import DigitalCV from "@/components/DigitalCV";

const smoothEase = [0.16, 1, 0.3, 1] as const;

const smoothFadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      delay: i * 0.1,
      ease: smoothEase,
    },
  }),
};

const springHover = {
  scale: 1.025,
  y: -3,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

const springTap = {
  scale: 0.97,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

const projects = [
  {
    number: "01",
    title: "Live Weather Intelligence",
    type: "Product / Web app",
    description: "A real-time weather intelligence platform built around clarity, live data, and useful decisions.",
    image: "/photo/project-weather.jpg",
    href: "https://github.com/KHAIRIBO/Live-Weather-Intelligence",
    accent: "from-cyan-400/80 to-blue-900/80",
  },
  {
    number: "02",
    title: "Dbrtna",
    type: "Culture / Digital experience",
    description: "A warm digital home for Tunisian cuisine, recipes, stories, and the culture behind every dish.",
    image: "/photo/project-food.jpg",
    href: "https://github.com/KHAIRIBO/dbrtna",
    accent: "from-orange-400/80 to-red-950/80",
  },
  {
    number: "03",
    title: "Budget Analysis",
    type: "Fintech / Dashboard",
    description: "A focused financial workspace that turns everyday transactions into a clear visual story.",
    image: "/photo/project-finance.jpg",
    href: "https://budget-analyse.vercel.app",
    accent: "from-emerald-400/80 to-teal-950/80",
  },
];

const capabilities = [
  { icon: Code2, title: "Website Development", text: "Building fast, responsive, and SEO-friendly websites using modern frameworks like Next.js and React. Focusing on performance and accessibility." },
  { icon: Layers3, title: "UI/UX Design", text: "Crafting beautiful, intuitive interfaces with clean aesthetics. Implementing modern design systems and smooth micro-interactions." },
  { icon: BrainCircuit, title: "AI Integration", text: "Empowering applications with artificial intelligence. Integrating LLMs, custom prompt pipelines, and automated AI workflows." },
  { icon: Database, title: "API Development", text: "Designing robust, scalable backend architectures. Developing RESTful APIs and seamless third-party integrations." },
];

interface TechArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source?: { name?: string };
}

export default function ModernPortfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [articles, setArticles] = useState<TechArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const siteRef = useRef<HTMLDivElement>(null);

  const handleSecretTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clickCountRef.current += 1;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setIsAdminModalOpen(true);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 3000);
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const heroMotion = {
    hidden: { opacity: 0, y: 24 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        delay: custom * 0.12,
        ease: smoothEase,
      },
    }),
  };

  // Sticky header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleSection) {
          setActiveSection(
            visibleSection.target.closest(".digital-cv-embedded")
              ? "cv"
              : visibleSection.target.id,
          );
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Cursor glow tracking
  useEffect(() => {
    const site = siteRef.current;
    if (!site) return;
    const onMove = (e: MouseEvent) => {
      const rect = site.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top + window.scrollY) / site.scrollHeight) * 100;
      site.style.setProperty("--mx", `${x}%`);
      site.style.setProperty("--my", `${y}%`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactStatus("sending");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const content = String(formData.get("message") || "");

    if (!supabase) {
      setContactStatus("error");
      return;
    }

    const { error } = await supabase.from("messages").insert([{ name, email, content }]);
    setContactStatus(error ? "error" : "sent");
    if (!error) event.currentTarget.reset();
  };

  const fetchNews = useCallback(async () => {
    setIsLoadingNews(true);
    try {
      const response = await fetch("/api/news");
      const data = await response.json();
      setArticles(Array.isArray(data.articles) ? data.articles.slice(0, 3) : []);
    } catch (error) {
      console.error("Failed to load technology news:", error);
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  useEffect(() => {
    const requestId = window.setTimeout(() => {
      void fetchNews();
    }, 0);

    return () => window.clearTimeout(requestId);
  }, [fetchNews]);

  return (
    <div className="modern-site" ref={siteRef}>
      <InteractiveMascot />
      <motion.div className="modern-scroll-bar" style={{ scaleX }} />
      <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
      <header className={`modern-header${scrolled ? " scrolled" : ""}`}>
        <div className="modern-logo flex items-center">
          <a href="#home" className="flex items-center" aria-label="KBO home">
            <span className="modern-logo-mark" aria-hidden="true">
              <Image
                src="/kbo-logo.jpg"
                alt=""
                width={42}
                height={42}
                className="modern-logo-image"
                priority
              />
              <span className="modern-logo-wave modern-logo-wave-one" />
              <span className="modern-logo-wave modern-logo-wave-two" />
              <span className="modern-logo-wave modern-logo-wave-three" />
            </span>
          </a>
          <button
            type="button"
            onClick={handleSecretTriggerClick}
            className="modern-dot cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit select-none inline-block focus:outline-none"
            aria-label="Admin Trigger"
            tabIndex={-1}
          >
            .
          </button>
        </div>
        <nav
          id="primary-navigation"
          className={menuOpen ? "modern-nav modern-nav-open" : "modern-nav"}
          aria-label="Primary navigation"
        >
          {[
            { id: "home", label: "Home" },
            { id: "about", label: "About" },
            { id: "services", label: "Skills" },
            { id: "work", label: "Work" },
            { id: "cv", label: "CV" },
            { id: "contact", label: "Contact" },
          ].map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
              className={activeSection === item.id ? "is-active" : undefined}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
          <motion.a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="modern-nav-cta"
            whileHover={springHover}
            whileTap={springTap}
          >
            Start a project <ArrowUpRight size={15} />
          </motion.a>
        </nav>
        <button
          className="modern-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        {menuOpen && (
          <div className="modern-nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
        )}
      </header>

      <main>
        <section id="home" className="modern-hero" aria-labelledby="hero-title">
          <div className="modern-hero-grid" />
          <div className="modern-hero-glow-a" />
          <div className="modern-hero-glow-b" />
          <div className="modern-hero-copy">
            <motion.p
              variants={heroMotion}
              initial="hidden"
              animate="visible"
              custom={0}
              className="modern-eyebrow"
            >
              <span className="modern-status" /> Available for select projects · Tunisia
            </motion.p>
            <motion.p
              variants={heroMotion}
              initial="hidden"
              animate="visible"
              custom={1}
              className="modern-hero-identity"
            >
              Khairi Bouzakher <span>/</span> Full Stack Developer 
            </motion.p>
            <motion.h1
              id="hero-title"
              variants={heroMotion}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Oops, I <em>built this.</em>
            </motion.h1>
            <motion.p
              variants={heroMotion}
              initial="hidden"
              animate="visible"
              custom={3}
              className="modern-hero-description"
            >
              I build clean, modern, and highly performant digital experiences. Passionate about bridging the gap between beautiful design and robust engineering.
            </motion.p>
            <motion.div
              variants={heroMotion}
              initial="hidden"
              animate="visible"
              custom={4}
              className="modern-hero-actions"
            >
              <motion.a
                whileHover={springHover}
                whileTap={springTap}
                href="#work"
                className="modern-button modern-button-lime"
              >
                View my work <ArrowDownRight size={17} />
              </motion.a>
              <motion.a
                whileHover={{ x: 4 }}
                href="#contact"
                className="modern-text-link"
              >
                Contact me <ArrowUpRight size={16} />
              </motion.a>
            </motion.div>
          </div>
          <motion.div
            className="modern-hero-visual"
            initial={{ opacity: 0, scale: 0.92, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="modern-orbit modern-orbit-one" />
            <div className="modern-orbit modern-orbit-two" />
            <motion.div
              className="modern-portrait"
              animate={{ y: [-8, 8, -8], rotate: [7, 8.5, 7] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image src="/photo/khairibo.png" alt="Khairi Bouzakher" fill priority sizes="(max-width: 900px) 80vw, 40vw" />
            </motion.div>
            <motion.div
              className="modern-float-card"
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <Sparkles size={16} />
              <span>Building what&apos;s next</span>
            </motion.div>
            <motion.div
              className="modern-float-card-top"
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <Code2 size={14} />
              <span>Open to work</span>
            </motion.div>
          </motion.div>
          <div className="modern-scroll-cue"><span>Scroll to explore</span><ArrowDownRight size={18} /></div>
        </section>

        <section id="about" className="modern-about-section" aria-labelledby="about-title">
          <div className="modern-about-inner">
            {/* Left — full-bleed image stack */}
            <motion.div
              className="modern-about-visuals"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="modern-about-img-main">
                <Image
                  src="/photo/workspace.jpg"
                  alt="Khairi Bouzakher workspace"
                  fill
                  sizes="(max-width: 900px) 90vw, 42vw"
                  className="about-img-cover"
                />
                <div className="modern-about-img-overlay" />
              </div>
              <div className="modern-about-img-accent">
                <Image
                  src="/photo/design-detail.jpg"
                  alt="Design details and architecture"
                  fill
                  sizes="(max-width: 900px) 45vw, 18vw"
                  className="about-img-cover"
                />
              </div>
              {/* Year badge */}
              <div className="modern-about-year">
                <span>Since</span>
                <strong>2022</strong>
              </div>
            </motion.div>

            {/* Right — copy */}
            <motion.div
              className="modern-about-text"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="modern-section-pill">
                <span className="modern-pill-dot" /> About Me
              </div>
              <h2 id="about-title" className="modern-about-headline">
                Driven by curiosity,{" "}
                <em>built for performance.</em>
              </h2>
              <p className="modern-about-body">
                I&apos;m Khairi Bouzakher — a Full Stack Developer and Computer Science student
                who specialises in building highly interactive, accessible, and performant
                web applications.<br /><br />
                My passion lies in blending clean, modern design with robust engineering.
                Whether crafting a pixel-perfect frontend or architecting a scalable backend,
                I approach every challenge with creative rigour.
              </p>

              <div className="modern-about-stats">
                <div className="modern-about-stat">
                  <strong>3+</strong><span>Years building</span>
                </div>
                <div className="modern-about-stat">
                  <strong>20+</strong><span>Projects shipped</span>
                </div>
                <div className="modern-about-stat">
                  <strong>∞</strong><span>Things to learn</span>
                </div>
              </div>

              <div className="modern-about-actions">
                <motion.a
                  whileHover={springHover}
                  whileTap={springTap}
                  href="#cv"
                  className="modern-button modern-button-lime"
                >
                  View CV <ArrowUpRight size={16} />
                </motion.a>
                <motion.a
                  whileHover={{ x: 4 }}
                  href="#contact"
                  className="modern-text-link"
                >
                  Get in touch <ArrowDownRight size={16} />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="work" className="modern-section modern-work" aria-labelledby="work-title">
          <div className="modern-section-heading">
            <div>
              <div className="modern-section-pill modern-section-pill-dark">
                <span className="modern-pill-dot" /> Selected Work
              </div>
              <h2 id="work-title">A few things I&apos;ve <span>made.</span></h2>
            </div>
            <a href="https://github.com/KHAIRIBO?tab=repositories" target="_blank" rel="noreferrer" className="modern-text-link">View GitHub <ArrowUpRight size={16} /></a>
          </div>
          <div className="modern-project-list">
            {projects.map((project, index) => (
              <motion.a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                key={project.title}
                className="modern-project"
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: smoothEase,
                }}
                whileHover={{ y: -8 }}
              >
                <div className="modern-project-image">
                  <Image src={project.image} alt={`${project.title} project preview`} fill sizes="(max-width: 800px) 100vw, 50vw" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.accent} mix-blend-multiply opacity-60 transition-opacity duration-500 group-hover:opacity-30`} />
                  <span className="modern-project-arrow"><ArrowUpRight size={23} /></span>
                </div>
                <div className="modern-project-meta">
                  <span>{project.number}</span><span>{project.type}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </motion.a>
            ))}
          </div>
        </section>

        <section id="cv" className="modern-cv-section" aria-label="Digital CV">
          <DigitalCV embedded />
        </section>

        <section className="modern-news" aria-labelledby="news-title">
          <div className="modern-news-heading">
            <div>
              <div className="modern-section-pill modern-section-pill-dark">
                <span className="modern-pill-dot" /> Live Tech Pulse
              </div>
              <h2 id="news-title">Latest in <span>Technology &amp; AI.</span></h2>
            </div>
            <button type="button" onClick={() => void fetchNews()} className="modern-news-refresh" disabled={isLoadingNews}>
              <RefreshCw size={15} className={isLoadingNews ? "modern-spin" : ""} /> Refresh feed
            </button>
          </div>
          <div className="modern-news-grid">
            {isLoadingNews && articles.length === 0 ? (
              [0, 1, 2].map((item) => <div key={item} className="modern-news-skeleton" />)
            ) : articles.map((article) => (
              <a key={`${article.url}-${article.title}`} href={article.url} target="_blank" rel="noreferrer" className="modern-news-card">
                {article.urlToImage && <img src={article.urlToImage} alt="" />}
                <div className="modern-news-card-content">
                  <span>{article.source?.name || "Tech News"} · {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <ArrowUpRight size={17} />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="services" className="modern-section modern-services" aria-labelledby="services-title">
          <div className="modern-section-pill">
            <span className="modern-pill-dot" /> Capabilities
          </div>
          <div className="modern-services-heading"><h2 id="services-title">From first sketch<br />to <span>final polish.</span></h2><p>One partner for the strategy, design, and code that turns a good idea into something people want to use.</p></div>
          <div className="modern-capability-grid">
            {capabilities.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                className="modern-capability"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.08,
                  ease: smoothEase,
                }}
                whileHover={{ y: -6, scale: 1.01 }}
              >
                <span>0{index + 1}</span><Icon size={25} /><h3>{title}</h3><p>{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contact" className="modern-contact" aria-labelledby="contact-title">
          <div className="modern-contact-orb" />
          <div className="modern-section-pill modern-section-pill-dark">
            <span className="modern-pill-dot" /> Get In Touch
          </div>
          <h2 id="contact-title">Have an idea?<br /><em>Let&apos;s make it real.</em></h2>
          <a href="mailto:khairibo32@gmail.com" className="modern-contact-email">khairibo32@gmail.com <ArrowUpRight size={24} /></a>
          <form className="modern-contact-form" onSubmit={handleContactSubmit}>
            <input name="name" required placeholder="Your name" aria-label="Your name" />
            <input name="email" required type="email" placeholder="Your email" aria-label="Your email" />
            <textarea name="message" required placeholder="Tell me about your idea" aria-label="Your message" rows={3} />
            <motion.button
              type="submit"
              disabled={contactStatus === "sending"}
              whileHover={contactStatus !== "sending" ? springHover : undefined}
              whileTap={contactStatus !== "sending" ? springTap : undefined}
            >
              {contactStatus === "sending" ? "Sending..." : contactStatus === "sent" ? "Message sent ✓" : "Send message"}
              <ArrowUpRight size={18} />
            </motion.button>
            {contactStatus === "error" && (
              <p className="modern-form-status" role="alert">
                Something went wrong. Please email me directly.
              </p>
            )}
          </form>
          <div className="modern-socials">
            <a href="https://github.com/KHAIRIBO" target="_blank" rel="noreferrer"><GitHubIcon size={18} /> GitHub</a>
            <a href="https://www.linkedin.com/in/khairi-bouzakher/" target="_blank" rel="noreferrer"><LinkedInIcon size={18} /> LinkedIn</a>
            <a href="mailto:khairibo32@gmail.com"><Mail size={18} /> Email</a>
          </div>
        </section>
      </main>
      <footer className="modern-footer"><span>© {new Date().getFullYear()} Khairi Bouzakher</span><span>Designed & built with curiosity.</span></footer>
    </div>
  );
}
