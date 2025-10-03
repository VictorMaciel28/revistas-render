import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { options } from '../../auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) return NextResponse.json(null)
    const userId = parseInt(session.user.id)

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT status, motive, plan_credits as planCredits, plan_price as planPrice
       FROM documentation_user_payment
       WHERE user_id = ? AND status = 'Aguardando Aprovação'
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1`,
      userId
    )
    const row = rows[0] || null
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json(null)
  }
}


