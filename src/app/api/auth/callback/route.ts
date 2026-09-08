import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("insforge_code");
  if (!code || request.nextUrl.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/admin-login?error=oauth", request.url));
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("insforge_code_verifier")?.value;
  if (!codeVerifier) return NextResponse.redirect(new URL("/admin-login?error=oauth", request.url));

  const response = NextResponse.redirect(new URL("/admin", request.url));
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.INSFORGE_ADMIN_KEY;
  if (!baseUrl || !anonKey) return NextResponse.redirect(new URL("/admin-login?error=config", request.url));

  const auth = createAuthActions({ baseUrl, anonKey, requestCookies: request.cookies, responseCookies: response.cookies });
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);
  if (error || !data?.user) return NextResponse.redirect(new URL("/admin-login?error=oauth", request.url));
  response.cookies.delete("insforge_code_verifier");
  return response;
}