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
import { Game } from "@/lib/game";
import { accessibilityManager } from "@/lib/accessibility";

interface TeacherDashboardProps {
  onPlayGame: () => void;
}

interface GameStats {
  totalGames: number;
  activeGames: number;
  completedGames: number;
  totalPlayers: number;
}

export function TeacherDashboard({ onPlayGame }: TeacherDashboardProps) {
  const { user, profile } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0,
    activeGames: 0,
    completedGames: 0,
    totalPlayers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllGames();
  }, []);

  const loadAllGames = async () => {
    try {
      const response = await fetch("/api/games/all", {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (response.ok) {
        const allGames = await response.json();
        setGames(allGames);

        const totalGames = allGames.length;
        const activeGames = allGames.filter(
          (game) => game.status === "active"
        ).length;
        const completedGames = allGames.filter(
          (game) => game.status === "completed"
        ).length;

        const uniquePlayers = new Set<string>();
        allGames.forEach((game) => {
          uniquePlayers.add(game.player1_id);
          if (game.player2_id) {
            uniquePlayers.add(game.player2_id);
          }
        });

        setStats({
          totalGames,
          activeGames,
          completedGames,
          totalPlayers: uniquePlayers.size,
        });
      }
    } catch (error) {
      console.error("Error loading all games:", error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "text-yellow-600";
      case "active":
        return "text-green-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl px-6 py-8 md:px-10 bg-gradient-to-br from-sky-600 via-indigo-600 to-fuchsia-600 text-white">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Teacher Dashboard
            </h1>
            <p className="mt-2 text-white/90">
              Monitor all games, trends, and student activity.
            </p>
          </div>
          <Button
            onClick={onPlayGame}
            size="lg"
            className="bg-white text-gray-900 hover:bg-white/90 shadow-xl"
          >
            Play Demo Game
          </Button>
        </div>
        <div className="absolute inset-0 -z-0 opacity-30 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.totalGames}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Games</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeGames}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Completed Games
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {stats.completedGames}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {stats.totalPlayers}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>All Games</CardTitle>
            <CardDescription>
              Complete overview of all student games
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading games...</p>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No games found.</p>
                <p className="text-sm">
                  Games will appear here as students start playing.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(game.created_at)}
                      </div>
                      <div className="text-sm">
                        Player 1 vs{" "}
                        {game.player2_id ? "Player 2" : "Waiting..."}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {game.player1_score} - {game.player2_score}
                        </div>
                        <div
                          className={`text-sm ${getStatusColor(game.status)}`}
                        >
                          {game.status.charAt(0).toUpperCase() +
                            game.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
            <CardDescription>Performance metrics and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Game Completion Rate</span>
                <span className="font-semibold">
                  {stats.totalGames > 0
                    ? Math.round(
                        (stats.completedGames / stats.totalGames) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${stats.totalGames > 0 ? (stats.completedGames / stats.totalGames) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Games</span>
                <span className="font-semibold">{stats.activeGames}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${stats.totalGames > 0 ? (stats.activeGames / stats.totalGames) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Recent Activity</h4>
              <div className="space-y-2 text-sm">
                {games.slice(0, 5).map((game) => (
                  <div key={game.id} className="flex justify-between">
                    <span>Game #{game.id.slice(0, 8)}</span>
                    <span className={getStatusColor(game.status)}>
                      {game.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
