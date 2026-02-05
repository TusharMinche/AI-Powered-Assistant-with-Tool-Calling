import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { conversations } from "@/db/schema";

export default async function ChatPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Create a new conversation directly without using the action
    // (to avoid revalidatePath during render)
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(conversations).values({
        id,
        userId: session.user.id,
        title: "New Chat",
        createdAt: now,
        updatedAt: now,
    });

    redirect(`/chat/${id}`);
}
