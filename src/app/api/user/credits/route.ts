import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

// GET - Buscar créditos do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    
    // Busca ou cria o registro de créditos do usuário
    let userCredits = await prisma.userDocumentationCredit.findUnique({
      where: { userId }
    });

    if (!userCredits) {
      // Cria registro inicial com 0 créditos
      userCredits = await prisma.userDocumentationCredit.create({
        data: {
          userId,
          credits: 0
        }
      });
    }

    return NextResponse.json({ 
      credits: userCredits.credits,
      userId: userCredits.userId 
    });
  } catch (error) {
    console.error('Erro ao buscar créditos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Adicionar créditos (para recargas)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { credits } = await req.json();
    const userId = parseInt(session.user.id);

    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Quantidade de créditos inválida' }, { status: 400 });
    }

    // Busca ou cria o registro de créditos do usuário
    let userCredits = await prisma.userDocumentationCredit.findUnique({
      where: { userId }
    });

    if (!userCredits) {
      userCredits = await prisma.userDocumentationCredit.create({
        data: {
          userId,
          credits: credits
        }
      });
    } else {
      userCredits = await prisma.userDocumentationCredit.update({
        where: { userId },
        data: {
          credits: userCredits.credits + credits
        }
      });
    }

    return NextResponse.json({ 
      credits: userCredits.credits,
      added: credits 
    });
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
