import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { readdir, readFile } from 'fs/promises'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const requestId = params.id
    const folder = path.join(process.cwd(), 'public', 'uploads', 'documentation', 'payment-proofs', requestId)
    let files: string[] = []
    try {
      files = await readdir(folder)
    } catch {
      files = []
    }
    const proofs = files
      .filter((f) => f !== 'plan.json')
      .map((f) => `/uploads/documentation/payment-proofs/${requestId}/${f}`)

    // attach plan info if available
    let plan: any = null
    try {
      const planBuf = await readFile(path.join(folder, 'plan.json'))
      plan = JSON.parse(planBuf.toString())
    } catch {}

    return NextResponse.json({ proofs, plan })
  } catch (error) {
    console.error('Erro ao listar comprovantes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


