'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PlayerDashboard } from '@/components/dashboard/PlayerDashboard'
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handlePlayGame = () => {
    router.push('/game/lobby')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Flashcard Frenzy
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-300">
              Welcome, {profile?.username}!
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {profile?.role === 'teacher' ? (
          <TeacherDashboard onPlayGame={handlePlayGame} />
        ) : (
          <PlayerDashboard onPlayGame={handlePlayGame} />
        )}
      </div>
    </div>
  )
}
