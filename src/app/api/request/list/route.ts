import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.documentation.findMany({
      include: {
        contributors: true, // request_contribuitor
        chapters: { include: { authors: true } } // request_chapter + request_chapter_author
      },
      orderBy: { created_at: "desc" }
    });
    return NextResponse.json(requests);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar requests" }, { status: 500 });
  }
}
