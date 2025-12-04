import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. Gérer le CORS (Indispensable pour que le navigateur accepte la réponse)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Initialisation de Stripe
    // On récupère la clé secrète stockée dans les "secrets" de Supabase
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('La clé secrète Stripe (STRIPE_SECRET_KEY) est introuvable.')
    }

    // 🔍 DEBUG: Log key format (without revealing the key)
    console.log('🔑 Stripe key format:', stripeSecretKey.substring(0, 7) + '...')
    console.log('🔑 Key is test mode:', stripeSecretKey.startsWith('sk_test_'))

    // URL de base de l'application (configurable via secrets Supabase)
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:3000'

    const stripe = new Stripe(stripeSecretKey, {
      // Cette version d'API est stable, vous pouvez la laisser ou mettre la vôtre
      apiVersion: '2024-04-10',
    })

    // 3. Récupération des données envoyées par React
    const body = await req.json()
    const { mode = 'payment', cartItems, orderId, priceId, planType, userId } = body

    // 🔍 DEBUG: Log received parameters
    console.log('📦 Request mode:', mode)
    if (mode === 'subscription') {
      console.log('💳 Price ID:', priceId)
      console.log('📋 Plan type:', planType)
      console.log('👤 User ID:', userId ? 'present' : 'missing')
    }

    // 4. Création de la Session Stripe Checkout (différente selon le mode)
    let session

    if (mode === 'subscription') {
      // === MODE ABONNEMENT ===
      if (!priceId || !planType || !userId) {
        throw new Error('Données manquantes pour abonnement (priceId, planType, userId)')
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId, // On utilise directement le Price ID créé dans Stripe
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/compte?subscription_success=true`,
        cancel_url: `${appUrl}/abonnements`,
        metadata: {
          user_id: userId,
          plan_type: planType,
          mode: 'subscription',
        },
      })
    } else {
      // === MODE PAIEMENT PONCTUEL (existant) ===
      if (!cartItems || !orderId) {
        throw new Error('Données manquantes (cartItems ou orderId)')
      }

      // Préparation des lignes pour Stripe
      const line_items = cartItems.map((item: any) => {
        // Sécurité : On s'assure que le prix est un nombre et on convertit en centimes
        const unitAmount = Math.round(parseFloat(item.price) * 100)

        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.week_name,
              // images: item.image_url ? [item.image_url] : [], // Optionnel
            },
            unit_amount: unitAmount,
          },
          quantity: item.quantity,
        }
      })

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        mode: 'payment',
        success_url: `${appUrl}/commande/succes?order_id=${orderId}`,
        cancel_url: `${appUrl}/checkout`,
        metadata: {
          supabase_order_id: orderId,
          mode: 'payment',
        },
      })
    }

    // 6. Réponse succès
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    // 7. Gestion des erreurs
    console.error('❌ Erreur Stripe:', error.message)
    console.error('❌ Error type:', error.type)
    console.error('❌ Error code:', error.code)
    console.error('❌ Full error:', JSON.stringify(error, null, 2))

    // Extraire le message d'erreur le plus descriptif possible
    const errorMessage = error.raw?.message || error.message || 'Erreur inconnue'

    return new Response(
      JSON.stringify({
        error: errorMessage,
        type: error.type,
        code: error.code
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
