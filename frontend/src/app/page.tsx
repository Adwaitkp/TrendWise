"use client";
import { fetchArticles } from '../api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CrawlerTriggerButton from '../components/CrawlerTriggerButton';
import Image from 'next/image';
import TwitterTrendsButton from '../components/TwitterTrendsButton';

interface Article {
  _id: string;
  media?: string[];
  title: string;
  slug: string;
  meta?: string;
  content?: string;
  user?: { name?: string; email?: string };
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(() => setError('Failed to load articles'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter((article: Article) =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    (article.meta && article.meta.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 md:pl-0">
        <div className="flex items-center gap-3 mb-6">
          <Image src="/globe.svg" alt="Globe" width={36} height={36} />
          <h1 className="text-3xl font-bold">Trending Articles</h1>
        </div>
        <div className="flex gap-4 mb-6">
          <CrawlerTriggerButton />
          <TwitterTrendsButton />
        </div>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z"/></svg>
          </span>
        </div>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div>No articles found.</div>
        ) : (
          <ul className="space-y-6">
            {filtered.map((article: Article) => (
              <li key={article._id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow flex flex-col gap-2">
                {article.media && article.media[0] && (
                  <Image src={`${API_BASE_URL}${article.media[0]}`} alt={article.title} width={800} height={160} className="w-full h-40 object-cover rounded mb-2" unoptimized />
                )}
                <h2 className="text-xl font-semibold mb-1">
                  <Link href={`/article/${article.slug}`} className="hover:underline text-blue-700">{article.title}</Link>
                </h2>
                <p className="text-gray-600 mb-2">{article.meta || article.content?.slice(0, 120) + '...'}</p>
                {article.user && (article.user.name || article.user.email) && (
                  <div className="text-sm text-gray-500">By: {article.user.name || article.user.email}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
      {/* Footer */}
      <footer className="w-full bg-white shadow-inner mt-10">
        <div className="max-w-2xl mx-auto p-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} TrendWise. All rights reserved.
        </div>
      </footer>
    </div>
  );
}