"use client";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { useState } from "react";

export default function ChatLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-neutral-950">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - hidden on mobile by default, shown when open */}
            <div
                className={`fixed md:relative z-50 h-full transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                <ChatSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header with menu button */}
                <div className="md:hidden flex items-center gap-3 p-3 border-b border-neutral-800">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-neutral-400 hover:text-neutral-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-neutral-200 font-medium">AI Chat</span>
                </div>
                {children}
            </main>
        </div>
    );
}
