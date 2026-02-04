import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/api/auth"];
    const isPublicRoute = publicRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );

    // Redirect to login if not authenticated and trying to access protected route
    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Redirect to chat if already logged in and trying to access login page
    if (isLoggedIn && nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/chat", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
