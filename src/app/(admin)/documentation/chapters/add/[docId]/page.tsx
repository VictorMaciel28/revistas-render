"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import WizardLayout from "../../../components/WizardLayout";
import { useSearchParams } from "next/navigation";

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

interface ChapterData {
  title: string;
  pageStart: number;
  pageEnd: number;
  authors: string[];
  link: string;
  abstract: string;
}

export default function AddChapterPage() {
  const searchParams = useSearchParams();
  const fromWizard = searchParams.get("fromWizard") === "true";
  const params = useParams();
  const requestId = params.docId;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [pageStart, setPageStart] = useState(1);
  const [pageEnd, setPageEnd] = useState(1);
  const [authors, setAuthors] = useState([""]);
  const [link, setLink] = useState("");
  const [abstract, setAbstract] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addAuthor = () => setAuthors([...authors, ""]);
  const removeAuthor = (i: number) => setAuthors(authors.filter((_, idx) => idx !== i));
  const updateAuthor = (i: number, val: string) =>
    setAuthors(authors.map((a, idx) => (idx === i ? val : a)));

  const isNextDisabled = !title || authors.every(a => a.trim() === "");

  const handleSaveChapter = async () => {
  setIsSaving(true);

  const chapterData: ChapterData = { title, pageStart, pageEnd, authors, link, abstract };

  try {
    // Monta o payload para o backend/Prisma
    const payload = {
      title: chapterData.title,
      link: chapterData.link,
      abstract: chapterData.abstract,
      first_page: chapterData.pageStart,
      last_page: chapterData.pageEnd,
      authors: chapterData.authors       // array de strings
    };

    // Chama a rota POST correta com requestId na URL
    const res = await fetch(`/api/request/${requestId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const newChapter = await res.json();
      console.log("Capítulo criado:", newChapter);

      // Mostra alerta
      alert("Capítulo salvo com sucesso! Continue cadastrando ou retorne para solicitar o registro.");
      router.refresh();
      setTitle("");
      setLink("");
      setAbstract("");
      setPageStart(1);
      setPageEnd(1);
      setAuthors([""]);

      // Redireciona automaticamente para a listagem de capítulos
      router.push(`/documentation/chapters/add/${requestId}`) ;
    } else {
      const errorData = await res.json();
      console.error("Erro ao criar capítulo:", errorData);
    }

  } catch (err) {
    console.error("Erro ao enviar capítulo:", err);
  } finally {
    setIsSaving(false);
  }
};

const handleNextStep = async () => {
  // Salva capítulo antes de avançar
  await handleSaveChapter();

  // Depois do save, navega para o próximo step
  router.push(`/documentation/chapters/list/${requestId}?fromWizard=true`);
};



  return (
    <WizardLayout
      title="Incluir capítulo"
      fromWizard={fromWizard} // habilita Next/Back apenas no wizard
      onNext={fromWizard ? handleNextStep : undefined} // Next só se wizard
      disableNext={isNextDisabled || isSaving}
      nextLabel="Salvar capítulo"
      customActions={
    !fromWizard && (
      <button
        type="button"
        className="btn btn-success"
        onClick={handleSaveChapter}
        disabled={isNextDisabled || isSaving}
      >
        Salvar capítulo
      </button>
    )
  }
      // customActions={
      //   <button
      //     type="button"
      //     className="btn btn-success"
      //     onClick={handleSaveChapter}
      //     disabled={isNextDisabled || isSaving}
      //   >
      //     Salvar capítulo
      //   </button>
      // }
    >
      {/* Form fields */}
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
    </WizardLayout>
  );
}
