"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { WeatherCard, StockCard, F1Card } from "@/components/chat/tool-cards";
import { ChatInput } from "./chat-input";
import { saveMessage } from "@/app/actions/messages";
import { updateConversationTitle } from "@/app/actions/conversation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    args: any;
    result?: any;
    state: "pending" | "result";
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    toolInvocations?: ToolInvocation[];
}

interface ChatInterfaceProps {
    conversationId: string;
    initialMessages?: { role: "user" | "assistant"; content: string }[];
}

export function ChatInterface({
    conversationId,
    initialMessages = [],
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(
        initialMessages.map((m, i) => ({
            id: `initial-${i}`,
            role: m.role,
            content: m.content,
        }))
    );
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const titleUpdatedRef = useRef(initialMessages.length > 0);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmedInput,
        };

        // Update title on first message
        if (!titleUpdatedRef.current) {
            const title = trimmedInput.slice(0, 50) + (trimmedInput.length > 50 ? "..." : "");
            updateConversationTitle(conversationId, title);
            titleUpdatedRef.current = true;
        }

        // Save user message to database
        saveMessage({
            conversationId,
            role: "user",
            content: trimmedInput,
        });

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error("No response body");

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "",
                toolInvocations: [],
            };

            setMessages((prev) => [...prev, assistantMessage]);

            let fullContent = "";
            let currentToolInvocations: ToolInvocation[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter((line) => line.trim());

                for (const line of lines) {
                    // Text content (AI SDK v4 format: "0:" prefix)
                    if (line.startsWith("0:")) {
                        try {
                            const text = JSON.parse(line.slice(2));
                            fullContent += text;
                            setMessages((prev) => {
                                const updated = [...prev];
                                const lastMsg = updated[updated.length - 1];
                                if (lastMsg?.role === "assistant") {
                                    lastMsg.content = fullContent;
                                }
                                return updated;
                            });
                        } catch (e) { }
                    }
                    // Tool call start (AI SDK v4 format: "9:" prefix)
                    else if (line.startsWith("9:")) {
                        try {
                            const toolData = JSON.parse(line.slice(2));
                            if (toolData.toolCallId) {
                                const toolInvocation: ToolInvocation = {
                                    toolCallId: toolData.toolCallId,
                                    toolName: toolData.toolName,
                                    args: toolData.args || {},
                                    state: "pending",
                                };
                                currentToolInvocations = [...currentToolInvocations, toolInvocation];
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    const lastMsg = updated[updated.length - 1];
                                    if (lastMsg?.role === "assistant") {
                                        lastMsg.toolInvocations = currentToolInvocations;
                                    }
                                    return updated;
                                });
                            }
                        } catch (e) { }
                    }
                    // Tool result (AI SDK v4 format: "a:" prefix)
                    else if (line.startsWith("a:")) {
                        try {
                            const resultData = JSON.parse(line.slice(2));
                            if (resultData.toolCallId) {
                                currentToolInvocations = currentToolInvocations.map((t) =>
                                    t.toolCallId === resultData.toolCallId
                                        ? { ...t, result: resultData.result, state: "result" }
                                        : t
                                );
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    const lastMsg = updated[updated.length - 1];
                                    if (lastMsg?.role === "assistant") {
                                        lastMsg.toolInvocations = currentToolInvocations;
                                    }
                                    return updated;
                                });
                            }
                        } catch (e) { }
                    }
                }
            }

            // Save assistant message to database (only once, after streaming is done)
            if (fullContent.trim()) {
                saveMessage({
                    conversationId,
                    role: "assistant",
                    content: fullContent,
                });
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
                <div className="max-w-3xl mx-auto py-6 space-y-6">
                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="flex-1 flex items-center justify-center pt-20">
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">How can I help you today?</h2>
                                <p className="text-slate-400 max-w-md">Ask me about the weather, upcoming F1 races, or stock prices. I can fetch real-time information for you!</p>
                                <div className="flex flex-wrap justify-center gap-2 mt-6">
                                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">🌤️ Weather</span>
                                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">🏎️ F1 Races</span>
                                    <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">📈 Stock Prices</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((m) => {
                        const tools = m.toolInvocations || [];
                        const hasText = m.content && m.content.trim().length > 0;
                        const pendingTools = tools.filter((t) => !t.result);
                        const completedTools = tools.filter((t) => t.result);

                        if (m.role === "user") {
                            return (
                                <div key={m.id} className="flex gap-4 flex-row-reverse">
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="bg-purple-600 text-white">U</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-right">
                                        <div className="inline-block px-4 py-3 rounded-2xl bg-purple-600 text-white">
                                            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">{m.content}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Assistant message
                        return (
                            <div key={m.id} className="flex gap-4">
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">AI</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    {/* Text content */}
                                    {hasText && (
                                        <div className="inline-block px-4 py-3 rounded-2xl bg-slate-800 text-slate-100">
                                            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">{m.content}</div>
                                        </div>
                                    )}

                                    {/* Pending tools - loading state */}
                                    {pendingTools.map((invocation) => (
                                        <div key={invocation.toolCallId} className="mt-2 flex items-center gap-2 text-slate-400 text-sm">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
                                            Running {invocation.toolName}...
                                        </div>
                                    ))}

                                    {/* Completed tool cards */}
                                    {completedTools.map((invocation) => {
                                        if (invocation.toolName === "getWeather") {
                                            return <WeatherCard key={invocation.toolCallId} data={invocation.result} />;
                                        }
                                        if (invocation.toolName === "getStockPrice") {
                                            return <StockCard key={invocation.toolCallId} data={invocation.result} />;
                                        }
                                        if (invocation.toolName === "getF1Matches") {
                                            return <F1Card key={invocation.toolCallId} data={invocation.result} />;
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Loading indicator */}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                        <div className="flex gap-4">
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-slate-800 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit}>
                <ChatInput value={inputValue} onChange={(e) => setInputValue(e.target.value)} isLoading={isLoading} />
            </form>
        </div>
    );
}
