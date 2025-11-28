// On importe le client Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// On importe Stripe
import Stripe from 'stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

// Cette clé servira à vérifier que c'est bien Stripe qui nous parle
const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  // 1. Vérification de sécurité basique
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    // 2. Lire le corps de la requête (le message de Stripe)
    const body = await req.text()
    
    // 3. Vérifier la signature cryptographique
    // (Cela garantit que personne ne peut simuler un paiement)
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!, // On va configurer cette clé après
      undefined,
      cryptoProvider
    )

    // 4. Si l'événement est "Paiement réussi"
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const orderId = session.metadata?.supabase_order_id

      console.log(`💰 Paiement reçu pour la commande ${orderId}`)

      if (orderId) {
        // 5. Connexion à Supabase en mode "Service Role" (Dieu)
        // (Nécessaire pour contourner la RLS et écrire sans être connecté)
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 6. Mise à jour de la commande
        const { error } = await supabaseAdmin
          .from('orders')
          .update({ status: 'paid' }) // <-- C'est ici que la magie opère
          .eq('id', orderId)

        if (error) {
          console.error('Erreur Update Supabase:', error)
          throw error
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error(`Erreur Webhook: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})