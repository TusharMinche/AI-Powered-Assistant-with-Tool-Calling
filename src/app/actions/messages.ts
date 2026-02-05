"use server";

import { db } from "@/db";
import { messages, conversations } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export interface SaveMessageParams {
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    toolCalls?: unknown;
}

// Save a message to the database
export async function saveMessage({
    conversationId,
    role,
    content,
    toolCalls,
}: SaveMessageParams) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const id = crypto.randomUUID();

    await db.insert(messages).values({
        id,
        conversationId,
        role,
        content,
        toolCalls: toolCalls ?? null,
        createdAt: new Date(),
    });

    // Update conversation's updatedAt
    await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    return { id };
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

    return conversationMessages;
}

// Delete a message
export async function deleteMessage(messageId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(messages).where(eq(messages.id, messageId));
}
