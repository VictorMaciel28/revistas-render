import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/[...nextauth]/options';
import { prisma } from '@/lib/prisma';

// POST - Verificar créditos necessários para pagamento
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { requestId } = await req.json();
    const userId = parseInt(session.user.id);

    if (!requestId) {
      return NextResponse.json({ error: 'ID da documentação é obrigatório' }, { status: 400 });
    }

    // Busca a documentação e seus capítulos
    const documentation = await prisma.documentation.findUnique({
      where: { id: requestId },
      include: {
        chapters: true
      }
    });

    if (!documentation) {
      return NextResponse.json({ error: 'Documentação não encontrada' }, { status: 404 });
    }

    // Calcula créditos necessários: 1 para ebook + 1 para cada capítulo
    const chaptersCount = documentation.chapters.length;
    const creditsNeeded = 1 + chaptersCount; // 1 para ebook + capítulos

    // Busca créditos do usuário
    let userCredits = await prisma.userDocumentationCredit.findUnique({
      where: { userId }
    });

    if (!userCredits) {
      userCredits = await prisma.userDocumentationCredit.create({
        data: {
          userId,
          credits: 0
        }
      });
    }

    const hasEnoughCredits = userCredits.credits >= creditsNeeded;
    const creditsShortage = hasEnoughCredits ? 0 : creditsNeeded - userCredits.credits;

    return NextResponse.json({
      creditsNeeded,
      userCredits: userCredits.credits,
      hasEnoughCredits,
      creditsShortage,
      chaptersCount,
      documentation: {
        id: documentation.id,
        title: documentation.title,
        company: documentation.company
      }
    });
  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
