const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchArticles() {
  const res = await fetch(`${API_BASE_URL}/api/articles`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
} 