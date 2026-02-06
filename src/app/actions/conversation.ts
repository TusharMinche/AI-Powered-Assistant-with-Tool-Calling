"use server";

import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Create a new conversation
export async function createConversation(title?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(conversations).values({
        id,
        userId: session.user.id,
        title: title || "New Chat",
        createdAt: now,
        updatedAt: now,
    });

    // Don't revalidatePath here - we use optimistic updates in the UI
    return { id };
}

// Get all conversations for the current user
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const userConversations = await db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, session.user.id))
        .orderBy(desc(conversations.updatedAt));

    return userConversations;
}

// Get a specific conversation with messages
export async function getConversation(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

    if (conversation.length === 0 || conversation[0].userId !== session.user.id) {
        return null;
    }

    const conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

    return {
        ...conversation[0],
        messages: conversationMessages,
    };
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

    if (conversation.length === 0 || conversation[0].userId !== session.user.id) {
        throw new Error("Conversation not found");
    }

    await db.delete(conversations).where(eq(conversations.id, conversationId));
    revalidatePath("/chat");
}

// Update conversation title
export async function updateConversationTitle(
    conversationId: string,
    title: string
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db
        .update(conversations)
        .set({ title, updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    revalidatePath("/chat");
}
