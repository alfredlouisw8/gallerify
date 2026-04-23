import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB per file
const MAX_TOTAL_SIZE = 25 * 1024 * 1024 // 25 MB total
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]

export async function POST(req: Request) {
  const formData = await req.formData()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const type = formData.get('type') as string
  const message = formData.get('message') as string

  if (!name || !email || !type || !message) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 }
    )
  }

  const files = formData.getAll('attachments') as File[]

  let totalSize = 0
  const attachments: { filename: string; content: Buffer }[] = []

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.name}` },
        { status: 400 }
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `${file.name} exceeds the 10 MB limit.` },
        { status: 400 }
      )
    }
    totalSize += file.size
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: 'Total attachment size exceeds 25 MB.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    attachments.push({ filename: file.name, content: Buffer.from(arrayBuffer) })
  }

  const { error } = await resend.emails.send({
    from: 'Gallerify <help@gallerify.app>',
    to: 'contact@gallerify.app',
    replyTo: email,
    subject: `[${type}] from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nType: ${type}\n\n${message}`,
    attachments,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to send message.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
