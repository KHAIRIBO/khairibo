import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.NEWS_API_KEY;
  const url = `https://newsapi.org/v2/everything?q=technology+AI+software&language=en&sortBy=publishedAt&pageSize=6&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
