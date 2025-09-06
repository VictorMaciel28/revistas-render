"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProdutoDetalhePage() {
  const { id } = useParams();
  const [produto, setProduto] = useState<any>(null);
  const [estoque, setEstoque] = useState<any[]>([]);
  const [depositos, setDepositos] = useState<any[]>([]);

  useEffect(() => {
    async function carregarDetalhes() {
      try {
        // Buscar detalhes do produto
        const resProduto = await fetch(`/api/produtos/${id}`);
        const dataProduto = await resProduto.json();
        setProduto(dataProduto);

        // Buscar estoque simplificado (filial + quantidade)
        const resEstoque = await fetch(`/api/produtos/${id}/estoque`, {
          method: "POST",
        });
        const dataEstoque = await resEstoque.json();

        // Ajuste para pegar os dois formatos:
        // 1) Formato atual (filial + quantidade)
        if (dataEstoque?.retorno?.produtos && dataEstoque.retorno.produtos.length > 0) {
          const filiais = dataEstoque.retorno.produtos[0]?.estoques || [];
          setEstoque(filiais);
        } else {
          setEstoque([]);
        }

        // 2) Formato novo do Tiny (depositos)
        if (dataEstoque?.retorno?.produto?.depositos) {
          setDepositos(dataEstoque.retorno.produto.depositos);
        } else {
          setDepositos([]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    carregarDetalhes();
  }, [id]);

  if (!produto) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{produto.nome}</h1>

      {/* Box da imagem */}
      {produto.imagem ? (
        <div className="mb-4 w-64 h-64 bg-white flex items-center justify-center shadow rounded">
          <img
            src={produto.imagem}
            alt={produto.nome}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="mb-4 w-64 h-64 bg-white flex items-center justify-center shadow rounded text-gray-500 text-center">
          Imagem não disponível
        </div>
      )}

      <p><strong>Preço:</strong> R$ {Number(produto.preco).toFixed(2)}</p>
      <p><strong>Descrição:</strong> {produto.descricao || "Sem descrição"}</p>

      {/* Estoque simplificado (formato antigo) */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Estoque por filial</h2>
      {estoque.length > 0 ? (
        <table className="w-full border border-gray-200 mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Filial</th>
              <th className="p-2 border">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {estoque.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border">{item.filial || "Não informado"}</td>
                <td className="p-2 border">
                  {item.estoque_atual ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mb-6">Nenhuma filial encontrada.</p>
      )}

      {/* Estoque detalhado por depósitos (formato novo do Tiny) */}
      <h2 className="text-xl font-semibold mb-2">Detalhes de estoque por depósito</h2>
      {depositos.length > 0 ? (
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Depósito</th>
              <th className="p-2 border">Empresa</th>
              <th className="p-2 border">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {depositos.map((item: any, index: number) => (
              <tr key={index}>
                <td className="p-2 border">{item.deposito.nome}</td>
                <td className="p-2 border">{item.deposito.empresa}</td>
                <td className="p-2 border">{item.deposito.saldo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">Nenhum depósito encontrado.</p>
      )}
    </div>
  );
}
