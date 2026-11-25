export const cv = {
  name: "Khairi Bouzakher",
  title: "Computer Science Student",
  focus: ["Web Development", "Robotics Engineering"],
  location: "Tunisia",
  phone: "+216 90 589 459",
  email: "khairibo32@gmail.com",
  linkedin: "https://linkedin.com/in/khairi-bouzakher/",
  summary:
    "Computer science student at the Higher Institute of Computer Science and Multimedia of Gabès (ISIMG), specializing in web development and robotics engineering. I am developing my programming and web-application skills through practical projects in PHP, Java, and Node.js. Motivated by creating digital solutions for concrete needs, I am looking to apply my skills and grow within a team.",
  education: [
    {
      title: "Web Development and Robotics Engineering",
      institution: "Higher Institute of Computer Science and Multimedia of Gabès (ISIMG)",
      detail: "Computer Science — LISI track",
      period: "Current studies",
    },
    {
      title: "Baccalaureate",
      institution: "Tunisia",
      detail: "Academic distinction: Assez bien",
      period: "2023–2024",
    },
  ],
  skills: [
    {
      category: "Programming languages",
      items: ["HTML", "PHP", "Python", "Java", "JavaScript", "SQL"],
    },
    {
      category: "Web development",
      items: ["Front-end fundamentals", "Back-end fundamentals", "Node.js"],
    },
    {
      category: "Databases",
      items: ["MySQL", "PostgreSQL"],
    },
    {
      category: "Practical work",
      items: ["Web project design", "Practical application development"],
    },
  ],
  projects: [
    {
      title: "eDropo",
      type: "Web project",
      description: "A web project developed in PHP.",
      technologies: ["PHP"],
    },
    {
      title: "Practical PHP projects and digital tools",
      type: "Applied development",
      description:
        "Projects and tools designed to address practical needs and concrete use cases.",
      technologies: ["PHP"],
    },
    {
      title: "Personal and academic projects",
      type: "Programming projects",
      description: "Small personal and academic projects developed in Java and Node.js.",
      technologies: ["Java", "Node.js"],
    },
    {
      title: "Live Weather Intelligence",
      type: "Product / Web app",
      description:
        "A real-time weather intelligence platform built around clarity, live data, and useful decisions.",
      image: "/photo/project-weather.jpg",
      href: "https://github.com/KHAIRIBO/Live-Weather-Intelligence",
    },
    {
      title: "Dbrtna",
      type: "Culture / Digital experience",
      description:
        "A digital home for Tunisian cuisine, recipes, stories, and the culture behind every dish.",
      image: "/photo/project-food.jpg",
      href: "https://github.com/KHAIRIBO/dbrtna",
    },
    {
      title: "Budget Analysis",
      type: "Fintech / Dashboard",
      description:
        "A financial workspace that turns everyday transactions into a clear visual story.",
      image: "/photo/project-finance.jpg",
      href: "https://budget-analyse.vercel.app",
    },
  ],
  activities: [
    {
      title: "Robotics competitions",
      detail: "Participation in robotics competitions.",
      kind: "Technology",
    },
    {
      title: "Music, social, and technology clubs",
      detail: "Participation in the activities of music, social, and technology clubs.",
      kind: "Community",
    },
    {
      title: "Student elections",
      detail: "Participation in UGET student elections.",
      kind: "Student engagement",
    },
    {
      title: "Certificates",
      detail: "Certificates in robotics and computer science.",
      kind: "Training",
    },
  ],
  languages: [
    { name: "Arabic", level: "Native language" },
    { name: "French", level: "Basic knowledge" },
    { name: "English", level: "Good level" },
  ],
  references: "References available on request.",
} as const;
