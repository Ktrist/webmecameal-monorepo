import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import {
  Box, Button, Container, FormControl, FormLabel, Heading, Input,
  VStack, Alert, AlertIcon, useToast
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    // Vérifier si l'utilisateur a un token de réinitialisation valide
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.')
      }
    }
    checkSession()
  }, [])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été réinitialisé avec succès',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (error) {
      console.error('Erreur réinitialisation:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container centerContent py={10}>
      <Box w="100%" maxW="md" borderWidth="1px" borderRadius="lg" p={8}>
        <Heading textAlign="center" mb={6} color="brand.green">
          Nouveau mot de passe
        </Heading>

        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <VStack as="form" onSubmit={handleResetPassword} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Nouveau mot de passe</FormLabel>
            <Input
              type="password"
              placeholder="Minimum 6 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirmer le mot de passe</FormLabel>
            <Input
              type="password"
              placeholder="Retapez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            isLoading={loading}
            width="full"
            isDisabled={error === 'Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.'}
          >
            Réinitialiser le mot de passe
          </Button>
        </VStack>
      </Box>
    </Container>
  )
}
