import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { submitAnswer, getGameState } from "@/lib/game";

export async function POST(req: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId, questionId, answer } = await req.json();
    if (!gameId || !questionId || typeof answer !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const response = await submitAnswer(gameId, questionId, user.id, answer, 0);
    const state = await getGameState(gameId);
    return NextResponse.json({ ...response, state });
  } catch (err) {
    console.error("POST /api/answers error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
