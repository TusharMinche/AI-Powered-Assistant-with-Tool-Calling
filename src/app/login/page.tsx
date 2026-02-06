import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
            <div className="w-full max-w-sm bg-neutral-900 rounded-lg border border-neutral-800 p-8">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4">🤖</div>
                    <h1 className="text-xl font-semibold text-neutral-100">
                        AI Chat
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Sign in to continue
                    </p>
                </div>

                <div className="space-y-3">
                    <LoginButton provider="google">
                        Continue with Google
                    </LoginButton>
                    <LoginButton provider="github">
                        Continue with GitHub
                    </LoginButton>
                </div>

                <p className="text-xs text-center text-neutral-600 mt-6">
                    By signing in, you agree to our Terms
                </p>
            </div>
        </div>
    );
}
