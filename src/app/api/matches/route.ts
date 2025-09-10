import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Match from "@/lib/models/Match";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Math.min(
      Number(url.searchParams.get("pageSize") || "20"),
      100
    );
    const isAll = url.searchParams.get("all") === "true";

    // Check role from Supabase profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isTeacher = profile?.role === "teacher";

    const query =
      isAll && isTeacher
        ? {}
        : { $or: [{ player1Id: user.id }, { player2Id: user.id }] };

    const total = await Match.countDocuments(query as any);
    const matches = await Match.find(query as any)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return NextResponse.json({
      page,
      pageSize,
      total,
      matches,
    });
  } catch (err) {
    console.error("GET /api/matches error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
