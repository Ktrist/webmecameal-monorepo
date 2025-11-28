import Stripe from 'stripe'

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

    const stripe = new Stripe(stripeSecretKey, {
      // Cette version d'API est stable, vous pouvez la laisser ou mettre la vôtre
      apiVersion: '2024-04-10', 
    })

    // 3. Récupération des données envoyées par React
    const { cartItems, orderId } = await req.json()

    if (!cartItems || !orderId) {
      throw new Error('Données manquantes (cartItems ou orderId)')
    }

    // 4. Préparation des lignes pour Stripe
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

    // 5. Création de la Session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      // URLs de redirection
      success_url: `http://localhost:5173/commande/succes?order_id=${orderId}`,
      cancel_url: `http://localhost:5173/checkout`,
      metadata: {
        supabase_order_id: orderId, // Très important pour le webhook plus tard
      },
    })

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
    console.error('Erreur Stripe:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})