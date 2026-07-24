import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.NEWS_API_KEY;

  // 1. Try NewsAPI if API Key is set
  if (API_KEY) {
    try {
      const url = `https://newsapi.org/v2/everything?q=technology+AI+software&language=en&sortBy=publishedAt&pageSize=6&apiKey=${API_KEY}`;
      const response = await fetch(url, { next: { revalidate: 1800 } });
      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("NewsAPI fetch failed, falling back to Dev.to Tech API");
    }
  }

  // 2. Fetch from Dev.to Live Tech API (No API key required)
  try {
    const devRes = await fetch("https://dev.to/api/articles?tag=technology&per_page=6", {
      next: { revalidate: 1800 }
    });
    if (devRes.ok) {
      const devArticles = await devRes.json();
      const formattedArticles = devArticles.map((art: any) => ({
        title: art.title,
        description: art.description || "Discover the latest tech trends, software architecture insights, and AI innovations.",
        url: art.url,
        urlToImage: art.cover_image || art.social_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
        publishedAt: art.published_at,
        source: { name: art.user?.name || "Tech Community" },
      }));

      return NextResponse.json({ articles: formattedArticles });
    }
  } catch (err) {
    console.warn("Dev.to API fetch failed, serving curated fallback tech news");
  }

  // 3. High quality fallback tech news
  const fallbackArticles = [
    {
      title: "Next.js 15 and Turbopack Redefine Modern Full-Stack Performance",
      description: "Explore how Next.js 15 introduces server actions, asynchronous request handling, and blazing fast Turbopack compilation.",
      url: "https://nextjs.org/blog",
      urlToImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "Vercel Engineering" },
    },
    {
      title: "The Rise of Autonomous AI Coding Agents & LLM Architectures",
      description: "How agentic AI models with tool calling, context engineering, and real-time execution are revolutionizing software development.",
      url: "https://openai.com/news",
      urlToImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "AI Frontier" },
    },
    {
      title: "Supabase & Postgres: Modern Database Scaling & Real-time Subscriptions",
      description: "Building production-ready real-time backends with Supabase, Row Level Security (RLS), and automated vector search integrations.",
      url: "https://supabase.com/blog",
      urlToImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "Supabase Tech" },
    },
    {
      title: "Tailwind CSS v4 Engine: Zero-Config Performance & Modern CSS Variables",
      description: "Discover the new oxide engine, native CSS variables integration, and lightning fast build speeds for responsive web design.",
      url: "https://tailwindcss.com/blog",
      urlToImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "Web Design Daily" },
    },
    {
      title: "Framer Motion & Modern Micro-Animations in Web Applications",
      description: "How fluid animations, layout transitions, and interactive visual polish elevate user retention and aesthetic excellence.",
      url: "https://framer.com/motion",
      urlToImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "UI/UX Digest" },
    },
    {
      title: "Cloud Infrastructure & Edge Computing Solutions in 2026",
      description: "Distributing web applications to global edge locations for ultra-low latency and instant server-side rendering.",
      url: "https://github.com/readme",
      urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      publishedAt: new Date().toISOString(),
      source: { name: "Cloud Architecture" },
    },
  ];

  return NextResponse.json({ articles: fallbackArticles });
}
