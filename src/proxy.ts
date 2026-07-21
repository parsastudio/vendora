import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") || "localhost";
  const hostname = host.split(":")[0];
  const currentHost = hostname.replace(".localhost", "").replace(".vendora", "");

  let tenantDomain = "default";
  if (currentHost !== "localhost" && currentHost !== "vendora") {
    tenantDomain = currentHost;
  }

  if (pathname.startsWith("/api")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-domain", tenantDomain);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (tenantDomain === "default") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith(`/${tenantDomain}/`) || pathname === `/${tenantDomain}`) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-domain", tenantDomain);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
