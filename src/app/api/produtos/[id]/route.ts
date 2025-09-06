import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = process.env.TINY_API_TOKEN;
  const id = params.id;

  const formData = new URLSearchParams();
  formData.append("token", token || "");
  formData.append("id", id);
  formData.append("formato", "json");

  try {
    const res = await fetch("https://api.tiny.com.br/api2/produto.obter.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const text = await res.text();
    console.log("Retorno do Tiny:", text);

    const json = JSON.parse(text);
    const produto = json?.retorno?.produto;

    if (!produto) {
      return NextResponse.json(
        { erro: "Produto não encontrado", raw: json },
        { status: 404 }
      );
    }

    // Tenta buscar imagens nas duas listas
    const imagensAnexos = produto.anexos?.map((a: any) => a.anexo) || [];
    const imagensExternas =
      produto.imagens_externas?.map(
        (i: any) => i.imagem_externa?.url
      ) || [];

    const todasImagens = [...imagensAnexos, ...imagensExternas];
    const primeiraImagem = todasImagens.length > 0 ? todasImagens[0] : null;

    return NextResponse.json({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      estoqueAtual: produto.estoqueAtual,
      descricao: produto.descricao,
      imagem: primeiraImagem,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { erro: "Falha ao buscar produto" },
      { status: 500 }
    );
  }
}
