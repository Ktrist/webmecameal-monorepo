import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Box, Spinner, Center } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. On récupère la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // 2. On écoute les changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          fetchProfile(session.user)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // 3. LA FONCTION CORRIGÉE
  const fetchProfile = async (user) => {
    try {
      setLoading(true)
      
      // Requête A : Récupérer le Rôle
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      // Requête B : Récupérer les Infos Personnelles (C'est ce qu'il manquait !)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*') // On prend tout (first_name, last_name, phone, address...)
        .eq('id', user.id)
        .maybeSingle()
      
      // On fusionne tout dans un seul objet 'profile'
      setProfile({
        ...user, // L'email et l'ID de base
        role: roleData?.role || 'user', // Le rôle (ou 'user' par défaut)
        ...profileData // Le prénom, nom, téléphone, adresse...
      })

    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      // En cas d'erreur, on garde au moins les infos de base
      setProfile(user)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box>
      <Outlet context={{ session, profile, user: session?.user }} />
    </Box>
  )
}

export default App