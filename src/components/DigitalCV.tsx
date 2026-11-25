"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  ChevronDown,
  Database,
  Download,
  Globe2,
  Languages,
  Monitor,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GitHubIcon } from "@/components/BrandIcons";
import InteractiveMascot from "@/components/InteractiveMascot";
import { cv } from "@/data/cv";

const navigation = [
  { href: "#cv-profile", label: "Profile" },
  { href: "#cv-education", label: "Education" },
  { href: "#cv-skills", label: "Skills" },
  { href: "#cv-projects", label: "Projects" },
  { href: "#cv-activities", label: "Activities" },
  { href: "#cv-languages", label: "Languages" },
];

const timelineItems = cv.education.map((item) => ({
  ...item,
  category: "Education",
  key: item.title,
}));

const skillFilters = ["All", ...cv.skills.map(({ category }) => category)];
const skillIcons = [Code2, Monitor, Database, Wrench];

const reveal = (reducedMotion: boolean, delay = 0) => ({
  initial: reducedMotion ? false : { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: reducedMotion ? 0 : 0.6, delay },
});

export default function DigitalCV({ embedded = false }: { embedded?: boolean }) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [expandedItem, setExpandedItem] = useState<string | null>(cv.education[0].title);
  const [activeSection, setActiveSection] = useState("cv-profile");
  const [activeSkillCategory, setActiveSkillCategory] = useState("All");
  const timelineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress: pageScrollProgress } = useScroll();
  const smoothPageProgress = useSpring(pageScrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 55%"],
  });
  const timelineProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      setRoleIndex((index) => (index + 1) % cv.focus.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  useEffect(() => {
    const sections = navigation
      .map(({ href }) => document.querySelector<HTMLElement>(href))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveSection(current.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const visibleSkills =
    activeSkillCategory === "All"
      ? cv.skills
      : cv.skills.filter(({ category }) => category === activeSkillCategory);
  const visibleProjects = embedded
    ? cv.projects.filter((project) => !("image" in project))
    : cv.projects;
  const CVMainWrapper = embedded ? motion.div : motion.main;

  return (
    <div className={`digital-cv${embedded ? " digital-cv-embedded" : ""}`}>
      {!embedded && <InteractiveMascot />}
      {!embedded && (
        <motion.div
          className="cv-scroll-progress"
          aria-hidden="true"
          style={{ scaleX: reducedMotion ? pageScrollProgress : smoothPageProgress }}
        />
      )}
      {!embedded && (
        <header className="cv-header">
          <Link href="/" className="cv-brand" aria-label="Return to portfolio home">
            <Image src="/kbo-logo.jpg" alt="" width={38} height={38} />
            <span>KBO<span className="cv-brand-dot">.</span></span>
          </Link>
          <nav className="cv-nav" aria-label="CV sections">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={activeSection === item.href.slice(1) ? "is-active" : undefined}
                aria-current={activeSection === item.href.slice(1) ? "location" : undefined}
              >
                {activeSection === item.href.slice(1) && (
                  <motion.span
                    className="cv-nav-indicator"
                    layoutId="cv-active-nav"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <span className="cv-nav-label">{item.label}</span>
              </a>
            ))}
          </nav>
          <a className="cv-header-download cv-download-link" href="/Khairi_Bouzakher_CV.pdf" download>
            <Download size={15} />
            <span>Download PDF</span>
            <span className="cv-download-shine" aria-hidden="true" />
          </a>
        </header>
      )}
      {embedded && (
        <div className="cv-embedded-nav-wrap">
          <nav className="cv-nav cv-embedded-nav" aria-label="Digital CV sections">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={activeSection === item.href.slice(1) ? "is-active" : undefined}
                aria-current={activeSection === item.href.slice(1) ? "location" : undefined}
              >
                {activeSection === item.href.slice(1) && (
                  <motion.span
                    className="cv-nav-indicator"
                    layoutId="cv-embedded-active-nav"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <span className="cv-nav-label">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}

      <CVMainWrapper
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.65 }}
      >
        <section id="cv-profile" className="cv-hero">
          <div className="cv-hero-grid" aria-hidden="true" />
          <div className="cv-hero-glow cv-hero-glow-left" aria-hidden="true" />
          <div className="cv-hero-glow cv-hero-glow-right" aria-hidden="true" />
          <div className="cv-hero-sheen" aria-hidden="true" />
          <div className="cv-hero-inner">
            <motion.div className="cv-hero-copy" {...reveal(reducedMotion)}>
              <p className="cv-kicker"><span /> DIGITAL CV · TUNISIA</p>
              <p className="cv-hero-name">{cv.name}</p>
              <h1>
                Computer science student
                <br />
                <span>building for the real world.</span>
              </h1>
              <p className="cv-role-line">
                Focused on{" "}
                {reducedMotion ? (
                  <strong>{cv.focus[0]}</strong>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.strong
                      key={cv.focus[roleIndex]}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {cv.focus[roleIndex]}
                    </motion.strong>
                  </AnimatePresence>
                )}
              </p>
              <p className="cv-hero-summary">
                {cv.summary}
              </p>
              <div className="cv-hero-actions">
                <a className="cv-button cv-button-primary" href={embedded ? "#contact" : "#cv-contact"}>
                  Contact me <ArrowUpRight size={17} />
                </a>
                <a className="cv-button cv-button-secondary" href="#cv-projects">
                  View projects <ArrowDownRight size={17} />
                </a>
                <a
                  className="cv-button cv-button-quiet cv-download-link"
                  href="/Khairi_Bouzakher_CV.pdf"
                  download
                >
                  <Download size={16} /> Download CV
                  <span className="cv-download-shine" aria-hidden="true" />
                </a>
              </div>
              <div className="cv-contact-strip">
                <span><MapPin size={14} /> {cv.location}</span>
                <a href={`tel:${cv.phone.replaceAll(" ", "")}`}><Phone size={14} /> {cv.phone}</a>
                <a href={`mailto:${cv.email}`}><Mail size={14} /> {cv.email}</a>
              </div>
            </motion.div>

            <motion.div
              className="cv-portrait-card"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.94, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.7, delay: 0.12 }}
            >
              <div className="cv-portrait-frame">
                <Image
                  src="/photo/khairibo.png"
                  alt={cv.name}
                  fill
                  sizes="(max-width: 800px) 72vw, 34vw"
                />
              </div>
              <div className="cv-portrait-caption">
                <span><Sparkles size={15} /> Learning by building</span>
                <strong>{cv.title}</strong>
              </div>
              <div className="cv-portrait-index">01 / PROFILE</div>
            </motion.div>
          </div>
          <a className="cv-scroll-cue" href="#cv-education">
            Explore my background <ArrowDown size={15} />
          </a>
        </section>

        <section className="cv-section cv-profile-section" aria-labelledby="cv-about-title">
          <motion.div className="cv-section-intro" {...reveal(reducedMotion)}>
            <span className="cv-section-index">01 — PROFILE</span>
            <h2 id="cv-about-title">Curiosity with<br /><em>a practical edge.</em></h2>
          </motion.div>
          <motion.div className="cv-profile-copy" {...reveal(reducedMotion, 0.1)}>
            <p>
              At ISIMG in Gabès, I&apos;m studying computer science with a focus on
              web development and robotics engineering. I learn by turning practical
              needs into projects, currently working with PHP, Java, and Node.js.
            </p>
            <div className="cv-profile-note">
              <BookOpen size={19} />
              <span>
                My CV highlights academic training, hands-on projects, and community
                involvement. It does not list formal employment history.
              </span>
            </div>
          </motion.div>
        </section>

        <section id="cv-education" className="cv-section cv-timeline-section" aria-labelledby="cv-timeline-title">
          <div className="cv-section-heading">
            <div>
              <span className="cv-section-index">02 — EDUCATION</span>
              <h2 id="cv-timeline-title">The path <em>so far.</em></h2>
            </div>
            <p>Academic milestones recorded in my CV. No employment history or dates are listed in the source.</p>
          </div>

          <div className="cv-timeline" ref={timelineRef}>
            <div className="cv-timeline-track" aria-hidden="true">
              <motion.div
                className="cv-timeline-progress"
                style={{ scaleY: reducedMotion ? scrollYProgress : timelineProgress }}
              />
            </div>
            {timelineItems.map((item, index) => {
              const isExpanded = expandedItem === item.key;
              return (
                <motion.article
                  key={item.key}
                  className={`cv-timeline-item${isExpanded ? " is-expanded" : ""}`}
                  {...reveal(reducedMotion, index * 0.04)}
                >
                  <span className="cv-timeline-dot" aria-hidden="true" />
                  <button
                    className="cv-timeline-card"
                    type="button"
                    onClick={() => setExpandedItem(isExpanded ? null : item.key)}
                    aria-expanded={isExpanded}
                  >
                    <span className="cv-timeline-meta">
                      <span>{item.category}</span>
                      <span>{item.period}</span>
                    </span>
                    <span className="cv-timeline-title">{item.title}</span>
                    <span className="cv-timeline-institution">{item.institution}</span>
                    <span className="cv-timeline-toggle">
                      <ChevronDown size={18} />
                    </span>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.span
                          className="cv-timeline-details"
                          initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: reducedMotion ? 0 : 0.25 }}
                        >
                          {item.detail}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section id="cv-skills" className="cv-section cv-skills-section" aria-labelledby="cv-skills-title">
          <div className="cv-section-heading">
            <div>
              <span className="cv-section-index">03 — TOOLKIT</span>
              <h2 id="cv-skills-title">Skills in <em>practice.</em></h2>
            </div>
            <p>Grouped as listed in my CV—no proficiency scores or unverified tools.</p>
          </div>
          <div className="cv-skill-filters" role="group" aria-label="Filter skills by category">
            {skillFilters.map((category) => (
              <button
                type="button"
                key={category}
                className={activeSkillCategory === category ? "is-active" : undefined}
                aria-pressed={activeSkillCategory === category}
                onClick={() => setActiveSkillCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="cv-skills-grid">
            <AnimatePresence mode="popLayout" initial={false}>
            {visibleSkills.map((group) => {
              const originalIndex = cv.skills.indexOf(group);
              const SkillIcon = skillIcons[originalIndex];
              return (
              <motion.article
                className="cv-skill-card"
                key={group.category}
                layout
                {...reveal(reducedMotion)}
                exit={reducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: reducedMotion ? 0 : 0.28 }}
                whileHover={reducedMotion ? undefined : { y: -5 }}
              >
                <div className="cv-skill-card-heading">
                  <span className="cv-skill-icon"><SkillIcon size={20} strokeWidth={1.8} /></span>
                  <span className="cv-skill-number">0{originalIndex + 1}</span>
                </div>
                <h3>{group.category}</h3>
                <div className="cv-skill-tags">
                  {group.items.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </motion.article>
              );
            })}
            </AnimatePresence>
          </div>
        </section>

        <section id="cv-projects" className="cv-section cv-projects-section" aria-labelledby="cv-projects-title">
          <div className="cv-section-heading">
            <div>
              <span className="cv-section-index">04 — SELECTED WORK</span>
              <h2 id="cv-projects-title">Learning by <em>making.</em></h2>
            </div>
            <p>
              {embedded
                ? "Personal and academic projects listed in my CV. Featured portfolio projects appear above."
                : "Projects named in my CV, alongside the linked work already featured on my portfolio."}
            </p>
          </div>
          <div className="cv-project-grid">
            {visibleProjects.map((project, index) => {
              const image = "image" in project ? project.image : undefined;
              const href = "href" in project ? project.href : undefined;
              const technologies =
                "technologies" in project ? project.technologies : undefined;
              return (
                <motion.article
                  className={`cv-project-card${image ? " cv-project-featured" : ""}`}
                  key={project.title}
                  {...reveal(reducedMotion, (index % 3) * 0.06)}
                  whileHover={reducedMotion ? undefined : { y: -6 }}
                >
                  <span className="cv-project-index" aria-hidden="true">0{index + 1}</span>
                  {image && (
                    <div className="cv-project-image">
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="(max-width: 760px) 90vw, (max-width: 1100px) 45vw, 30vw"
                      />
                      <span>{project.type}</span>
                      {href && (
                        <span className="cv-project-image-arrow" aria-hidden="true">
                          <ArrowUpRight size={17} />
                        </span>
                      )}
                    </div>
                  )}
                  <div className="cv-project-content">
                    {!image && <span className="cv-project-type">{project.type}</span>}
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    {technologies && (
                      <div className="cv-skill-tags cv-project-tags">
                        {technologies.map((technology) => <span key={technology}>{technology}</span>)}
                      </div>
                    )}
                    {href && (
                      <a href={href} target="_blank" rel="noreferrer">
                        Open project <ArrowUpRight size={15} />
                      </a>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section id="cv-activities" className="cv-section cv-activity-section" aria-labelledby="cv-activities-title">
          <div className="cv-activity-copy">
            <span className="cv-section-index">05 — BEYOND THE SCREEN</span>
            <h2 id="cv-activities-title">Built with people,<br /><em>not just code.</em></h2>
            <p>
              Robotics competitions, student elections, and participation in music,
              social, and technology clubs are all part of the experience described in my CV.
            </p>
          </div>
          <div className="cv-activity-list">
            {cv.activities.map((activity, index) => (
              <motion.div
                key={activity.title}
                className="cv-activity-row"
                {...reveal(reducedMotion, index * 0.06)}
              >
                <span className="cv-activity-icon">
                  {activity.kind === "Training" ? <BadgeCheck size={18} /> : <BriefcaseBusiness size={18} />}
                </span>
                <span><strong>{activity.title}</strong><small>{activity.detail}</small></span>
                <span className="cv-activity-kind">{activity.kind}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="cv-languages" className="cv-section cv-languages-section" aria-labelledby="cv-languages-title">
          <div className="cv-section-heading">
            <div>
              <span className="cv-section-index">06 — LANGUAGES</span>
              <h2 id="cv-languages-title">Words that <em>connect.</em></h2>
            </div>
            <Languages size={30} aria-hidden="true" />
          </div>
          <div className="cv-language-grid">
            {cv.languages.map((language, index) => (
              <motion.div
                className="cv-language-card"
                key={language.name}
                {...reveal(reducedMotion, index * 0.08)}
              >
                <Globe2 size={19} />
                <strong>{language.name}</strong>
                <span>{language.level}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="cv-contact" className="cv-contact-section" aria-labelledby="cv-contact-title">
          <div className="cv-contact-orbit" aria-hidden="true" />
          <span className="cv-section-index">LET’S BUILD SOMETHING USEFUL</span>
          <h2 id="cv-contact-title">Ready to put ideas<br /><em>into practice?</em></h2>
          <p>References are available on request. Reach out to talk about a project or opportunity.</p>
          <div className="cv-contact-actions">
            <a className="cv-button cv-button-dark" href={embedded ? "#contact" : `mailto:${cv.email}`}>
              <Mail size={17} /> Contact me
            </a>
            <a className="cv-button cv-button-outline-dark" href="/Khairi_Bouzakher_CV.pdf" download>
              <Download size={17} /> Download PDF
            </a>
            <Link className="cv-button cv-button-outline-dark" href={embedded ? "#home" : "/"}>
              <ArrowLeft size={17} /> Back to portfolio
            </Link>
          </div>
          <div className="cv-social-links">
            <a href={cv.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a>
            <a href="https://github.com/KHAIRIBO" target="_blank" rel="noreferrer">GitHub <GitHubIcon size={14} /></a>
            <a href={`tel:${cv.phone.replaceAll(" ", "")}`}>{cv.phone}</a>
          </div>
        </section>
      </CVMainWrapper>

      {!embedded && (
        <footer className="cv-footer">
          <span>© {new Date().getFullYear()} {cv.name}</span>
          <span>Information transcribed from the supplied CV.</span>
        </footer>
      )}

    </div>
  );
}
