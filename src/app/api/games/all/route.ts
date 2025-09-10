import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Use the existing supabase client instance
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminCheck = await isAdmin(user.id)
    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: games, error } = await supabase
      .from('games')
      .select(`
        *,
        player1:profiles!games_player1_id_fkey (username),
        player2:profiles!games_player2_id_fkey (username)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching games:', error)
      return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
    }

    return NextResponse.json(games)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
