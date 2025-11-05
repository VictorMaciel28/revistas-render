"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal, Button, Form } from "react-bootstrap";

interface Request {
  id: string; // UUID
  title: string;
  company: string;
  edition: number;
  isbn: string | null;
  created_at: string;
  status?: number;
  statusName?: string | null;
  price?: any;
}

// Removed credit-based payment structures

export default function RequestList() {
  const router = useRouter();
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // confirm envio (sem créditos)
  const [showAwaitingPaymentModal, setShowAwaitingPaymentModal] = useState(false); // modal vazio para pagamento
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [paymentPrice, setPaymentPrice] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/request/list");
      const data = await res.json();
      console.log("Requests:", data);
      setRequests(data);
    } catch (err) {
      console.error("Erro ao buscar requests:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir?")) return;
    try {
      setLoading(true); // começa o loading
      const res = await fetch(`/api/request/${id}/delete/${id}`, { method: "DELETE" });

      if (!res.ok) throw new Error("Erro ao deletar request");

      await fetchRequests(); // atualiza a lista
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar request");
    } finally {
      setLoading(false); // termina o loading
    }
  }

  async function handlePaymentClick(requestId: string) {
    // Abrir modal simples de confirmação de envio (sem verificação de créditos)
    setSelectedRequestId(requestId);
    setShowPaymentModal(true);
  }

  function openAwaitingPayment(reqId: string) {
    setSelectedRequestId(reqId);
    const req = requests.find(r => r.id === reqId);
    const p = req && req.price != null ? String(req.price) : "";
    setPaymentPrice(p);
    setShowAwaitingPaymentModal(true);
  }

  async function confirmPayment() {
    if (!selectedRequestId) return;
    try {
      // Envio de registro (sem débitos de créditos)
      try {
        const r = await fetch('/api/documentation/crossref-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: selectedRequestId })
        })
        if (!r.ok) {
          const txt = await r.text().catch(() => '')
          console.warn('Falha ao enviar para CrossRef:', txt)
        }
      } catch (e) {
        console.warn('Erro na chamada CrossRef:', e)
      }
      setShowPaymentModal(false);
      setSelectedRequestId(null);
      alert('Registro enviado.');
    } catch (err) {
      console.error(err);
      alert("Erro ao processar envio");
    }
  }
  


  return (
    <div className="container mx-auto p-4 max-w-full">
      {/* Créditos removidos */}

      {/* Tabela com fundo branco */}
      <div className="bg-white rounded shadow-sm">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-dark">
            <tr>
              <th>Título</th>
              <th>Empresa</th>
              <th>Edição</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Data de criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {requests.length ? requests.map(req => (
              <tr key={req.id}>
                <td>{req.title}</td>
                <td>{req.company}</td>
                <td>{req.edition}</td>
                <td>{req.isbn ?? "-"}</td>
                <td>
                  {req.statusName ? (
                    <span className="badge bg-info">{req.statusName}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>{new Date(req.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => router.push(`/documentation/edit/${req.id}`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => router.push(`/documentation/chapters/list/${req.id}`)}
                    >
                      Capítulos
                    </button>
                    {req.statusName === "Aguardando Pagamento" ? (
                      <button
                        className="btn btn-warning btn-sm"
                      onClick={() => { openAwaitingPayment(req.id); }}
                      >
                        Efetuar pagamento
                      </button>
                    ) : (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handlePaymentClick(req.id)}
                      >
                        Efetuar registro
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(req.id)}
                      disabled={loading}
                    >
                      {loading ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Nenhum request encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação de Envio */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar envio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja enviar o registro?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={confirmPayment}>
            Enviar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal de pagamento (Aguardando Pagamento) */}
      <Modal show={showAwaitingPaymentModal} onHide={() => setShowAwaitingPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Efetuar pagamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column gap-3">
            <div>
              <Form.Label>Valor (R$)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={paymentPrice}
                onChange={(e) => setPaymentPrice(e.target.value)}
              />
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={async () => {
                    if (!selectedRequestId) return;
                    const val = Number(paymentPrice);
                    if (!val || Number.isNaN(val) || val <= 0) { alert('Informe um valor válido'); return; }
                    const res = await fetch(`/api/documentation/${selectedRequestId}/price`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ price: val })
                    });
                    if (!res.ok) { alert('Falha ao salvar preço'); return; }
                    await fetchRequests();
                    alert('Preço salvo.');
                  }}
                >Salvar preço</Button>
              </div>
            </div>

            <hr />

            <div>
              <div className="mb-2 fw-bold">Cartão de crédito</div>
              <Form.Group className="mb-2">
                <Form.Label>Número do cartão</Form.Label>
                <Form.Control value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" />
              </Form.Group>
              <div className="d-flex gap-2">
                <Form.Group className="mb-2" style={{ flex: 1 }}>
                  <Form.Label>Nome impresso</Form.Label>
                  <Form.Control value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="Nome completo" />
                </Form.Group>
                <Form.Group className="mb-2" style={{ width: 90 }}>
                  <Form.Label>Mês</Form.Label>
                  <Form.Control value={cardExpMonth} onChange={(e) => setCardExpMonth(e.target.value)} placeholder="MM" />
                </Form.Group>
                <Form.Group className="mb-2" style={{ width: 100 }}>
                  <Form.Label>Ano</Form.Label>
                  <Form.Control value={cardExpYear} onChange={(e) => setCardExpYear(e.target.value)} placeholder="YYYY" />
                </Form.Group>
                <Form.Group className="mb-2" style={{ width: 100 }}>
                  <Form.Label>CVV</Form.Label>
                  <Form.Control value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="CVV" />
                </Form.Group>
              </div>
              <div className="d-flex gap-2">
                <Form.Group className="mb-2" style={{ flex: 1 }}>
                  <Form.Label>Email do pagador</Form.Label>
                  <Form.Control value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} placeholder="email@exemplo.com" />
                </Form.Group>
                <Form.Group className="mb-2" style={{ flex: 1 }}>
                  <Form.Label>Nome do pagador</Form.Label>
                  <Form.Control value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Nome do pagador" />
                </Form.Group>
              </div>
              <div className="mt-2">
                <Button
                  disabled={isPaying}
                  onClick={async () => {
                    if (!selectedRequestId) return;
                    const val = Number(paymentPrice);
                    if (!val || Number.isNaN(val) || val <= 0) { alert('Informe um valor válido'); return; }
                    setIsPaying(true);
                    try {
                      // In a real integration, obtain sessionId and tokenize the card via PagSeguro JS
                      // Here we call our sandbox backend to simulate a charge
                      const res = await fetch('/api/pagseguro/charge', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          documentationId: selectedRequestId,
                          paymentMethod: 'credit_card',
                          amount: val,
                          payer: { email: payerEmail, name: payerName },
                        })
                      });
                      const j = await res.json();
                      if (!res.ok || !j.success) { throw new Error(j.error || 'Falha no pagamento'); }
                      alert('Pagamento aprovado! Transação: ' + j.transactionId);
                      setShowAwaitingPaymentModal(false);
                    } catch (e: any) {
                      alert(e?.message || 'Erro no pagamento');
                    } finally {
                      setIsPaying(false);
                    }
                  }}
                >{isPaying ? 'Processando...' : 'Pagar com cartão'}</Button>
              </div>
            </div>

            <hr />

            <div>
              <div className="mb-2 fw-bold">Pix (sandbox)</div>
              <Button variant="outline-primary" disabled>
                Em breve (requer credenciais OAuth do PagSeguro)
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAwaitingPaymentModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
