"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Request {
  id: string; // UUID
  title: string;
  company: string;
  edition: number;
  isbn: string | null;
  created_at: string;
}

export default function RequestList() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

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


  return (
    <div className="container mx-auto p-4 max-w-full">
      <table className="table-fixed w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Código</th>
            <th className="border p-2">Título</th>
            <th className="border p-2">Empresa</th>
            <th className="border p-2">Edição</th>
            <th className="border p-2">ISBN</th>
            <th className="border p-2">Data de criação</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {requests.length ? requests.map(req => (
            <tr key={req.id}>
              <td className="border p-2">{req.id}</td>
              <td className="border p-2">{req.title}</td>
              <td className="border p-2">{req.company}</td>
              <td className="border p-2">{req.edition}</td>
              <td className="border p-2">{req.isbn ?? "-"}</td>
              <td className="border p-2">{new Date(req.created_at).toLocaleDateString()}</td>
              <td className="border p-2">
                <div className="d-flex flex-wrap" style={{ gap: "8px", minWidth: "500px" }}>
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
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(req.id)}
                    disabled={loading}
                  >
                    {loading ? "Excluindo..." : "Excluir"}
                  </button>

                  

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => router.push(`/documentation/chapters/list/${req.id}`)}
                  >
                    Capítulos
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => router.push(`/documentation/chapters/list/${req.id}`)}
                  >
                    Enviar ao crossref
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="text-center border p-2">
                Nenhum request encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
