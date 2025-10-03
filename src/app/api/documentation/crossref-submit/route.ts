import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { options } from '../../auth/[...nextauth]/options'
import { create } from 'xmlbuilder2'
import axios from 'axios'
import FormData from 'form-data'

type Publication = {
  id: string
  title: string
  company: string
  edition: number
  isbn: string | null
  link: string
  abstract: string
  created_at: Date
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const payload = await req.json().catch(() => ({} as any))
    const { requestId } = payload as { requestId: string }
    if (!requestId) {
      return NextResponse.json({ error: 'requestId é obrigatório' }, { status: 400 })
    }

    // Buscar dados da publicação e capítulos
    const documentation = await prisma.documentation.findUnique({ where: { id: requestId } })
    if (!documentation) {
      return NextResponse.json({ error: 'Documentação não encontrada' }, { status: 404 })
    }

    const contributors = await prisma.documentationContribuitor.findMany({ where: { id_request: requestId }, orderBy: { id: 'asc' } })
    const chapters = await prisma.documentationChapter.findMany({ where: { id_request: requestId }, orderBy: { created_at: 'asc' } })
    const chapterAuthorsById = await prisma.documentationChapterAuthor.findMany({ where: { id_chapter: { in: chapters.map(c => c.id) } }, orderBy: { id: 'asc' } })

    const authorsMap = new Map<string, { name: string }[]>()
    for (const a of chapterAuthorsById) {
      const list = authorsMap.get(a.id_chapter) || []
      list.push({ name: a.name || '' })
      authorsMap.set(a.id_chapter, list)
    }

    const now = Date.now().toString()
    const createdAt = new Date(documentation.created_at)

    // Montar XML com xmlbuilder2 (usando referências explícitas de nós)
    const xmlDoc = create({ version: '1.0', encoding: 'UTF-8' })
    const doiBatch = xmlDoc.ele('doi_batch', {
      version: '4.4.2',
      xmlns: 'http://www.crossref.org/schema/4.4.2',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:jats': 'http://www.ncbi.nlm.nih.gov/JATS1',
      'xsi:schemaLocation': 'http://www.crossref.org/schema/4.4.2 http://www.crossref.org/schema/deposit/crossref4.4.2.xsd',
    })

    const head = doiBatch.ele('head')
    head.ele('doi_batch_id').txt(documentation.id)
    head.ele('timestamp').txt(now)
    const depositor = head.ele('depositor')
    depositor.ele('depositor_name').txt('victor-maciel@editorapasteur.com.br/epas:epas')
    depositor.ele('email_address').txt('diretoriacientifica@editorapasteur.com.br')
    head.ele('registrant').txt('WEB-DEPOSIT')

    const xmlBody = doiBatch.ele('body')
    const book = xmlBody.ele('book', { book_type: 'edited_book' })
    const bookMetadata = book.ele('book_metadata')
    const contributorsEle = bookMetadata.ele('contributors')

    if (contributors.length > 0) {
      contributors.forEach((c, idx) => {
        contributorsEle
          .ele('organization', { sequence: idx === 0 ? 'first' : 'additional', contributor_role: 'editor' })
          .txt(c.name)
      })
    }

    bookMetadata.ele('titles').ele('title').txt(documentation.title)
    const abstractEle = bookMetadata.ele('jats:abstract', { 'xml:lang': 'pt' })
    abstractEle.ele('jats:p').txt(documentation.abstract)
    bookMetadata.ele('edition_number').txt(String(documentation.edition))

    const pubDate = bookMetadata.ele('publication_date', { media_type: 'online' })
    pubDate.ele('month').txt(String(createdAt.getMonth() + 1))
    pubDate.ele('day').txt(String(createdAt.getDate()))
    pubDate.ele('year').txt(String(createdAt.getFullYear()))
    if (documentation.isbn) bookMetadata.ele('isbn').txt(documentation.isbn)
    const publisher = bookMetadata.ele('publisher')
    publisher.ele('publisher_name').txt('Editora Pasteur')
    const doiData = bookMetadata.ele('doi_data')
    doiData.ele('doi').txt(`10.59290/${documentation.isbn || documentation.id}`)
    doiData.ele('resource').txt(documentation.link)

    // chapters como filhos de <book>
    for (const ch of chapters) {
      const chAuthors = authorsMap.get(ch.id) || []
      const authors = chAuthors.map((a, idx) => {
        const parts = (a.name || '').trim().split(/\s+/)
        const given = parts[0] || ''
        const surname = parts.slice(1).join(' ') || ''
        return { sequence: idx === 0 ? 'first' : 'additional', given, surname }
      })
      const doiParam = (() => { try { return new URL(ch.link).searchParams.get('doi') || '' } catch { return '' } })()

      const contentItem = book.ele('content_item', { component_type: 'chapter' })
      const contribs = contentItem.ele('contributors')
      for (const a of authors) {
        const pn = contribs.ele('person_name', { sequence: a.sequence, contributor_role: 'author' })
        pn.ele('given_name').txt(a.given)
        pn.ele('surname').txt(a.surname)
      }
      contentItem.ele('titles').ele('title').txt(ch.title)
      const chPubDate = contentItem.ele('publication_date', { media_type: 'online' })
      chPubDate.ele('month').txt(String(createdAt.getMonth() + 1))
      chPubDate.ele('day').txt(String(createdAt.getDate()))
      chPubDate.ele('year').txt(String(createdAt.getFullYear()))
      const pages = contentItem.ele('pages')
      pages.ele('first_page').txt(String(ch.first_page))
      pages.ele('last_page').txt(String(ch.last_page))
      const chDoiData = contentItem.ele('doi_data')
      chDoiData.ele('doi').txt(doiParam)
      chDoiData.ele('resource').txt(ch.link)
    }

    const xml = xmlDoc.end({ prettyPrint: true })

    // Enviar ao CrossRef (ambiente de teste)
    const form = new FormData()
    form.append('file', Buffer.from(xml), { filename: 'anais.xml', contentType: 'text/xml' })
    form.append('operation', 'doMDUpload')

    const auth = Buffer.from('victor-maciel@editorapasteur.com.br:Victor.180696').toString('base64')
    const resp = await axios.post('https://test.crossref.org/servlet/deposit', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Basic ${auth}`,
      },
      maxBodyLength: Infinity,
    })

    return NextResponse.json({ ok: true, xml, crossrefStatus: resp.status, crossrefData: resp.data })
  } catch (error: any) {
    console.error('Erro ao gerar/enviar XML:', error?.response?.data || error)
    return NextResponse.json({ error: 'Erro ao gerar/enviar XML', details: error?.response?.data || String(error) }, { status: 500 })
  }
}


