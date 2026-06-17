import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const TIERS = {
  standard: {
    label:       'Standard',
    price:       0,
    description: 'Free',
  },
  featured: {
    label:       'Featured',
    price:       4900,   // $49.00 in cents
    description: '$49',
  },
  premium: {
    label:       'Premium',
    price:       9900,   // $99.00 in cents
    description: '$99',
  },
} as const

export type StripeTier = keyof typeof TIERS
