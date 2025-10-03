"use client";
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ApprovePage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params?.id as string
  const [loading, setLoading] = useState(false)

  async function approve() {
    setLoading(true)
    try {
      const res = await fetch('/api/documentation/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })
      if (!res.ok) throw new Error('Falha ao aprovar')
      alert('Pagamento aprovado!')
      router.push('/documentation/awaiting-approval')
    } catch (e) {
      alert('Erro ao aprovar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-full">
      <h3>Confirmar Aprovação</h3>
      <p>Deseja aprovar o pagamento da documentação <code>{requestId}</code>?</p>
      <button className="btn btn-success" onClick={approve} disabled={loading}>
        {loading ? 'Aprovando...' : 'Aprovar Pagamento'}
      </button>
    </div>
  )
}


