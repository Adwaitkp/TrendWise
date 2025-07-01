"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// IMPORTANT: NEXT_PUBLIC_API_BASE_URL should NOT include '/api' at the end
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CreateArticlePage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [meta, setMeta] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("meta", meta);
      formData.append("content", content);
      if (image) formData.append("image", image);
      if (session?.user) {
        formData.append("userName", session.user.name || "");
        formData.append("userEmail", session.user.email || "");
        formData.append("userImage", session.user.image || "");
      }
      const res = await fetch(`${API_BASE_URL}/api/articles`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let errorMsg = "Failed to create article";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } else {
            errorMsg = await res.text();
          }
        } catch {
          // Ignore parsing errors
        }
        throw new Error(errorMsg);
      }
      setSuccess("Article created successfully!");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Create New Article</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 rounded"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Slug (unique, e.g. my-article)"
          className="border p-2 rounded"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Meta description"
          className="border p-2 rounded"
          value={meta}
          onChange={e => setMeta(e.target.value)}
        />
        <textarea
          placeholder="Content"
          className="border p-2 rounded min-h-[120px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          className="bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Article"}
        </button>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </div>
  );
} 