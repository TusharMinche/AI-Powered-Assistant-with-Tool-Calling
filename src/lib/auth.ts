import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            try {
                // Check if user exists
                const existingUser = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email))
                    .limit(1);

                if (existingUser.length === 0) {
                    // Create new user
                    await db.insert(users).values({
                        id: crypto.randomUUID(),
                        email: user.email,
                        name: user.name ?? null,
                        image: user.image ?? null,
                    });
                }

                return true;
            } catch (error) {
                console.error("Error during sign in:", error);
                return false;
            }
        },
        async session({ session }) {
            if (session.user?.email) {
                const dbUser = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, session.user.email))
                    .limit(1);

                if (dbUser.length > 0) {
                    session.user.id = dbUser[0].id;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
