import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { price } = await req.json()
    if (price === undefined || price === null) {
      return NextResponse.json({ error: 'Preço é obrigatório' }, { status: 400 })
    }
    const priceNumber = Number(price)
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    }
    // Using raw SQL to avoid type mismatch until prisma generate is run
    await prisma.$executeRawUnsafe(`UPDATE DOCUMENTATION SET price = ? WHERE id = ?`, priceNumber, params.id)
    return NextResponse.json({ id: params.id, price: priceNumber })
  } catch (error) {
    console.error('Erro ao atualizar preço:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


