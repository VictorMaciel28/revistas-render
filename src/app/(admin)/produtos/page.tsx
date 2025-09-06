"use client";

import { useEffect, useState } from "react";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await fetch(`/api/produtos?q=${encodeURIComponent(busca)}`);
        const data = await response.json();
        if (data.retorno?.produtos) {
          setProdutos(data.retorno.produtos);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    }
    carregarProdutos();
  }, [busca]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Produtos</h1>
      <input
        type="text"
        placeholder="Buscar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Nome</th>
            <th className="border p-2">Preço</th>
            <th className="border p-2">Estoque</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p: any, index) => (
            <tr key={index}>
              <td className="border p-2 text-blue-600 underline cursor-pointer"
                  onClick={() => window.location.href = `/produtos/${p.produto.id}`}>
                {p.produto.nome}
              </td>

              <td className="border p-2">
                R$ {Number(p.produto.preco).toFixed(2) || "0,00"}
              </td>
              <td className="border p-2">{p.produto.estoqueAtual || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
