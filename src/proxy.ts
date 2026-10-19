import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


function resolveTenantDomain(hostHeader: string | null): string {
  const host = (hostHeader || "localhost").toLowerCase();
  const hostname = host.split(":")[0];

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") {
    return "default";
  }

  if (hostname.endsWith(".localhost")) {
    return hostname.replace(".localhost", "");
  }

  const rootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    "vendora.iamparsa.com"
  )
    .toLowerCase()
    .trim();

  if (
    hostname === rootDomain ||
    hostname === `www.${rootDomain}` ||
    hostname === "vendora" ||
    hostname === "www.vendora"
  ) {
    return "default";
  }

  if (hostname.endsWith(`.${rootDomain}`)) {
    const candidate = hostname.slice(0, -(rootDomain.length + 1));
    return candidate === "www" ? "default" : candidate;
  }

  return hostname;
}
export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const tenantDomain = resolveTenantDomain(request.headers.get("host"));

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

export default proxy;
