"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        How can I help you today?
                    </h2>
                    <p className="text-slate-400 max-w-md">
                        Ask me about the weather, upcoming F1 races, or stock prices.
                        I can fetch real-time information for you!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">
                            🌤️ Weather
                        </span>
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">
                            🏎️ F1 Races
                        </span>
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">
                            📈 Stock Prices
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className="flex-1 px-4">
            <div className="max-w-3xl mx-auto py-6 space-y-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""
                            }`}
                    >
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback
                                className={
                                    message.role === "user"
                                        ? "bg-purple-600 text-white"
                                        : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                }
                            >
                                {message.role === "user" ? "U" : "AI"}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={`flex-1 ${message.role === "user" ? "text-right" : ""
                                }`}
                        >
                            <div
                                className={`inline-block px-4 py-3 rounded-2xl ${message.role === "user"
                                    ? "bg-purple-600 text-white"
                                    : "bg-slate-800 text-slate-100"
                                    }`}
                            >
                                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                    <div className="flex gap-4">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                AI
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-slate-800 rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                <span
                                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                />
                                <span
                                    className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>
        </ScrollArea>
    );
}
