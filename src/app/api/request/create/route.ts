import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id_depositor, title, company, edition, isbn, link, abstract, contributors } = await req.json();

    if (!id_depositor) {
      return NextResponse.json({ error: "Campo 'id_depositor' é obrigatório" }, { status: 400 });
    }

    const request = await prisma.documentation.create({
      data: {
        id_depositor, // obrigatório
        title,
        company,
        edition,
        isbn,
        link,
        abstract,
        contributors: {
          create: contributors
        }
      },
      include: { contributors: true }
    });
    
    console.log("Request criado:", request);

    return NextResponse.json(request, { status: 201 });
  } catch (err: any) {
    console.error("Erro detalhado ao criar request:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
