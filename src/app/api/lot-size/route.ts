import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { getTeamContext } from "../../../lib/team";
import { getUserPlanInfo } from "../../../lib/plan-guard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sqftParam = searchParams.get("sqft");
  const sqft = sqftParam ? Math.round(Number(sqftParam)) : null;

  if (!sqft || sqft <= 0 || isNaN(sqft)) {
    return NextResponse.json({ error: "A valid square footage is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ownerId } = await getTeamContext(supabase, user.id);

  // Gate to Pro and Premier
  const { config } = await getUserPlanInfo(ownerId);
  if (!config.smartEstimate) {
    return NextResponse.json(
      { error: "Smart Estimate is available on Pro and Premier plans." },
      { status: 403 }
    );
  }

  // Fetch owner's pricing tiers from settings
  const { data: settings } = await supabase
    .from("settings")
    .select("estimate_small_price, estimate_medium_price, estimate_large_price, estimate_small_max_sqft, estimate_large_min_sqft")
    .eq("user_id", ownerId)
    .maybeSingle();

  const smallMax = settings?.estimate_small_max_sqft ?? 5000;
  const largeMin = settings?.estimate_large_min_sqft ?? 15000;
  const smallPrice = settings?.estimate_small_price ?? 45;
  const mediumPrice = settings?.estimate_medium_price ?? 65;
  const largePrice = settings?.estimate_large_price ?? 95;

  let tier: "small" | "medium" | "large";
  let suggestedPrice: number;

  if (sqft < smallMax) {
    tier = "small";
    suggestedPrice = smallPrice;
  } else if (sqft >= largeMin) {
    tier = "large";
    suggestedPrice = largePrice;
  } else {
    tier = "medium";
    suggestedPrice = mediumPrice;
  }

  return NextResponse.json({
    sqft,
    acres: Math.round((sqft / 43560) * 100) / 100,
    tier,
    suggestedPrice,
  });
}
