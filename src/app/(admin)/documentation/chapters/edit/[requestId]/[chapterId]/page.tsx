"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface AuthorInputProps {
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
}

function AuthorInput({ value, onChange, onRemove }: AuthorInputProps) {
  return (
    <div className="d-flex align-items-center mb-2">
      <input
        type="text"
        className="form-control me-2"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Nome do autor"
      />
      <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>
        X
      </button>
    </div>
  );
}

export default function EditChapterPage() {
  const router = useRouter();
  const { requestId, chapterId } = useParams();

  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [abstract, setAbstract] = useState("");
  const [pageStart, setPageStart] = useState(1);
  const [pageEnd, setPageEnd] = useState(1);
  const [authors, setAuthors] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Carrega os dados existentes do capítulo
  useEffect(() => {
    if (!requestId || !chapterId) return;

    setLoading(true);
    fetch(`/api/request/${requestId}/chapters/${chapterId}`)
      .then(res => res.json())
      .then(data => {
        console.log("Dados recebidos do backend:", data);
        if (data.error) {
          console.error("Erro ao carregar capítulo:", data.error);
          return;
        }
        setTitle(data.title || "");
        setLink(data.link || "");
        setAbstract(data.abstract || "");
        setPageStart(data.first_page || 1);
        setPageEnd(data.last_page || 1);
        setAuthors(data.authors?.map((a: any) => a.name) || [""]);
      })
      .catch(err => console.error("Erro ao carregar capítulo:", err))
      .finally(() => setLoading(false));
  }, [requestId, chapterId]);

  const addAuthor = () => setAuthors([...authors, ""]);
  const removeAuthor = (i: number) => setAuthors(authors.filter((_, idx) => idx !== i));
  const updateAuthor = (i: number, val: string) =>
    setAuthors(authors.map((a, idx) => (idx === i ? val : a)));

  const handleSaveChapter = async () => {
    setIsSaving(true);

    const payload = {
      title,
      link,
      abstract,
      first_page: pageStart,
      last_page: pageEnd,
      authors: authors.map(a => a.trim()).filter(a => a !== ""),
    };

    try {
      const res = await fetch(`/api/request/${requestId}/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Capítulo atualizado com sucesso!");
        router.push(`/documentation/chapters/list/${requestId}`);
      } else {
        const errorData = await res.json();
        console.error("Erro ao atualizar capítulo:", errorData);
      }
    } catch (err) {
      console.error("Erro ao enviar capítulo:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5">Carregando capítulo...</div>;

  return (
    <div className="container py-4">
      <h2>Editar Capítulo</h2>

      <div className="mb-3">
        <label className="form-label">Título do capítulo:</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Link do capítulo:</label>
        <input
          type="text"
          className="form-control"
          value={link}
          onChange={e => setLink(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Abstract:</label>
        <textarea
          className="form-control"
          rows={4}
          value={abstract}
          onChange={e => setAbstract(e.target.value)}
        />
      </div>

      <div className="row mb-3">
        <div className="col-6">
          <label className="form-label">Página inicial:</label>
          <input
            type="number"
            className="form-control"
            value={pageStart}
            onChange={e => setPageStart(Number(e.target.value))}
            min={1}
            required
          />
        </div>
        <div className="col-6">
          <label className="form-label">Página final:</label>
          <input
            type="number"
            className="form-control"
            value={pageEnd}
            onChange={e => setPageEnd(Number(e.target.value))}
            min={pageStart}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <h5>Autores:</h5>
        {authors.map((a, i) => (
          <AuthorInput
            key={i}
            value={a}
            onChange={val => updateAuthor(i, val)}
            onRemove={() => removeAuthor(i)}
          />
        ))}
        <button type="button" className="btn btn-primary mt-2" onClick={addAuthor}>
          + Novo autor
        </button>
      </div>

      <div className="mb-3 d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={() => router.push(`/documentation/chapters/list/${requestId}`)}
        >
          Voltar
        </button>
        <button
          type="button"
          className="btn btn-success mb-3 ms-2"
          onClick={handleSaveChapter}
          disabled={isSaving}
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
