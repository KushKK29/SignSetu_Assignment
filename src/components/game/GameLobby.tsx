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
import { createGame, joinGame, getAvailableGames, Game } from "@/lib/game";
import accessibilityManager from '@/lib/accessibility';

interface GameLobbyProps {
  onGameStart: (gameId: string) => void;
}

export function GameLobby({ onGameStart }: GameLobbyProps) {
  const { user, profile } = useAuth();
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingGame, setCreatingGame] = useState(false);

  useEffect(() => {
    loadAvailableGames();

    const interval = setInterval(loadAvailableGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAvailableGames = async () => {
    try {
      const games = await getAvailableGames();
      setAvailableGames(games.filter((game) => game.player1_id !== user?.id));
    } catch (error) {
      console.error("Error loading available games:", error);
    }
  };

  const handleCreateGame = async () => {
    if (!user || !profile) return;

    setCreatingGame(true);
    try {
      const game = await createGame(user.id, profile.username);
      accessibilityManager().announceFormSuccess('Game created successfully');
      onGameStart(game.id);
    } catch (error) {
      console.error("Error creating game:", error);
      accessibilityManager().announceFormError('game creation', 'Failed to create game');
    } finally {
      setCreatingGame(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      await joinGame(gameId, user.id, profile.username);
      accessibilityManager().announcePlayerJoined(profile.username);
      onGameStart(gameId);
    } catch (error) {
      console.error("Error joining game:", error);
      accessibilityManager().announceFormError('game join', 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="relative overflow-hidden rounded-2xl px-6 py-10 md:px-10 bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Game Lobby
          </h1>
          <p className="mt-2 text-white/90">
            Create a new game or join an existing one to start playing.
          </p>
          <div className="mt-6">
            <Button
              onClick={handleCreateGame}
              disabled={creatingGame}
              size="lg"
              className="bg-white text-gray-900 hover:bg-white/90 shadow-xl"
              aria-busy={creatingGame}
            >
              {creatingGame ? "Creating…" : "Create New Game"}
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 -z-0 opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Available Games</CardTitle>
          <CardDescription>
            Join a waiting match to battle another player
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {availableGames.length === 0 ? (
            <div className="text-center py-14">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                🕹️
              </div>
              <p className="font-medium">No available games</p>
              <p className="text-sm text-muted-foreground">
                Create a new game to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableGames.map((game) => (
                <Card
                  key={game.id}
                  className="rounded-xl border bg-card hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">
                      Game #{game.id.slice(0, 8)}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Waiting for player…
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={() => handleJoinGame(game.id)}
                      disabled={loading}
                      size="sm"
                      className="w-full"
                      aria-busy={loading}
                    >
                      {loading ? "Joining…" : "Join Game"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
