"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Modal, Button, Alert, Card, Row, Col, Form } from "react-bootstrap";

interface Request {
  id: string; // UUID
  title: string;
  company: string;
  edition: number;
  isbn: string | null;
  created_at: string;
  status?: number;
  statusName?: string | null;
}

interface PaymentCheckResult {
  creditsNeeded: number;
  userCredits: number;
  hasEnoughCredits: boolean;
  creditsShortage: number;
  chaptersCount: number;
  documentation: {
    id: string;
    title: string;
    company: string;
  };
}

export default function RequestList() {
  const router = useRouter();
  const { data: session } = useSession();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<null | { status: string; motive?: string | null; planCredits?: number; planPrice?: number }>(null);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentCheckResult | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [selectedPlanCredits, setSelectedPlanCredits] = useState<number | null>(null);
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchUserCredits();
  }, []);

  async function fetchUserCredits() {
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setUserCredits(data.credits);
        try {
          const p = await fetch('/api/user/last-payment-status');
          if (p.ok) {
            const pj = await p.json();
            setPaymentStatus(pj || null);
          }
        } catch {}
      }
    } catch (err) {
      console.error("Erro ao buscar créditos:", err);
    }
  }

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
    try {
      const res = await fetch("/api/documentation/payment-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId })
      });

      if (!res.ok) throw new Error("Erro ao verificar créditos");

      const data = await res.json();
      setPaymentData(data);
      setSelectedRequestId(requestId);

      if (data.hasEnoughCredits) {
        setShowPaymentModal(true);
      } else {
        setShowRechargeModal(true);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao verificar créditos");
    }
  }

  async function confirmPayment() {
    if (!selectedRequestId || !paymentData) return;

    try {
      // Debitar créditos necessários
      const debitRes = await fetch('/api/user/debit-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentData.creditsNeeded })
      })
      if (!debitRes.ok) {
        const t = await debitRes.text().catch(() => '')
        throw new Error(t || 'Falha ao debitar créditos')
      }
      alert(`Pagamento confirmado! ${paymentData.creditsNeeded} créditos foram debitados.`);
      
      // Atualiza os créditos do usuário
      await fetchUserCredits();
      setShowPaymentModal(false);
      setPaymentData(null);
      setSelectedRequestId(null);

      // Disparo da geração/envio de XML para CrossRef (ambiente de teste)
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
    } catch (err) {
      console.error(err);
      alert("Erro ao processar pagamento");
    }
  }

  function handleRechargePlan(credits: number) {
    const prices = {
      20: 100, // 20 créditos = R$ 100 (R$ 5,00 por crédito)
      50: 237.50, // 50 créditos = R$ 237,50 (R$ 4,75 por crédito)
      100: 450 // 100 créditos = R$ 450 (R$ 4,50 por crédito)
    };

    const price = prices[credits as keyof typeof prices];
    setSelectedPlanCredits(credits);
    setSelectedPlanPrice(price);
    window.open(`https://pagseguro.com.br?credits=${credits}&price=${price}`, '_blank');
  }

  async function handlePaymentProofUpload() {
    if (!paymentProof) {
      alert("Selecione um comprovante de pagamento");
      return;
    }
    if (!selectedPlanCredits || !selectedPlanPrice) {
      alert("Selecione um plano de recarga");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('proof', paymentProof);
      if (selectedRequestId) {
        formData.append('requestId', selectedRequestId);
      }
      formData.append('planCredits', String(selectedPlanCredits));
      formData.append('planPrice', String(selectedPlanPrice));

      const res = await fetch('/api/documentation/payment-proof', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Falha no upload' }));
        throw new Error(err.error || 'Erro ao enviar comprovante');
      }

      alert("Comprovante enviado com sucesso! Aguarde a análise.");
      setShowRechargeModal(false);
      setPaymentProof(null);
      setSelectedPlanCredits(null);
      setSelectedPlanPrice(null);
      await fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar comprovante");
    }
  }


  return (
    <div className="container mx-auto p-4 max-w-full">
      {/* Display de Créditos */}
      <div className="mb-4">
        <Alert variant="info" className="d-flex align-items-center justify-content-between">
          <i className="ri-wallet-3-line me-2"></i>
          <div>
            <strong>Créditos Disponíveis: {userCredits}</strong>
            <div className="small text-muted" title="Os créditos são utilizados para pagamento de ebooks (1 crédito) e capítulos (1 crédito cada)">
              <i className="ri-information-line me-1"></i>
              Os créditos são utilizados para pagamento de ebooks (1 crédito) e capítulos (1 crédito cada) <br />
              Atualizar nome da publicação, autores, link e demais informações não consome créditos
            </div>
          </div>
          <div>
            {!paymentStatus ? (
              <Button size="sm" variant="primary" onClick={() => setShowRechargeModal(true)}>Adicionar Crédito</Button>
            ) : (
              <button className="btn btn-link p-0" onClick={() => setShowPaymentStatusModal(true)}>
                Ver status do pagamento
              </button>
            )}
          </div>
        </Alert>
      </div>

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
                      className="btn btn-success btn-sm"
                      onClick={() => router.push(`/documentation/chapters/add/${req.id}`)}
                    >
                      Incluir capítulo
                    </button>
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
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handlePaymentClick(req.id)}
                    >
                      Efetuar registro
                    </button>
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
                <td colSpan={6} className="text-center py-4">
                  Nenhum request encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmação de Pagamento */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Pagamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {paymentData && (
            <div>
              <Alert variant="success" className="d-flex align-items-center">
                <i className="ri-check-line me-2"></i>
                <strong>Créditos suficientes para registro!</strong>
              </Alert>
              
              <Card className="border-0 bg-light">
                <Card.Body className="py-3">
                  <Row>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Documentação:</strong><br/>
                        <span className="text-muted">{paymentData.documentation.title}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Empresa:</strong><br/>
                        <span className="text-muted">{paymentData.documentation.company}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Capítulos:</strong> <span className="badge bg-secondary">{paymentData.chaptersCount}</span>
                      </div>
                      <div className="mb-2">
                        <strong>Créditos necessários:</strong> <span className="badge bg-warning">{paymentData.creditsNeeded}</span>
                        <small className="text-muted d-block">(1 ebook + {paymentData.chaptersCount} capítulos)</small>
                      </div>
                    </Col>
                  </Row>
                  
                  <hr className="my-3"/>
                  
                  <Row className="text-center">
                    <Col md={4}>
                      <div className="border-end">
                        <strong>Seus Créditos</strong><br/>
                        <span className="fs-4 text-primary">{paymentData.userCredits}</span>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="border-end">
                        <strong>Será Debitado</strong><br/>
                        <span className="fs-4 text-warning">-{paymentData.creditsNeeded}</span>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div>
                        <strong>Restará</strong><br/>
                        <span className="fs-4 text-success">{paymentData.userCredits - paymentData.creditsNeeded}</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={confirmPayment}>
            Enviar Registro
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Status de Pagamento */}
      <Modal show={showPaymentStatusModal} onHide={() => setShowPaymentStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Status do pagamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!paymentStatus ? (
            <div className="text-muted">Nenhuma solicitação de pagamento encontrada.</div>
          ) : (
            <div>
              <p><strong>Status:</strong> {paymentStatus.status}</p>
              {paymentStatus.motive ? (<p><strong>Motivo:</strong> {paymentStatus.motive}</p>) : null}
              {paymentStatus.planCredits ? (
                <p>
                  <strong>Plano:</strong> {paymentStatus.planCredits} créditos
                  {paymentStatus.planPrice != null && !isNaN(Number(paymentStatus.planPrice))
                    ? ` - R$ ${Number(paymentStatus.planPrice).toFixed(2)}`
                    : ''}
                </p>
              ) : null}
              <hr />
              <p className="text-muted mb-0">A análise pode levar até 1 dia útil. Se foi reprovado, provavelmente o envio foi um agendamento e não um comprovante.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentStatusModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Recarga de Créditos */}
      <Modal show={showRechargeModal} onHide={() => setShowRechargeModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Recarregar Créditos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {/* Informações compactas, mostradas apenas quando houver contexto de uma documentação */}
            {paymentData ? (
              <Card className="border-0 bg-light mb-4">
                <Card.Body className="py-3">
                  <Row className="text-center">
                    <Col md={4}>
                      <div className="border-end">
                        <strong>Você tem</strong><br/>
                        <span className="fs-4 text-primary">{paymentData.userCredits}</span>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="border-end">
                        <strong>Você precisa</strong><br/>
                        <span className="fs-4 text-warning">{paymentData.creditsNeeded}</span>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div>
                        <strong>Faltam</strong><br/>
                        <span className="fs-4 text-danger">{paymentData.creditsShortage}</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ) : null}

            <h5 className="mb-3 text-center">Escolha um plano de recarga:</h5>

            <Row className="mb-4">
              <Col md={4}>
                <Card className="text-center h-100 border-0 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <h4 className="text-primary">20 Créditos</h4>
                      <div className="text-muted small">R$ 5,00 por crédito</div>
                      <h3 className="text-primary mb-0">R$ 100,00</h3>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => handleRechargePlan(20)}
                        className="w-100"
                      >
                        <i className="ri-shopping-cart-line me-1"></i>
                        Recarregar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center h-100 border-success shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <h4 className="text-success">50 Créditos</h4>
                      <div className="text-decoration-line-through text-muted small">R$ 250,00</div>
                      <div className="text-muted small">R$ 4,75 por crédito</div>
                      <h3 className="text-success mb-0">R$ 237,50</h3>
                      <div className="small text-success">💰 Economia: R$ 12,50</div>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="success" 
                        onClick={() => handleRechargePlan(50)}
                        className="w-100"
                      >
                        <i className="ri-shopping-cart-line me-1"></i>
                        Recarregar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center h-100 border-warning shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <h4 className="text-warning">100 Créditos</h4>
                      <div className="text-decoration-line-through text-muted small">R$ 500,00</div>
                      <div className="text-muted small">R$ 4,50 por crédito</div>
                      <h3 className="text-warning mb-0">R$ 450,00</h3>
                      <div className="small text-warning">💰 Economia: R$ 50,00</div>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="warning" 
                        onClick={() => handleRechargePlan(100)}
                        className="w-100"
                      >
                        <i className="ri-shopping-cart-line me-1"></i>
                        Recarregar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <hr />

            <Alert variant="success" className="d-flex align-items-center justify-content-center mb-3">
              <i className="ri-information-line me-2"></i>
              <strong>Após realizar o pagamento, envie o comprovante para análise e liberação dos créditos</strong>
            </Alert>

            <Row className="align-items-end g-3 mb-3">
              <Col md={6}>
                <div className="d-flex flex-column">
                  <label className="mb-2"><strong>Plano escolhido</strong></label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Select
                      value={selectedPlanCredits ?? ''}
                      onChange={(e) => {
                        const c = parseInt(e.target.value || '0');
                        if (!c) { setSelectedPlanCredits(null); setSelectedPlanPrice(null); return; }
                        const prices: Record<number, number> = { 20: 100, 50: 237.5, 100: 450 };
                        setSelectedPlanCredits(c);
                        setSelectedPlanPrice(prices[c]);
                      }}
                    >
                      <option value="">Selecione um plano</option>
                      <option value="20">20 créditos - R$ 100,00</option>
                      <option value="50">50 créditos - R$ 237,50</option>
                      <option value="100">100 créditos - R$ 450,00</option>
                    </Form.Select>
                    {selectedPlanCredits ? (
                      <span className="text-muted">+<strong>{selectedPlanCredits}</strong> créditos</span>
                    ) : null}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex flex-column">
                  <label className="mb-2"><strong>Enviar Comprovante de Pagamento</strong></label>
                  <Form.Group>
                    <Form.Control
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        setPaymentProof(target.files?.[0] || null);
                      }}
                    />
                  </Form.Group>
                </div>
              </Col>
            </Row>
            <div className="text-center">
              <Button
                variant="primary"
                onClick={handlePaymentProofUpload}
                disabled={!paymentProof || !selectedPlanCredits}
                size="lg"
              >
                <i className="ri-upload-line me-2"></i>
                Enviar Comprovante
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRechargeModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
