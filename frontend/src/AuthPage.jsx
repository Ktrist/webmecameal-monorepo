import { useState } from 'react'
import { supabase } from './supabaseClient'
import {
  Box, Button, Container, FormControl, FormLabel, Heading, Input,
  VStack, Alert, AlertIcon, Text, Tabs, TabList, Tab, TabPanels, TabPanel,
  HStack, useToast, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Link
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

  // Modal pour mot de passe oublié
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [resetEmail, setResetEmail] = useState('')
  const [resetting, setResetting] = useState(false)

  // États pour le Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // États pour l'Inscription
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const handleLogin = async (event) => {
    // ... (pas de changement)
    event.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  // --- LOGIQUE DE SIGNUP MISE À JOUR AVEC CONNEXION ---
  const handleSignUp = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Étape 1: Inscrire l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        // On n'a plus besoin des 'options: data' car le Trigger est mort
      })

      if (authError) throw authError
      const user = authData.user
      if (!user) throw new Error("Erreur de création de compte.")

      // Étape 2: Insérer dans 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          address: address
        })
      if (profileError) throw profileError

      // Étape 3: Insérer dans 'user_roles'
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'user' })
      if (roleError) throw roleError

      // ÉTAPE 4 : LA CORRECTION - On connecte l'utilisateur
      // Cela va déclencher le 'onAuthStateChange' dans App.jsx
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signUpEmail,
        password: signUpPassword,
      })
      if (signInError) throw signInError

      // Si tout a réussi :
      toast({
        title: "Compte créé !",
        description: "Vous êtes maintenant connecté.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      navigate('/') // Rediriger

    } catch (error) {
      console.error("Erreur d'inscription:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Gestion de la réinitialisation du mot de passe
  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!resetEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre adresse email",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setResetting(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      onClose()
      setResetEmail('')
    } catch (error) {
      console.error("Erreur réinitialisation:", error)
      toast({
        title: "Erreur",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setResetting(false)
    }
  }

  // Le JSX (HTML)
  return (
    <Container centerContent py={10}>
      <Box w="100%" maxW="md" borderWidth="1px" borderRadius="lg" p={8}>
        <Heading textAlign="center" mb={6} color="brand.green">Webmecameal</Heading>

        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Tabs isFitted variant="soft-rounded" colorScheme="teal">
          <TabList mb={4}>
            <Tab>Se connecter</Tab>
            <Tab>Créer un compte</Tab>
          </TabList>
          <TabPanels>
            {/* Panneau de Connexion */}
            <TabPanel p={0}>
              <VStack as="form" onSubmit={handleLogin} spacing={4}>
                {/* ... champs de login ... */}
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </FormControl>
                <Box width="full" textAlign="right">
                  <Link
                    color="teal.500"
                    fontSize="sm"
                    onClick={onOpen}
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Mot de passe oublié ?
                  </Link>
                </Box>
                <Button type="submit" colorScheme="teal" isLoading={loading} width="full">
                  Se connecter
                </Button>
              </VStack>
            </TabPanel>

            {/* Panneau d'Inscription */}
            <TabPanel p={0}>
              <VStack as="form" onSubmit={handleSignUp} spacing={4}>
                {/* ... champs d'inscription ... */}
                <HStack w="full">
                  <FormControl isRequired>
                    <FormLabel>Prénom</FormLabel>
                    <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Nom</FormLabel>
                    <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </FormControl>
                </HStack>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Téléphone</FormLabel>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Adresse de livraison (Bureau)</FormLabel>
                  <Input type="text" placeholder="Ex: 10 rue de la Paix, 75002 Paris" value={address} onChange={(e) => setAddress(e.target.value)} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <Input type="password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} />
                </FormControl>
                <Button type="submit" colorScheme="teal" variant="outline" isLoading={loading} width="full">
                  Créer mon compte
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modal de réinitialisation du mot de passe */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Réinitialiser votre mot de passe</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack as="form" onSubmit={handleForgotPassword} spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </Text>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleForgotPassword}
              isLoading={resetting}
            >
              Envoyer le lien
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}