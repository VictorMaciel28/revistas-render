// src/app/api/session/route.ts
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options"; // caminho correto
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: session.user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ user: null });
  }
}
