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

Deno.serve(async (req) => {
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

    // 4. Connexion à Supabase en mode "Service Role"
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 5. Traitement selon le type d'événement
    switch (event.type) {
      // === PAIEMENT PONCTUEL ===
      case 'checkout.session.completed': {
        const session = event.data.object
        const mode = session.metadata?.mode

        if (mode === 'subscription') {
          // Checkout d'abonnement complété
          console.log(`🎉 Abonnement checkout complété pour user ${session.metadata?.user_id}`)

          // On récupère l'abonnement Stripe pour avoir tous les détails
          const subscriptionId = session.subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          await supabaseAdmin.from('subscriptions').insert({
            user_id: session.metadata?.user_id,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            stripe_price_id: subscription.items.data[0].price.id,
            plan_type: session.metadata?.plan_type,
            status: subscription.status,
            amount: (subscription.items.data[0].price.unit_amount ?? 0) / 100,
            currency: subscription.currency,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })

        } else {
          // Paiement ponctuel (commande)
          const orderId = session.metadata?.supabase_order_id
          console.log(`💰 Paiement reçu pour la commande ${orderId}`)

          if (orderId) {
            const { error } = await supabaseAdmin
              .from('orders')
              .update({ status: 'paid' })
              .eq('id', orderId)

            if (error) {
              console.error('Erreur Update Supabase:', error)
              throw error
            }
          }
        }
        break
      }

      // === ÉVÉNEMENTS ABONNEMENTS ===
      case 'customer.subscription.created': {
        const subscription = event.data.object
        console.log(`✅ Abonnement créé: ${subscription.id}`)
        // Déjà géré dans checkout.session.completed normalement
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log(`🔄 Abonnement mis à jour: ${subscription.id}`)

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log(`❌ Abonnement supprimé: ${subscription.id}`)

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      // === ÉVÉNEMENTS PAIEMENTS RÉCURRENTS ===
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log(`💳 Paiement récurrent réussi: ${invoice.id}`)

        // Récupérer la subscription pour avoir le user_id
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (subscription) {
          await supabaseAdmin.from('payments').insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: (invoice.amount_paid ?? 0) / 100,
            currency: invoice.currency,
            status: 'paid',
            payment_type: 'subscription',
            paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log(`⚠️ Paiement récurrent échoué: ${invoice.id}`)

        // Mettre à jour le statut de l'abonnement
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription)

        // Enregistrer l'échec de paiement
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()

        if (subscription) {
          await supabaseAdmin.from('payments').insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            stripe_invoice_id: invoice.id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: (invoice.amount_due ?? 0) / 100,
            currency: invoice.currency,
            status: 'failed',
            payment_type: 'subscription',
          })
        }
        break
      }

      default:
        console.log(`⚪ Événement non géré: ${event.type}`)
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