import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatLayoutClient from "@/components/chat/chat-layout-client";

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return <ChatLayoutClient>{children}</ChatLayoutClient>;
}
