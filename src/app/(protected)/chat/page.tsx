import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-white">
                    Welcome, {session.user.name}!
                </h1>
                <p className="text-slate-400">
                    AI Chat interface coming soon...
                </p>
                <p className="text-sm text-slate-500">
                    Logged in as {session.user.email}
                </p>
            </div>
        </div>
    );
}
