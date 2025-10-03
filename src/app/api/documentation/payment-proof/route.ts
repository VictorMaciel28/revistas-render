import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { options } from '../../auth/[...nextauth]/options'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const formData = await req.formData()
    const proof = formData.get('proof') as File | null
    const requestId = formData.get('requestId')?.toString() || ''
    const planCreditsRaw = formData.get('planCredits')?.toString() || ''
    const planPriceRaw = formData.get('planPrice')?.toString() || ''
    if (!proof) {
      return NextResponse.json({ error: 'Arquivo do comprovante é obrigatório' }, { status: 400 })
    }
    const planCredits = parseInt(planCreditsRaw || '0', 10)
    const planPrice = parseFloat(planPriceRaw || '0')
    if (!planCredits || !planPrice) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)
    // requestId é opcional; pagamentos são vinculados ao usuário
    const folder = path.join(process.cwd(), 'public', 'uploads', 'documentation', 'payment-proofs', (requestId || String(userId)))
    await mkdir(folder, { recursive: true })

    const bytes = await proof.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = proof.name.replace(/\s+/g, '_')
    const filename = `${Date.now()}-${safeName}`
    const filePath = path.join(folder, filename)
    await writeFile(filePath, new Uint8Array(buffer))

    const proofUrl = `/uploads/documentation/payment-proofs/${requestId || String(userId)}/${filename}`

    // Persist minimal plan info as a sidecar json (para visualização)
    const planInfo = { credits: planCredits, price: planPrice }
    const planJsonPath = path.join(folder, 'plan.json')
    await writeFile(planJsonPath, Buffer.from(JSON.stringify(planInfo)))

    // Registrar pagamento pendente na tabela documentation_user_payment
    await prisma.$executeRawUnsafe(
      `INSERT INTO documentation_user_payment (user_id, proof_path, plan_credits, plan_price, status, motive, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'Aguardando Aprovação', NULL, NOW(), NOW())`,
      userId,
      proofUrl,
      planCredits,
      planPrice
    )

    return NextResponse.json({ success: true, proofUrl, plan: planInfo })
  } catch (error) {
    console.error('Erro ao enviar comprovante:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


