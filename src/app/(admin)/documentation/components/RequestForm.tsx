"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "../components/WizardLayout";

interface RequestFormProps {
  requestId?: string;
}

interface ContributorInputProps {
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
}

function ContributorInput({ value, onChange, onRemove }: ContributorInputProps) {
  return (
    <div className="d-flex align-items-center mb-2">
      <input
        type="text"
        className="form-control me-2"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Nome do organizador por extenso"
      />
      <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>
        X
      </button>
    </div>
  );
}

export default function RequestForm({ requestId }: RequestFormProps) {
  const router = useRouter();

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [edition, setEdition] = useState(1);
  const [isbn, setIsbn] = useState("");
  const [link, setLink] = useState("");
  const [abstract, setAbstract] = useState("");
  const [contributors, setContributors] = useState([""]);

  // carrega dados já existentes
  useEffect(() => {
    if (!requestId) return;
    fetch(`/api/request/get/${requestId}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setCompany(data.company);
        setEdition(data.edition);
        setIsbn(data.isbn ?? "");
        setLink(data.link);
        setAbstract(data.abstract);
        setContributors(data.contributors?.map((c: any) => c.name) || [""]);
      });
  }, [requestId]);

  // Função para formatar ISBN automaticamente
  const formatIsbn = (value: string) => {
    let numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/^(\d{3})(\d)/, "$1-$2")
      .replace(/^(\d{3}-\d{2})(\d)/, "$1-$2")
      .replace(/^(\d{3}-\d{2}-\d{4})(\d)/, "$1-$2")
      .replace(/^(\d{3}-\d{2}-\d{4}-\d{3})(\d)/, "$1-$2")
      .slice(0, 17);
  };

  // Funções auxiliares para contribuidores
  const addContributor = () => setContributors([...contributors, ""]);
  const removeContributor = (i: number) =>
    setContributors(contributors.filter((_, idx) => idx !== i));
  const updateContributor = (i: number, val: string) =>
    setContributors(contributors.map((c, idx) => (idx === i ? val : c)));

  // Envio do formulário (Step 1 pro Step 2)
  const handleNext = async () => {
    try {
      const resSession = await fetch("/api/session");
      const data = await resSession.json();
      const id_depositor = Number(data.user?.id);

      if (!id_depositor) {
        console.error("Usuário não logado");
        return;
      }

      const payload = {
        id_depositor,
        title,
        company,
        edition,
        isbn,
        link,
        abstract,
        contributors: contributors
          .filter(c => c.trim() !== "")
          .map(c => ({ name: c })),
      };

      const url = requestId
        ? `/api/request/update/${requestId}`
        : "/api/request/create";
      const method = requestId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newRequest = await res.json();
        router.push(`/documentation/chapters/add/${newRequest.id}?fromWizard=true`);
      } else {
        const errData = await res.json();
        console.error("Erro ao salvar request:", errData);
      }
    } catch (err) {
      console.error("Erro ao enviar request:", err);
    }
  };

  return (
    <WizardLayout
      title={requestId ? "Editar Publicação" : "Formulário de Registro de Publicação"}
      onBack={requestId ? () => router.back() : undefined}
      onNext={handleNext}
      nextLabel="Próxima etapa >"
      fromWizard={true}
    >
      {/* Conteúdo do formulário */}
      <div className="mb-3">
        <label className="form-label">Título da publicação:</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Editora organizadora:</label>
          <input
            type="text"
            className="form-control"
            value={company}
            onChange={e => setCompany(e.target.value)}
            required
          />
        </div>
        <div className="col-3">
          <label className="form-label">Edição (0-100):</label>
          <input
            type="number"
            className="form-control"
            value={edition}
            onChange={e => setEdition(Number(e.target.value))}
            min={0}
            max={100}
            required
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <label className="form-label">ISBN (opcional):</label>
          <input
            type="text"
            className="form-control"
            placeholder="000-00-0000-000-0"
            value={isbn}
            onChange={(e) => setIsbn(formatIsbn(e.target.value))}
          />
        </div>
        <div className="col">
          <label className="form-label">Link da publicação:</label>
          <input
            type="text"
            className="form-control"
            value={link}
            onChange={e => setLink(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Abstract:</label>
        <textarea
          className="form-control"
          rows={4}
          value={abstract}
          onChange={e => setAbstract(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <h5>Organizadores:</h5>
        {contributors.map((c, i) => (
          <ContributorInput
            key={i}
            value={c}
            onChange={val => updateContributor(i, val)}
            onRemove={() => removeContributor(i)}
          />
        ))}
        <button type="button" className="btn btn-primary mt-2" onClick={addContributor}>
          + Novo colaborador
        </button>
      </div>
    </WizardLayout>
  );
}