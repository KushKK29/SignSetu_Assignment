'use client'

import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue to Flashcard Frenzy</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm 
              onSuccess={() => router.push('/dashboard')}
              onSwitchToRegister={() => router.push('/register')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
