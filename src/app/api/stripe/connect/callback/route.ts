import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { createServiceClient } from "../../../../../lib/supabase/server";
import { exchangeConnectCode } from "../../../../../lib/stripe/api";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // User declined or something went wrong on Stripe's side
  if (error) {
    return NextResponse.redirect(`${appUrl}/settings?stripe=cancelled`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }

  // Verify CSRF state token
  const cookieStore = await cookies();
  const savedState = cookieStore.get("stripe_connect_state")?.value;
  cookieStore.delete("stripe_connect_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }

  // Verify the user is still logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  try {
    const { stripeUserId } = await exchangeConnectCode(code);

    // Save the connected account ID to the user's settings row
    const service = createServiceClient();
    const { error: dbError } = await service
      .from("settings")
      .upsert(
        { user_id: user.id, stripe_account_id: stripeUserId, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

    if (dbError) {
      console.error("Failed to save stripe_account_id:", dbError);
      return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
    }

    return NextResponse.redirect(`${appUrl}/settings?stripe=connected`);
  } catch (err) {
    console.error("Stripe Connect OAuth error:", err);
    return NextResponse.redirect(`${appUrl}/settings?stripe=error`);
  }
}
