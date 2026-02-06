import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getConversation } from "@/app/actions/conversation";
import { ChatInterface } from "@/components/chat/chat-interface";

interface ChatConversationPageProps {
    params: Promise<{ id: string }>;
}

export default async function ChatConversationPage({
    params,
}: ChatConversationPageProps) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;
    const conversation = await getConversation(id);

    if (!conversation) {
        notFound();
    }

    const initialMessages = conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        toolInvocations: (m.toolCalls as any) || undefined,
    }));

    return <ChatInterface conversationId={id} initialMessages={initialMessages} />;
}
