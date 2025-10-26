import { NextRequest } from 'next/server'
import { GET } from './src/app/api/auth/[...nextauth]/route'

async function main() {
  const req = new NextRequest('http://localhost:3000/api/auth/session')
  const res = await GET(req, { params: { nextauth: ['session'] } })
  console.log('status', res.status)
  const text = await res.text()
  console.log('body', text)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})