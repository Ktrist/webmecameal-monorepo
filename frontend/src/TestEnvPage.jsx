export default function TestEnvPage() {
  // Affiche toutes les variables d'environnement
  const envVars = {
    STRIPE_PRICE_HEBDO_2J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_2J,
    STRIPE_PRICE_HEBDO_3J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_3J,
    STRIPE_PRICE_HEBDO_5J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_5J,
    STRIPE_PRICE_MENSUEL: import.meta.env.VITE_STRIPE_PRICE_MENSUEL,
  }

  console.log('🧪 TEST ENV VARS:', envVars)

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>🧪 Test Variables d'Environnement</h1>
      <pre style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}>
        {JSON.stringify(envVars, null, 2)}
      </pre>
    </div>
  )
}
