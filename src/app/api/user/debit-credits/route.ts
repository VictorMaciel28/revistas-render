import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { options } from '../../auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'

// POST - Debitar créditos do usuário de forma atômica
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const { amount } = await req.json()
    const userId = parseInt(session.user.id)

    const debit = parseInt(String(amount || 0), 10)
    if (!debit || debit <= 0) {
      return NextResponse.json({ error: 'Quantidade para débito inválida' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      let userCredits = await tx.userDocumentationCredit.findUnique({ where: { userId } })
      if (!userCredits) {
        userCredits = await tx.userDocumentationCredit.create({ data: { userId, credits: 0 } })
      }

      if (userCredits.credits < debit) {
        throw new Error('Créditos insuficientes')
      }

      const updated = await tx.userDocumentationCredit.update({
        where: { userId },
        data: { credits: userCredits.credits - debit },
      })
      return updated
    })

    return NextResponse.json({ ok: true, credits: result.credits })
  } catch (error: any) {
    const msg = error?.message || 'Erro ao debitar créditos'
    const status = msg === 'Créditos insuficientes' ? 400 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}


