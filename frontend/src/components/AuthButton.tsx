"use client";
import { signIn, signOut, useSession } from "next-auth/react";

function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button className="px-4 py-2 rounded bg-gray-200 animate-pulse">Loading...</button>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {session.user?.image && (
          <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full border" />
        )}
        <span className="font-medium text-gray-700">{session.user?.name}</span>
        <button
          onClick={() => signOut()}
          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border text-xs"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
    >
      Sign in with Google
    </button>
  );
}

export default AuthButton; 