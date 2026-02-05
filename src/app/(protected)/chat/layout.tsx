import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-slate-950">
            <ChatSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>
    );
}
