import { prisma } from "@/lib/prisma"


const REVENUECAT_SECRET = process.env.REVENUECAT_SECRET || "your-secret-here"

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${REVENUECAT_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const event = await req.json()
  const { type, app_user_id, entitlement_ids = [], product_id, price = 0 } = event

  const profile = await prisma.profile.findUnique({
    where: { userId: app_user_id }
  })

  if (!profile) return Response.json({ error: "User not found" }, { status: 404 })

  const updateData: any = { lastRevenueSync: new Date() }

  if (['INITIAL_PURCHASE', 'RENEWAL'].includes(type)) {
    updateData.widgetsUnlocked = entitlement_ids.includes('widget_access')
  }
  if (['EXPIRATION', 'CANCELLATION'].includes(type)) {
    updateData.widgetsUnlocked = false
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: updateData
  })

  return Response.json({ success: true })
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',           // change to your domain later
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}