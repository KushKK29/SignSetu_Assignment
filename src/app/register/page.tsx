'use client'

import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Join Flashcard Frenzy and start playing!</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm 
              onSuccess={() => router.push('/dashboard')}
              onSwitchToLogin={() => router.push('/login')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
