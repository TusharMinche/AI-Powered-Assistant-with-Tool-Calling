"use client";

import { useChat } from "ai/react";
import { useEffect } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { saveMessage } from "@/app/actions/messages";
import { updateConversationTitle } from "@/app/actions/conversation";

interface ChatInterfaceProps {
    conversationId: string;
    initialMessages?: { role: "user" | "assistant"; content: string }[];
}

export function ChatInterface({
    conversationId,
    initialMessages = [],
}: ChatInterfaceProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        initialMessages: initialMessages.map((m, i) => ({
            id: `initial-${i}`,
            role: m.role,
            content: m.content,
        })),
    });

    // Save messages to database when they change
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.id.startsWith("initial-")) {
            // Update conversation title with first user message
            if (messages.length === 1 && lastMessage.role === "user") {
                const title = lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? "..." : "");
                updateConversationTitle(conversationId, title);
            }

            // Save message to database
            saveMessage({
                conversationId,
                role: lastMessage.role,
                content: lastMessage.content,
            });
        }
    }, [messages, conversationId]);

    return (
        <div className="flex flex-col h-full bg-slate-950">
            <MessageList
                messages={messages.map(m => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                }))}
                isLoading={isLoading}
            />
            <form onSubmit={handleSubmit}>
                <ChatInput
                    value={input}
                    onChange={handleInputChange}
                    isLoading={isLoading}
                />
            </form>
        </div>
    );
}
