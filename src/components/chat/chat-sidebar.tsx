"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { getConversations, createConversation, deleteConversation } from "@/app/actions/conversation";
import type { Conversation } from "@/db/schema";

interface ChatSidebarProps {
    currentConversationId?: string;
}

export function ChatSidebar({ currentConversationId }: ChatSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    // Clear loading state when URL changes (navigation completes)
    useEffect(() => {
        setNavigatingTo(null);
    }, [pathname]);

    async function loadConversations() {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleNewChat() {
        if (isCreatingChat) return;
        setIsCreatingChat(true);
        try {
            const result = await createConversation();
            if (result?.id) {
                await loadConversations();
                router.push(`/chat/${result.id}`);
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to create conversation:", error);
        } finally {
            setIsCreatingChat(false);
        }
    }

    async function handleDeleteConversation(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        try {
            await deleteConversation(id);
            if (currentConversationId === id) {
                router.push("/chat");
            }
            loadConversations();
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        }
    }

    return (
        <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 w-64">
            {/* Header */}
            <div className="p-4 border-b border-neutral-800">
                <h1 className="text-lg font-semibold text-neutral-100 mb-3">AI Chat</h1>
                <Button
                    onClick={handleNewChat}
                    disabled={isCreatingChat}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700"
                >
                    {isCreatingChat ? (
                        <span className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-neutral-500 border-t-transparent rounded-full" />
                            Creating...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="text-lg">+</span>
                            New Chat
                        </span>
                    )}
                </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2">
                    <p className="px-2 py-1 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        History
                    </p>
                    <div className="mt-2 space-y-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin h-5 w-5 border-2 border-neutral-500 border-t-transparent rounded-full" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-center text-neutral-500 py-8 text-sm">
                                No chats yet
                            </p>
                        ) : (
                            conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => {
                                        // Don't navigate if already on this chat or currently navigating
                                        if (navigatingTo) return;
                                        if (pathname === `/chat/${conversation.id}`) return;
                                        if (currentConversationId === conversation.id) return;
                                        setNavigatingTo(conversation.id);
                                        router.push(`/chat/${conversation.id}`);
                                    }}
                                    className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer text-sm ${currentConversationId === conversation.id || pathname === `/chat/${conversation.id}`
                                        ? "bg-neutral-800 text-neutral-100"
                                        : "text-neutral-400 hover:bg-neutral-800/50"
                                        }`}
                                >
                                    <span className="truncate flex items-center gap-2">
                                        {navigatingTo === conversation.id && (
                                            <div className="animate-spin h-3 w-3 border-2 border-neutral-500 border-t-transparent rounded-full" />
                                        )}
                                        {conversation.title}
                                    </span>
                                    <button
                                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 rounded"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </ScrollArea>

            {/* User Section */}
            <div className="p-4 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-200 text-sm font-medium">
                            {session?.user?.name?.[0] || "U"}
                        </div>
                        <span className="text-sm text-neutral-400 truncate">
                            {session?.user?.name || "User"}
                        </span>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="text-xs text-neutral-500 hover:text-red-400"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
