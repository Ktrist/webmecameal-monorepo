import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'stripe'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Gérer le CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Non authentifié')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    // 2. Initialisation de Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Configuration Stripe manquante')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10',
    })

    // 3. Récupérer les données de la requête
    const { action, subscriptionId } = await req.json()

    if (!action || !subscriptionId) {
      throw new Error('Paramètres manquants (action, subscriptionId)')
    }

    // 4. Récupérer l'abonnement depuis Supabase pour vérifier la propriété
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      throw new Error('Abonnement introuvable ou vous n\'êtes pas autorisé')
    }

    // 5. Exécuter l'action demandée
    let result

    switch (action) {
      case 'cancel_at_period_end': {
        // Annuler à la fin de la période (pause)
        result = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        })

        // Mettre à jour dans Supabase
        await supabaseAdmin
          .from('subscriptions')
          .update({ cancel_at_period_end: true })
          .eq('id', subscriptionId)

        console.log(`⏸️ Abonnement ${subscription.stripe_subscription_id} sera annulé à la fin de la période`)
        break
      }

      case 'reactivate': {
        // Réactiver un abonnement marqué pour annulation
        result = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: false,
        })

        // Mettre à jour dans Supabase
        await supabaseAdmin
          .from('subscriptions')
          .update({ cancel_at_period_end: false })
          .eq('id', subscriptionId)

        console.log(`▶️ Abonnement ${subscription.stripe_subscription_id} réactivé`)
        break
      }

      case 'cancel_immediately': {
        // Annulation immédiate
        result = await stripe.subscriptions.cancel(subscription.stripe_subscription_id)

        // Mettre à jour dans Supabase
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId)

        console.log(`❌ Abonnement ${subscription.stripe_subscription_id} annulé immédiatement`)
        break
      }

      default:
        throw new Error(`Action non reconnue: ${action}`)
    }

    // 6. Réponse succès
    return new Response(
      JSON.stringify({ success: true, subscription: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error('Erreur gestion abonnement:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
