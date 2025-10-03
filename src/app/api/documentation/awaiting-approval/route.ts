import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    // Buscar pagamentos aguardando aprovação na nova tabela
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT p.id as paymentId, p.user_id as userId, p.proof_path as proofPath,
              p.plan_credits as planCredits, p.plan_price as planPrice, p.status, p.motive,
              p.created_at
       FROM documentation_user_payment p
       WHERE p.status = 'Aguardando Aprovação'
       ORDER BY p.created_at DESC`
    )

    // Opcionalmente ler plan.json para confirmar exibição (não obrigatório pois temos colunas plan_*)
    const withPlan = await Promise.all(rows.map(async (r) => {
      return { ...r, plan: { credits: r.planCredits, price: Number(r.planPrice) } }
    }))

    return NextResponse.json(withPlan)
  } catch (error) {
    console.error('Erro ao listar aguardando aprovação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


