"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, Button, Alert } from "react-bootstrap";

type Doc = {
  paymentId: number;
  userId: number;
  proofPath: string;
  created_at: string;
  plan?: { credits: number; price: number } | null;
};

export default function AwaitingApprovalList() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofs, setProofs] = useState<string[]>([]);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/documentation/awaiting-approval');
      const data = await res.json();
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openProof(doc: Doc) {
    setSelectedProofUrl(doc.proofPath);
    setShowProofModal(true);
  }

  async function approve(d: Doc) {
    if (!confirm('Confirmar aprovação do pagamento?')) return;
    if (!d || !('paymentId' in d)) return;
    const res = await fetch('/api/documentation/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: d.paymentId, approve: true })
    })
    if (res.ok) {
      await load();
      setShowProofModal(false);
      alert('Pagamento aprovado e créditos adicionados.');
    } else {
      alert('Erro ao aprovar pagamento');
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-full">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3>Pagamentos Aguardando Aprovação</h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={load} disabled={loading}>
          {loading ? 'Atualizando...' : 'Recarregar'}
        </button>
      </div>

      <div className="bg-white rounded shadow-sm">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>Usuário</th>
              <th>Enviado</th>
              <th>Plano</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {docs.length ? docs.map((d, idx) => (
              <tr key={`${d.paymentId}-${idx}`}>
                <td>#{d.userId}</td>
                <td>{new Date(d.created_at).toLocaleDateString()}</td>
                <td>
                  {d.plan ? (
                    <span className="badge bg-success">
                      {d.plan.credits} créditos - R$ {d.plan.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => openProof(d)}>
                      Ver Comprovante
                    </button>
                    <button className="btn btn-sm btn-success" onClick={() => approve(d)}>
                      Aprovar
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-4">Nenhuma documentação aguardando aprovação.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    
  
      <Modal show={showProofModal} onHide={() => setShowProofModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Comprovante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selectedProofUrl ? (
            <Alert variant="warning" className="mb-0">Nenhum comprovante encontrado.</Alert>
          ) : (
            <div className="border rounded p-2">
              {selectedProofUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe src={selectedProofUrl} style={{ width: '100%', height: 480 }} />
              ) : (
                <img src={selectedProofUrl} alt="Comprovante" style={{ maxWidth: '100%' }} />
              )}
              <div className="mt-2"><a href={selectedProofUrl} target="_blank" rel="noreferrer">Abrir em nova aba</a></div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProofModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}


