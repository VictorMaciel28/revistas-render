"use client";
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function ProofViewer() {
  const params = useParams()
  const requestId = params?.id as string
  const [proofs, setProofs] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/documentation/${requestId}/proofs`)
      const data = await res.json()
      setProofs(data.proofs || [])
    }
    if (requestId) load()
  }, [requestId])

  return (
    <div className="container mx-auto p-4 max-w-full">
      <h3>Comprovantes enviados</h3>
      {!proofs.length ? (
        <div className="text-muted">Nenhum comprovante encontrado.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {proofs.map((p) => (
            <div key={p} className="border rounded p-2">
              {p.toLowerCase().endsWith('.pdf') ? (
                <a href={p} target="_blank" rel="noreferrer">Abrir PDF</a>
              ) : (
                <img src={p} alt="Comprovante" style={{ maxWidth: 480 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


