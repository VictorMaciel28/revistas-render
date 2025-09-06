// Esta rota serve para manipular um capítulo específico, ver(GET) ou atualizar(PUT) pelo chapterId
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string;  chapterId: string } }) {
  try {
    const chapter = await prisma.documentationChapter.findUnique({
      where: { id: params.chapterId },
      include: { authors: true } // inclui os autores
    });

    if (!chapter) {
      return NextResponse.json({ error: "Capítulo não encontrado" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar capítulo" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; chapterId: string } }) {
  try {
    const { title, link, abstract, first_page, last_page, authors } = await req.json();

    // Atualiza capítulo e autores
    const updatedChapter = await prisma.documentationChapter.update({
      where: { id: params.chapterId },
      data: {
        title,
        link,
        abstract,
        first_page,
        last_page,
        authors: {
          deleteMany: {}, // remove autores antigos
          create: authors.map((a: string) => ({ name: a })) // cria novos autores
        }
      },
      include: { authors: true } // retorna os autores atualizados
    });

    return NextResponse.json(updatedChapter, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar capítulo" }, { status: 500 });
  }
}
