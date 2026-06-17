import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe, TIERS } from '@/lib/stripe'
import type { StripeTier } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createServiceClient()

  const tier: StripeTier = ['standard', 'featured', 'premium'].includes(body.tier)
    ? body.tier
    : 'standard'

  const needsPayment = tier !== 'standard'

  // ── 1. Create company ─────────────────────────────────────
  const { data: company, error: companyErr } = await supabase
    .from('companies')
    .insert({
      name:        body.companyName,
      website:     body.companyWebsite,
      description: body.companyDescription,
      industry:    body.companyIndustry,
    })
    .select()
    .single()

  if (companyErr) {
    return NextResponse.json({ error: companyErr.message }, { status: 500 })
  }

  // ── 2. Create listing — always starts inactive (pending approval) ──
  const { data: listing, error: listingErr } = await supabase
    .from('listings')
    .insert({
      company_id:    company.id,
      title:         body.title,
      type:          body.type,
      industry:      body.industry,
      location_type: body.locationType,
      city:          body.city     || null,
      state:         body.state    || null,
      pay_rate:      body.payRate  ? Number(body.payRate) : null,
      pay_period:    body.payPeriod || null,
      description:   body.description,
      requirements:  body.requirements || null,
      apply_url:     body.applyUrl     || null,
      apply_email:   body.applyEmail   || null,
      deadline:      body.deadline     || null,
      tier,
      is_featured:   false,   // set true by admin or after Stripe confirms
      is_active:     false,   // always starts pending admin approval
    })
    .select()
    .single()

  if (listingErr) {
    return NextResponse.json({ error: listingErr.message }, { status: 500 })
  }

  // ── 3. Free tier — done ───────────────────────────────────
  if (!needsPayment) {
    return NextResponse.json({ listing_id: listing.id })
  }

  // ── 4. Paid tier — create Stripe Checkout session ─────────
  const tierInfo = TIERS[tier]
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{
      price_data: {
        currency:     'usd',
        unit_amount:  tierInfo.price,
        product_data: {
          name:        `LaunchPad ${tierInfo.label} Listing`,
          description: `${tier === 'premium' ? 'Premium (top placement + sponsor strip)' : 'Featured (pinned above standard listings)'} — 30 days · "${body.title}" at ${body.companyName}`,
        },
      },
      quantity: 1,
    }],
    metadata: { listing_id: listing.id, tier },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/post/success?listing=${listing.id}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/post`,
  })

  return NextResponse.json({ checkoutUrl: stripeSession.url, listing_id: listing.id })
}
