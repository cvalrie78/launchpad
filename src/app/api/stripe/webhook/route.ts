import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session   = event.data.object as Stripe.Checkout.Session
    const listingId = session.metadata?.listing_id
    const tier      = session.metadata?.tier ?? 'featured'

    if (listingId) {
      const supabase = createServiceClient()
      // Mark payment as confirmed — is_featured for featured/premium
      // is_active stays false until admin approves
      await supabase
        .from('listings')
        .update({
          tier,
          is_featured: tier === 'featured' || tier === 'premium',
        })
        .eq('id', listingId)
    }
  }

  return NextResponse.json({ received: true })
}
