"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WizardLayout from "../../../components/WizardLayout";

interface Chapter {
  id: string;
  title: string;
  abstract: string;
  first_page: number;
  last_page: number;
  created_at: string;
  authors: string[];
  link: string;
}

export default function ChapterListStep() {
  const params = useParams();
  const requestId = params.docId;
  const router = useRouter();

  const searchParams = new URLSearchParams(window.location.search);
  const fromWizard = searchParams.get("fromWizard") === "true";

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestLink, setRequestLink] = useState("");

  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch(`/api/request/${requestId}/chapters`);
        if (!res.ok) throw new Error("Erro ao carregar capítulos");
        const data = await res.json();
        console.log(data);
        

        setRequestTitle(data.request_title);
        setRequestLink(data.request_link);
        setChapters(data.chapters || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchChapters();
  }, [requestId]);

  // Função para redirecionar quando não houver capítulos
  const handleEmptyRedirect = () => {
    router.push("/solicitations"); // nova tab de Solicitações de registro
  };

  return (
    <WizardLayout
      title="Listagem de Capítulos"
      fromWizard={fromWizard} // ativa botões apenas se wizard
      onBack={fromWizard ? () => router.push(`/documentation/chapters/add/${requestId}?fromWizard=true`) : undefined}
      customActions={
        <button
          className="btn btn-success ms-2"
          onClick={() => router.push(`/documentation/chapters/add/${requestId}`)}
        >
          Adicionar capítulo
        </button>
      }
    >
      <div className="accordion" id="chaptersAccordion">
        <div className="mb-4">
          <p>
            <b>Informações da publicação:</b> <br />
            Título: {requestTitle} <br />
            Link: <a href={requestLink}>{requestLink}</a>
          </p>
        </div>

        {chapters.length > 0 ? (
          <>
          {chapters.map((chapter, idx) => (
            <div className="card mb-2" key={chapter.id}>
              <h2 className="accordion-header" id={`heading${idx}`}>
                <h6 className="mb-0 font-weight-bold">
                  <button
                    className={`accordion-button ${idx !== 0 ? "collapsed" : ""}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${idx}`}
                    aria-expanded={idx === 0 ? "true" : "false"}
                    aria-controls={`collapse${idx}`}
                  >
                    {chapter.title}
                  </button>
                </h6>
              </h2>
              <div
                  id={`collapse${idx}`}
                  className={`accordion-collapse collapse ${idx === 0 ? "show" : ""}`}
                  aria-labelledby={`heading${idx}`}
                >
                <div className="card-body">
                  <p><b>Link do capítulo:</b> <a href={chapter.link}>{chapter.link}</a></p>
                  <p><b>Introdução:</b> {chapter.abstract}</p>
                  <p><b>Primeira página:</b> {chapter.first_page}</p>
                  <p><b>Última página:</b> {chapter.last_page}</p>
                  <p><b>Data de publicação:</b> {new Date(chapter.created_at).toLocaleString()}</p>
                  <p><b>Autores:</b></p>
                  <ul>
                    {chapter.authors.map((author, i) => (
                      <li key={i}>{author}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary mt-2"
                    onClick={() => router.push(`/documentation/chapters/edit/${requestId}/${chapter.id}`)}
                  >
                    Editar capítulo
                 </button>   
                </div>
              </div>
            </div>
          ))}
          {fromWizard && (
            <div className="mt-4 text-center">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/documentation")}
              >
                Voltar para Documentações
              </button>
            </div>
            
          )}
        </>
        ) : (
          <div className="text-center">
            <p>Essa publicação não possui capítulos. Exporte o XML para conferir suas informações e enviar ao CROSSREF.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={handleEmptyRedirect}
            >
              Ir para Solicitações de registro
            </button>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}
  