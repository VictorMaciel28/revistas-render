import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This route simulates a PagSeguro transparent checkout charge in sandbox.
// For real integration, replace with PagSeguro API calls using your credentials.

export async function POST(req: NextRequest) {
  try {
    const { documentationId, paymentMethod, cardToken, hash, payer, amount } = await req.json()
    if (!documentationId) return NextResponse.json({ error: 'documentationId é obrigatório' }, { status: 400 })
    if (!paymentMethod) return NextResponse.json({ error: 'paymentMethod é obrigatório' }, { status: 400 })

    // Resolve price: prefer explicit amount, fallback to documentation.price
    let value = Number(amount)
    if (!value || Number.isNaN(value) || value <= 0) {
      const row = await prisma.$queryRawUnsafe<any[]>(`SELECT price FROM DOCUMENTATION WHERE id = ? LIMIT 1`, documentationId)
      const price = row?.[0]?.price
      value = Number(price || 0)
    }
    if (!value || Number.isNaN(value) || value <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    // Here you would call PagSeguro APIs
    // For sandbox demo, return a fake approved transaction id
    const fakeTransactionId = `PS_SANDBOX_${Math.random().toString(36).slice(2, 10)}`

    return NextResponse.json({
      success: true,
      transactionId: fakeTransactionId,
      status: 'PAID',
      amount: value,
      paymentMethod,
    })
  } catch (error) {
    console.error('Erro ao processar pagamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


