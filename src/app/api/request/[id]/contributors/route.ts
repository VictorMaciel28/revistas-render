import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name } = await req.json();
    const contributor = await prisma.documentationContribuitor.create({
      data: { id_request: params.id, name }
    });
    return NextResponse.json(contributor, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao adicionar contribuidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; contributorId: string } }) {
  try {
    await prisma.documentationContribuitor.delete({ where: { id: Number(params.contributorId) } });
    return NextResponse.json({ message: "Contribuidor deletado" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao deletar contribuidor" }, { status: 500 });
  }
}
