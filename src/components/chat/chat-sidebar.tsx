"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConversations, createConversation, deleteConversation } from "@/app/actions/conversation";
import type { Conversation } from "@/db/schema";

interface ChatSidebarProps {
    currentConversationId?: string;
}

export function ChatSidebar({ currentConversationId }: ChatSidebarProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

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
        try {
            const { id } = await createConversation();
            router.push(`/chat/${id}`);
            loadConversations();
        } catch (error) {
            console.error("Failed to create conversation:", error);
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
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-72">
            {/* Header */}
            <div className="p-4 border-b border-slate-800">
                <Button
                    onClick={handleNewChat}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    New Chat
                </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-2">
                <div className="py-2 space-y-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <p className="text-center text-slate-500 py-8 text-sm">
                            No conversations yet
                        </p>
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => router.push(`/chat/${conversation.id}`)}
                                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${currentConversationId === conversation.id
                                        ? "bg-slate-800 text-white"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                    }`}
                            >
                                <span className="truncate text-sm">{conversation.title}</span>
                                <button
                                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-opacity"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <Separator className="bg-slate-800" />

            {/* User Section */}
            <div className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="bg-purple-600 text-white">
                                    {session?.user?.name?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-white truncate">
                                    {session?.user?.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-red-500 focus:text-red-500"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
