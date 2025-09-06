// Esta rota serve para criar/deletar/ listar capítulos dentro de um request específico (id do request)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, link, abstract, first_page, last_page, authors } = await req.json();

    console.log("Payload recebido:", { title, link, abstract, first_page, last_page, authors });
    console.log("Request ID:", params.id);

    const chapter = await prisma.documentationChapter.create({
      data: {
        id_request: params.id,
        title,
        link,
        abstract,
        first_page,
        last_page,
        authors: { create: authors.map((a: string) => ({ name: a })) } 
      },
      include: { authors: true }
    });

    console.log("Capítulo criado:", chapter);

    return NextResponse.json(chapter, { status: 201 });
  } catch (err: any) {
    console.error("Erro detalhado ao criar capítulo:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string; chapterId: string } }) {
  try {
    await prisma.documentationChapter.delete({ where: { id: params.chapterId } });
    return NextResponse.json({ message: "Capítulo deletado" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao deletar capítulo" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const request = await prisma.documentation.findUnique({
      where: { id: params.id },
      include: {
        chapters: {
          include: { authors: true },
          orderBy: { created_at: "asc" }
        }
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Request não encontrada" }, { status: 404 });
    }

    // transformar autores em array de strings pro front
    const chapters = request.chapters.map(ch => ({
      ...ch,
      authors: ch.authors.map(a => a.name)
    }));

    return NextResponse.json({
      request_id: request.id,
      request_title: request.title,
      request_link: request.link,
      chapters
    });
  } catch (err: any) {
    console.error("Erro ao buscar capítulos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

