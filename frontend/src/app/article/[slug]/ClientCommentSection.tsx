"use client";
import dynamic from "next/dynamic";

const CommentSection = dynamic(() => import("../../../components/CommentSection"), { ssr: false });

export default function ClientCommentSection({ articleId }: { articleId: string }) {
  return <CommentSection articleId={articleId} />;
} 