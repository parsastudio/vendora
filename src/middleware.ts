import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/features/shared/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rate = await rateLimit(`rate_limit:${ip}`, 60, 60);
    if (!rate.success) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": rate.limit.toString(),
          "X-RateLimit-Remaining": rate.remaining.toString(),
          "X-RateLimit-Reset": rate.reset.toString(),
        },
      });
    }
    return NextResponse.next();
  }

  const host = request.headers.get("host") || "localhost";
  const hostname = host.split(":")[0];
  const currentHost = hostname.replace(".localhost", "").replace(".vendora", "");

  let tenantDomain = "default";
  if (currentHost !== "localhost" && currentHost !== "vendora") {
    tenantDomain = currentHost;
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  url.pathname = `/${tenantDomain}${pathname}`;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-domain", tenantDomain);

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}
