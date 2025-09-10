"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getUserGames, Game } from "@/lib/game";
import { accessibilityManager } from "@/lib/accessibility";

interface PlayerDashboardProps {
  onPlayGame: () => void;
}

interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalScore: number;
  averageScore: number;
}

export function PlayerDashboard({ onPlayGame }: PlayerDashboardProps) {
  const { user, profile } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalScore: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserGames();
  }, [user]);

  const loadUserGames = async () => {
    if (!user) return;

    try {
      const userGames = await getUserGames(user.id);
      setGames(userGames);

      const completedGames = userGames.filter(
        (game) => game.status === "completed"
      );
      const totalGames = completedGames.length;

      let wins = 0;
      let losses = 0;
      let totalScore = 0;

      completedGames.forEach((game) => {
        const isPlayer1 = user.id === game.player1_id;
        const playerScore = isPlayer1 ? game.player1_score : game.player2_score;
        const opponentScore = isPlayer1
          ? game.player2_score
          : game.player1_score;

        totalScore += playerScore;

        if (playerScore > opponentScore) {
          wins++;
        } else if (playerScore < opponentScore) {
          losses++;
        }
      });

      setStats({
        totalGames,
        wins,
        losses,
        totalScore,
        averageScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
      });
    } catch (error) {
      console.error("Error loading user games:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGameResult = (game: Game) => {
    if (game.status !== "completed") return "In Progress";

    const isPlayer1 = user?.id === game.player1_id;
    const playerScore = isPlayer1 ? game.player1_score : game.player2_score;
    const opponentScore = isPlayer1 ? game.player2_score : game.player1_score;

    if (playerScore > opponentScore) return "Win";
    if (playerScore < opponentScore) return "Loss";
    return "Tie";
  };

  const getGameResultColor = (result: string) => {
    switch (result) {
      case "Win":
        return "text-green-600";
      case "Loss":
        return "text-red-600";
      case "Tie":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl px-6 py-10 md:px-10 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm/6 opacity-90">Welcome back</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {profile?.username}
            </h1>
            <p className="mt-2 text-white/90">
              Sharpen your skills with head-to-head flashcard battles.
            </p>
          </div>
          <Button
            onClick={onPlayGame}
            size="lg"
            className="bg-white text-gray-900 hover:bg-white/90 shadow-xl"
          >
            Start New Match
          </Button>
        </div>
        <div className="absolute inset-0 -z-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/60 border-white/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Games
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold tracking-tight">
              {stats.totalGames}
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/60 border-white/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Wins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-emerald-600">
              {stats.wins}
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/60 border-white/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Losses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-rose-600">
              {stats.losses}
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur supports-[backdrop-filter]:bg-white/60 border-white/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-primary">
              {stats.averageScore}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Games
          </CardTitle>
          <CardDescription>Your match history and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading games...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-14">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                🎯
              </div>
              <p className="font-medium">No games played yet</p>
              <p className="text-sm text-muted-foreground">
                Start a match to see your history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {games.slice(0, 10).map((game) => {
                const isPlayer1 = user?.id === game.player1_id;
                const playerScore = isPlayer1
                  ? game.player1_score
                  : game.player2_score;
                const opponentScore = isPlayer1
                  ? game.player2_score
                  : game.player1_score;
                const result = getGameResult(game);

                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(game.created_at)}
                      </div>
                      <div className="text-sm">
                        vs {isPlayer1 ? "Player 2" : "Player 1"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {playerScore} - {opponentScore}
                        </div>
                        <div
                          className={`text-xs ${getGameResultColor(result)}`}
                        >
                          {result}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
