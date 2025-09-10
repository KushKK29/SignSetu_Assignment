"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  GameState,
  submitAnswer,
  nextQuestion,
  subscribeToGame,
  getGameState,
} from "@/lib/game";
import { accessibilityManager } from "@/lib/accessibility";

interface GameBoardProps {
  gameId: string;
  onGameEnd: () => void;
}

export function GameBoard({ gameId, onGameEnd }: GameBoardProps) {
  const { user, profile } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadGameState = async () => {
      try {
        const state = await getGameState(gameId);
        setGameState(state);

        if (state.status === "waiting") {
          accessibilityManager().announceGameStart(
            state.player1Username,
            state.player2Username
          );
        }
      } catch (error) {
        console.error("Error loading game state:", error);
      }
    };

    loadGameState();

    const subscription = subscribeToGame(gameId, (newState) => {
      setGameState(newState);

      if (newState.status === "active" && newState.currentQuestion) {
        accessibilityManager().announceQuestion(
          newState.currentQuestion.question,
          newState.currentQuestionIndex + 1,
          10
        );
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameId]);

  useEffect(() => {
    if (gameState?.status === "active" && gameState.currentQuestion) {
      setTimeRemaining(30);
      setSelectedAnswer(null);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            handleNextQuestion();
            return 30;
          }
          accessibilityManager().announceTimeRemaining(prev - 1);
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState?.currentQuestionIndex, gameState?.status]);

  const handleAnswerSubmit = async (answer: string) => {
    if (!gameState || !user || loading || selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    setLoading(true);

    try {
      const startTime = Date.now();
      const responseTime = 0;

      const result = await submitAnswer(
        gameId,
        gameState.currentQuestion!.id,
        user.id,
        answer,
        responseTime
      );

      const playerUsername =
        user.id === gameState.player1Id
          ? gameState.player1Username
          : gameState.player2Username;
      accessibilityManager().announceAnswer(playerUsername, result.correct, 1);

      if (result.correct) {
        setTimeout(() => {
          handleNextQuestion();
        }, 1500);
      } else {
        setTimeout(() => {
          setSelectedAnswer(null);
          setLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setSelectedAnswer(null);
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!gameState) return;

    try {
      const newState = await nextQuestion(gameId);
      setGameState(newState);

      if (newState.status === "completed") {
        const winner =
          newState.player1Score > newState.player2Score
            ? newState.player1Username
            : newState.player2Score > newState.player1Score
              ? newState.player2Username
              : null;

        accessibilityManager().announceGameEnd(
          winner,
          newState.player1Username,
          newState.player1Score,
          newState.player2Username,
          newState.player2Score
        );

        setTimeout(() => {
          onGameEnd();
        }, 3000);
      }
    } catch (error) {
      console.error("Error moving to next question:", error);
    }
  };

  const isPlayer1 = user?.id === gameState?.player1Id;
  const playerScore = isPlayer1
    ? gameState?.player1Score
    : gameState?.player2Score;
  const opponentScore = isPlayer1
    ? gameState?.player2Score
    : gameState?.player1Score;

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  if (gameState.status === "waiting") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Waiting for Player</CardTitle>
            <CardDescription>
              Share this game code with a friend:{" "}
              <span className="font-mono bg-muted px-2 py-1 rounded">
                {gameId.slice(0, 8)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Waiting for another player to join...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.status === "completed") {
    const winner =
      gameState.player1Score > gameState.player2Score
        ? gameState.player1Username
        : gameState.player2Score > gameState.player1Score
          ? gameState.player2Username
          : null;

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500" />
          <CardHeader>
            <CardTitle>Game Over!</CardTitle>
            <CardDescription>
              {winner ? `${winner} wins!` : "It's a tie!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>
                <div className="font-semibold">{gameState.player1Username}</div>
                <div className="text-3xl font-bold text-primary">
                  {gameState.player1Score}
                </div>
              </div>
              <div>
                <div className="font-semibold">{gameState.player2Username}</div>
                <div className="text-3xl font-bold text-primary">
                  {gameState.player2Score}
                </div>
              </div>
            </div>
            <Button onClick={onGameEnd} size="lg" className="mt-2">
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-sky-500 to-emerald-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">You</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-primary">{playerScore}</div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-fuchsia-500 to-rose-500" />
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Opponent</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-primary">
              {opponentScore}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600" />
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Question {gameState.currentQuestionIndex + 1} of 10
            </CardTitle>
            <div className="text-lg font-semibold">
              <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(timeRemaining / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {gameState.currentQuestion && (
            <>
              <div className="text-xl font-semibold text-center">
                {gameState.currentQuestion.question}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {gameState.currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect =
                    option === gameState.currentQuestion?.correct_answer;
                  const showResult = selectedAnswer !== null;

                  let buttonVariant:
                    | "default"
                    | "destructive"
                    | "outline"
                    | "secondary"
                    | "ghost"
                    | "link" = "default";
                  if (showResult) {
                    if (isCorrect) {
                      buttonVariant = "default";
                    } else if (isSelected && !isCorrect) {
                      buttonVariant = "destructive";
                    } else {
                      buttonVariant = "outline";
                    }
                  }

                  return (
                    <Button
                      key={index}
                      variant={buttonVariant}
                      onClick={() => handleAnswerSubmit(option)}
                      disabled={loading || selectedAnswer !== null}
                      className="h-auto p-4 text-left justify-start rounded-xl border shadow-sm"
                      aria-busy={loading}
                    >
                      <span className="mr-3 font-bold">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
