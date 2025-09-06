import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const request = await prisma.documentation.findUnique({
      where: { id: params.id },
      include: {
        contributors: true,
        chapters: { include: { authors: true } }
      }
    });

    if (!request) return NextResponse.json({ error: "Request não encontrada" }, { status: 404 });
    return NextResponse.json(request);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar request" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { title, company, edition, isbn, link, abstract, contributors } = data;

    const updatedRequest = await prisma.documentation.update({
      where: { id: params.id },
      data: {
        title: data.title,
        company: data.company,
        edition: data.edition,
        isbn: data.isbn,
        link: data.link,
        abstract: data.abstract,
         contributors: {
          deleteMany: {}, // remove todos os antigos
          create: contributors.map((name: string) => ({ name })) // cria novos contributors
        }
      },
      include: { contributors: true } // retorna os contributors atualizados
    });
    return NextResponse.json(updatedRequest);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar request" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.documentation.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Request deletada com sucesso" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao deletar request" }, { status: 500 });
  }
}
