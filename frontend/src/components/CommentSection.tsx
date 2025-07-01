"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function CommentSection({ articleId }: { articleId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/comments/${articleId}`)
      .then(res => res.json())
      .then(setComments)
      .catch(() => setError("Failed to load comments"))
      .finally(() => setLoading(false));
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: session?.user?.name || session?.user?.email || "Anonymous",
          comment,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setComment("");
    } catch {
      setError("Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border rounded p-2"
            disabled={posting}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={posting}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <div className="mb-6 text-gray-500">Sign in to post a comment.</div>
      )}
      {loading ? (
        <div>Loading comments...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : comments.length === 0 ? (
        <div>No comments yet.</div>
      ) : (
        <ul className="space-y-4">
          {comments.map((c, i) => (
            <li key={c._id || i} className="border rounded p-3 bg-gray-50">
              <div className="font-medium text-gray-700 mb-1">{c.user}</div>
              <div className="text-gray-800">{c.comment}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 