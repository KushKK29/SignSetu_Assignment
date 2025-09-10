'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Flashcard Frenzy Multiplayer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Challenge your friends in real-time flashcard battles!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>🎮 Real-time Competition</CardTitle>
                <CardDescription>
                  Battle against friends in live multiplayer flashcard matches
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>📊 Track Progress</CardTitle>
                <CardDescription>
                  Monitor your performance and improvement over time
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🏆 Earn Points</CardTitle>
                <CardDescription>
                  Score points for correct answers and climb the leaderboard
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>♿ Accessible</CardTitle>
                <CardDescription>
                  Full screen reader support for inclusive gaming
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={() => router.push('/login')} size="lg">
              Sign In
            </Button>
            <Button onClick={() => router.push('/register')} variant="outline" size="lg">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
