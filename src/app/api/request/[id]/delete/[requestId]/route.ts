// src/app/api/request/[id]/delete/[requestId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    // Deleta primeiro os capítulos relacionados
    await prisma.documentationChapter.deleteMany({
      where: { id_request: params.requestId },
    });

    // Agora deleta a request
    await prisma.documentation.delete({
      where: { id: params.requestId },
    });

    return NextResponse.json({ message: "Request e capítulos deletados com sucesso" });
  } catch (err: any) {
    console.error("Erro ao deletar request e capítulos:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
