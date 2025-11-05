import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    const email = process.env.PAGSEGURO_EMAIL
    const token = process.env.PAGSEGURO_TOKEN
    const env = (process.env.PAGSEGURO_ENV || 'sandbox').toLowerCase()
    if (!email || !token) {
      return NextResponse.json({ error: 'PAGSEGURO_EMAIL/PAGSEGURO_TOKEN não configurados' }, { status: 500 })
    }
    const host = env === 'production' ? 'ws.pagseguro.uol.com.br' : 'ws.sandbox.pagseguro.uol.com.br'
    const url = `https://${host}/v2/sessions`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams({ email, token })
    })
    const txt = await res.text()
    if (!res.ok) {
      console.error('PagSeguro session error:', txt)
      return NextResponse.json({ error: 'Falha ao obter sessão do PagSeguro' }, { status: 500 })
    }
    const match = txt.match(/<id>([^<]+)<\/id>/i)
    const sessionId = match ? match[1] : ''
    if (!sessionId) {
      console.error('PagSeguro session parse error:', txt)
      return NextResponse.json({ error: 'Falha ao interpretar sessão do PagSeguro' }, { status: 500 })
    }
    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error('Erro ao criar sessão PagSeguro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


