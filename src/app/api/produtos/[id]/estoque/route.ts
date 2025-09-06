import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const API_TOKEN = process.env.TINY_API_TOKEN;

  const body = new URLSearchParams();
  body.append("token", API_TOKEN || "");
  body.append("id", id);
  body.append("formato", "json");

  try {
    const res = await fetch(
      "https://api.tiny.com.br/api2/produto.obter.estoque.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno ao buscar estoque", details: String(err) },
      { status: 500 }
    );
  }
}
