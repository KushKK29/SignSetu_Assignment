import { supabase } from './supabase'
import { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']

export async function signUp(email: string, password: string, username: string, role: 'student' | 'teacher' = 'student') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        role,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw error
  }

  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // If table doesn't exist or other error, create a basic profile from user data
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('Profiles table not found, creating basic profile from user data')
        return {
          id: user.id,
          email: user.email || '',
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          role: user.user_metadata?.role || 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      console.error('Error fetching profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in getCurrentProfile:', error)
    return null
  }
}

export async function createProfile(userId: string, email: string, username: string, role: 'student' | 'teacher' = 'student') {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email,
          username,
          role,
        }
      ])

    if (error) {
      // If table doesn't exist, just return success without creating profile
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('Profiles table not found, skipping profile creation')
        return { id: userId, email, username, role }
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createProfile:', error)
    // Return basic profile even if creation fails
    return { id: userId, email, username, role }
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, just return the updates
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('Profiles table not found, skipping profile update')
        return { id: userId, ...updates }
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return { id: userId, ...updates }
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      // If table doesn't exist, check user metadata or default to false
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('Profiles table not found, checking user metadata for admin status')
        const user = await getCurrentUser()
        return user?.user_metadata?.role === 'teacher' || false
      }
      console.error('Error checking admin status:', error)
      return false
    }

    return profile.role === 'teacher'
  } catch (error) {
    console.error('Error in isAdmin:', error)
    return false
  }
}
