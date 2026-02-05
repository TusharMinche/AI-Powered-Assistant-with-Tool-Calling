"use client";

import { useState, useCallback } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { saveMessage } from "@/app/actions/messages";
import { updateConversationTitle } from "@/app/actions/conversation";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
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
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async (content: string) => {
        // Add user message to UI
        const userMessageId = `user-${Date.now()}`;
        const userMessage: Message = {
            id: userMessageId,
            role: "user",
            content,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        // Save user message to database
        await saveMessage({
            conversationId,
            role: "user",
            content,
        });

        // Update conversation title if it's the first message
        if (messages.length === 0) {
            const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
            await updateConversationTitle(conversationId, title);
        }

        // Create assistant message placeholder
        const assistantMessageId = `assistant-${Date.now()}`;
        setMessages((prev) => [
            ...prev,
            { id: assistantMessageId, role: "assistant", content: "" },
        ]);

        try {
            // Call the chat API
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

            if (!response.ok) throw new Error("Failed to get response");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") continue;

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    assistantContent += parsed.text;
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m.id === assistantMessageId
                                                ? { ...m, content: assistantContent }
                                                : m
                                        )
                                    );
                                }
                            } catch {
                                // Ignore parse errors for incomplete chunks
                            }
                        }
                    }
                }
            }

            // Save assistant message to database
            if (assistantContent.trim()) {
                await saveMessage({
                    conversationId,
                    role: "assistant",
                    content: assistantContent,
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMessageId
                        ? { ...m, content: "Sorry, an error occurred. Please try again." }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, messages]);

    return (
        <div className="flex flex-col h-full bg-slate-950">
            <MessageList messages={messages} isLoading={isLoading} />
            <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
