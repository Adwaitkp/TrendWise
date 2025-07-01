import { Metadata } from 'next';
import ClientCommentSection from './ClientCommentSection';
import Link from 'next/link';
import Image from 'next/image';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

export async function generateMetadata(props: { params: { slug: string } }): Promise<Metadata> {
  const { params } = props;
  try {
    const res = await fetch(`${API_BASE_URL}/api/articles/${params.slug}`);
    if (!res.ok) return {};
    const article = await res.json();
    return {
      title: article.title,
      description: article.meta || article.content?.slice(0, 160),
      openGraph: {
        title: article.title,
        description: article.meta || article.content?.slice(0, 160),
        images: article.media && article.media[0] ? [article.media[0]] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.meta || article.content?.slice(0, 160),
        images: article.media && article.media[0] ? [article.media[0]] : [],
      },
    };
  } catch {
    return {};
  }
}

async function getArticle(slug: string) {
  const res = await fetch(`${API_BASE_URL}/api/articles/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) return <div className="p-8 text-red-500">Article not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:underline">
          {/* Optionally use an icon if you have Heroicons or similar */}
          {/* <ArrowLeftIcon className="h-5 w-5 mr-1" /> */}
          ← Back
        </Link>
        {article.user && (
          <div className="text-right text-gray-500 text-sm">
            By: {article.user.name || article.user.email}
          </div>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.media && article.media[0] && (
        <Image src={`${API_BASE_URL}${article.media[0]}`} alt={article.title} width={800} height={240} className="w-full h-60 object-cover rounded mb-4" unoptimized />
      )}
      <div className="text-gray-700 mb-4">{article.meta}</div>
      <article className="prose prose-lg" dangerouslySetInnerHTML={{ __html: article.content }} />
      <ClientCommentSection articleId={article._id} />
    </div>
  );
} 