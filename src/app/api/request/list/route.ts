import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [requests, statuses] = await Promise.all([
      prisma.documentation.findMany({
        include: {
          contributors: true,
          chapters: { include: { authors: true } }
        },
        orderBy: { created_at: "desc" }
      }),
      prisma.documentationStatus.findMany()
    ])

    const statusMap = new Map(statuses.map((s) => [s.id, s.name]))
    const withStatusName = requests.map((r) => ({
      ...r,
      statusName: statusMap.get(r.status) || null,
    }))

    return NextResponse.json(withStatusName);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar requests" }, { status: 500 });
  }
}
