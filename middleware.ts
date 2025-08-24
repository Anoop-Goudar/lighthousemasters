import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
	function middleware(req) {
		const token = req.nextauth.token;
		const { pathname } = req.nextUrl;

		const publicRoutes = ["/", "/auth/signin", "/auth/signup"];
		if (publicRoutes.includes(pathname)) {
			return NextResponse.next();
		}

		if (pathname.startsWith("/admin")) {
			if (token?.role !== "admin") {
				return NextResponse.redirect(new URL("/unauthorized", req.url));
			}
		}

		if (pathname.startsWith("/coach")) {
			if (!["admin", "coach"].includes(token?.role as string)) {
				return NextResponse.redirect(new URL("/unauthorized", req.url));
			}
		}

		if (pathname.startsWith("/parent")) {
			if (!["admin", "parent"].includes(token?.role as string)) {
				return NextResponse.redirect(new URL("/unauthorized", req.url));
			}
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: ({ token }) => !!token,
		},
	}
);

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
