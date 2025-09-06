"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
// import WizardLayout from "../../components/WizardLayout";

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

export default function EditRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId; // ID da documentação

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [edition, setEdition] = useState(1);
  const [isbn, setIsbn] = useState("");
  const [link, setLink] = useState("");
  const [abstract, setAbstract] = useState("");
  const [contributors, setContributors] = useState([""]);
  const [loading, setLoading] = useState(true);

  // Carrega os dados existentes da documentação
  useEffect(() => {
    if (!requestId) return;

    fetch(`/api/request/${requestId}`)
      .then(res => res.json())
      .then(data => {
        setTitle(data.title);
        setCompany(data.company);
        setEdition(data.edition);
        setIsbn(data.isbn ?? "");
        setLink(data.link);
        setAbstract(data.abstract);
        setContributors(data.contributors?.map((c: any) => c.name) || [""]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar documentação:", err);
        setLoading(false);
      });
  }, [requestId]);

  // Função para formatar ISBN automaticamente
  const formatIsbn = (value: string) => {
    // remove tudo que não for número
    let numbers = value.replace(/\D/g, '');

    // aplica os hífens no padrão 978-65-6029-269-7
    return numbers
      .replace(/^(\d{3})(\d)/, "$1-$2")
      .replace(/^(\d{3}-\d{2})(\d)/, "$1-$2")
      .replace(/^(\d{3}-\d{2}-\d{4})(\d)/, "$1-$2")
      .replace(/^(\d{3}-\d{2}-\d{4}-\d{3})(\d)/, "$1-$2")
      .slice(0, 17); // limita ao tamanho do ISBN-13 formatado
  };

  // Funções auxiliares para colaboradores
  const addContributor = () => setContributors([...contributors, ""]);
  const removeContributor = (i: number) =>
    setContributors(contributors.filter((_, idx) => idx !== i));
  const updateContributor = (i: number, val: string) =>
    setContributors(contributors.map((c, idx) => (idx === i ? val : c)));

  // Envio do formulário
  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        company,
        edition,
        isbn,
        link,
        abstract,
        contributors: contributors.filter(c => c.trim() !== ""),
      };

      const res = await fetch(`/api/request/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/documentation"); // volta para lista
      } else {
        const errData = await res.json();
        console.error("Erro ao atualizar documentação:", errData);
      }
    } catch (err) {
      console.error("Erro ao atualizar documentação:", err);
    }
  };

  if (loading) return <div className="text-center py-5">Carregando...</div>;

  return (
    <div className="container py-4">
      <h2>Editar Publicação</h2>

      {/* Botão Voltar */}


      {/* Formulário */}
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

      <div className="mb-3 ">
        <h5>Organizladores:</h5>
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

      {/* Botão Salvar */}
      <div className="mb-3 d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={() => router.push("/documentation")}
        >
          Voltar
        </button>
        <div className="mb-3">
          <button className="btn btn-success" onClick={handleSubmit}>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}


