import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'STRIPE_SECRET_KEY not configured in Supabase secrets'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10',
    })

    // Test 1: Verify API Key format
    const keyFormat = {
      prefix: stripeSecretKey.substring(0, 7),
      isTest: stripeSecretKey.startsWith('sk_test_'),
      isLive: stripeSecretKey.startsWith('sk_live_'),
      length: stripeSecretKey.length,
    }

    // Test 2: Try to list products to verify key works
    let productsCount = 0
    try {
      const products = await stripe.products.list({ limit: 10 })
      productsCount = products.data.length
    } catch (e: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid Stripe API key',
          details: e.message,
          keyFormat
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Test 3: Check if specific Price IDs exist
    const priceIds = [
      'price_1SabLCEx4HxCpNJ2hpgpHExI', // HEBDO_2J
      'price_1SabMHEx4HxCpNJ2mDycvUW5', // HEBDO_3J
      'price_1SabNQEx4HxCpNJ2fsciiPLU', // HEBDO_5J
      'price_1SabNnEx4HxCpNJ26hfmuUmM', // MENSUEL
    ]

    const priceChecks = []
    for (const priceId of priceIds) {
      try {
        const price = await stripe.prices.retrieve(priceId)
        priceChecks.push({
          priceId,
          exists: true,
          active: price.active,
          type: price.type,
          currency: price.currency,
          amount: price.unit_amount,
        })
      } catch (e: any) {
        priceChecks.push({
          priceId,
          exists: false,
          error: e.message,
        })
      }
    }

    // Test 4: Check account details
    let accountInfo = {}
    try {
      const account = await stripe.accounts.retrieve()
      accountInfo = {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency,
        charges_enabled: account.charges_enabled,
      }
    } catch (e: any) {
      accountInfo = { error: e.message }
    }

    return new Response(
      JSON.stringify({
        success: true,
        keyFormat,
        productsCount,
        priceChecks,
        accountInfo,
        summary: {
          allPricesExist: priceChecks.every(p => p.exists),
          missingPrices: priceChecks.filter(p => !p.exists).map(p => p.priceId),
        }
      }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
