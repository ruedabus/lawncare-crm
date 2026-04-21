import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL!));
  }

  const clientId = process.env.STRIPE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "STRIPE_CLIENT_ID not configured" }, { status: 500 });
  }

  // CSRF protection: store a random state token in a short-lived cookie
  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("stripe_connect_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${appUrl}/api/stripe/connect/callback`;

  const url = new URL("https://connect.stripe.com/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "read_write");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  // Pre-fill the business type for lawn care
  url.searchParams.set("stripe_user[business_type]", "sole_prop");

  return NextResponse.redirect(url.toString());
}
