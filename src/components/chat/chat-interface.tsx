"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { WeatherCard, StockCard, F1Card } from "@/components/chat/tool-cards";
import { ChatInput } from "./chat-input";
import { saveMessage } from "@/app/actions/messages";
import { updateConversationTitle } from "@/app/actions/conversation";

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
    initialMessages?: { role: "user" | "assistant"; content: string; toolInvocations?: ToolInvocation[] }[];
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
            toolInvocations: m.toolInvocations,
        }))
    );
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const titleUpdatedRef = useRef(initialMessages.length > 0);

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

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        saveMessage({
            conversationId,
            role: "user",
            content: trimmedInput,
        });

        if (!titleUpdatedRef.current) {
            const title = trimmedInput.slice(0, 50) + (trimmedInput.length > 50 ? "..." : "");
            updateConversationTitle(conversationId, title);
            titleUpdatedRef.current = true;
        }

        const assistantId = crypto.randomUUID();
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No reader");

            const decoder = new TextDecoder();
            let fullContent = "";
            let currentToolInvocations: ToolInvocation[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter((line) => line.trim());

                for (const line of lines) {
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
                    else if (line.startsWith("9:")) {
                        try {
                            const toolData = JSON.parse(line.slice(2));
                            if (toolData.toolCallId) {
                                const existsById = currentToolInvocations.some(t => t.toolCallId === toolData.toolCallId);
                                const existsByName = currentToolInvocations.some(t => t.toolName === toolData.toolName);
                                if (!existsById && !existsByName) {
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
                                            lastMsg.toolInvocations = [...currentToolInvocations];
                                        }
                                        return updated;
                                    });
                                }
                            }
                        } catch (e) { }
                    }
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

            if (fullContent.trim() || currentToolInvocations.length > 0) {
                saveMessage({
                    conversationId,
                    role: "assistant",
                    content: fullContent,
                    toolCalls: currentToolInvocations.length > 0 ? currentToolInvocations : undefined,
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
        <div className="flex flex-col h-full bg-neutral-950">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4">
                <div className="max-w-4xl mx-auto py-6 space-y-4">
                    {/* Empty state */}
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center pt-20">
                            <div className="text-center">
                                <div className="text-4xl mb-4">🤖</div>
                                <h2 className="text-xl font-medium text-neutral-200 mb-2">Start a conversation</h2>
                                <p className="text-neutral-500 text-sm max-w-sm">
                                    Ask me about weather, stock prices, or F1 races.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    <span className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded text-sm">Weather</span>
                                    <span className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded text-sm">Stocks</span>
                                    <span className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded text-sm">F1</span>
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
                                <div key={m.id} className="flex justify-end gap-3">
                                    <div className="max-w-[80%] px-4 py-2 rounded-lg bg-blue-600 text-white">
                                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-lg shrink-0">
                                        👤
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={m.id} className="flex justify-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-lg shrink-0">
                                    🤖
                                </div>
                                <div className="max-w-[80%]">
                                    {hasText && (
                                        <div className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200">
                                            <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                        </div>
                                    )}

                                    {pendingTools.map((invocation) => (
                                        <div key={invocation.toolCallId} className="mt-2 flex items-center gap-2 text-neutral-500 text-sm">
                                            <div className="animate-spin h-3 w-3 border-2 border-neutral-500 border-t-transparent rounded-full" />
                                            Loading...
                                        </div>
                                    ))}

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

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                        <div className="flex justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-lg shrink-0">
                                🤖
                            </div>
                            <div className="px-4 py-2 bg-neutral-800 rounded-lg">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" />
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit}>
                <ChatInput value={inputValue} onChange={(e) => setInputValue(e.target.value)} isLoading={isLoading} />
            </form>
        </div>
    );
}
