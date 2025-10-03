import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { paymentId, approve, motive } = await req.json()
    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento é obrigatório' }, { status: 400 })
    }

    // Buscar pagamento
    const paymentRow = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM documentation_user_payment WHERE id = ? LIMIT 1`,
      paymentId
    )
    const payment = paymentRow[0]
    if (!payment) return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })

    const newStatus = approve ? 'Pagamento Aprovado' : 'Pagamento Negado'
    await prisma.$executeRawUnsafe(
      `UPDATE documentation_user_payment SET status = ?, motive = ?, updated_at = NOW() WHERE id = ?`,
      newStatus,
      approve ? null : (motive || 'Pagamento não aprovado'),
      paymentId
    )

    if (approve) {
      const creditsToAdd = parseInt(String(payment.plan_credits || 0), 10) || 0
      const userId = payment.user_id
      if (creditsToAdd > 0 && userId) {
        const current = await prisma.userDocumentationCredit.findUnique({ where: { userId } })
        if (current) {
          await prisma.userDocumentationCredit.update({ where: { userId }, data: { credits: current.credits + creditsToAdd } })
        } else {
          await prisma.userDocumentationCredit.create({ data: { userId, credits: creditsToAdd } })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao aprovar pagamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


