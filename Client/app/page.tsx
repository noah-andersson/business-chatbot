"use client";

import ChatBot from "@/components/ChatBot";

export default function Home() {
  return (
    <div className="grid flex items-end justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <ChatBot />
    </div>
  );
}
