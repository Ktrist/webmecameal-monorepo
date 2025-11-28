import { useOutletContext, Navigate, Outlet } from 'react-router-dom'
import { Box, Spinner, Center, Text } from '@chakra-ui/react'

export default function AdminRoute() {
  // 1. On récupère le profil (qui inclut le rôle) depuis App.jsx
  const { profile } = useOutletContext()

  // 2. Cas de figure : L'utilisateur n'est pas connecté
  if (!profile) {
    // On le renvoie au login
    return <Navigate to="/login" replace />
  }

  // 3. Cas de figure : L'utilisateur est connecté, MAIS n'est pas admin
  if (profile.role !== 'admin') {
    // On le renvoie à l'accueil (il n'a rien à faire ici)
    return <Navigate to="/" replace />
  }

  // 4. Cas de figure : L'utilisateur est connecté ET est admin
  // On affiche la page admin demandée (ex: /admin/menus)
  return <Outlet context={useOutletContext()} />
}