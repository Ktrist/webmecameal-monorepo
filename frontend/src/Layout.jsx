import { useState, useEffect } from 'react'
import { 
  Box, Button, Container, Heading, Text, Flex, VStack, Divider,
  // Imports pour les Modales et Drawers (Menu Mobile)
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, 
  ModalCloseButton, useDisclosure, IconButton, HStack,
  Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, Link, Spacer
} from '@chakra-ui/react'
import { Link as RouterLink, Outlet, useOutletContext } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiUser, FiLogOut } from 'react-icons/fi' 
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa'
import { useCart } from './CartContext'
import { supabase } from './supabaseClient'

const STRAPI_URL = 'http://localhost:1337' // Pour le fetch des liens

export default function Layout() {
  // 1. Récupération des contextes
  const { session, profile } = useOutletContext()
  const { 
    cartItems, itemCount, total, 
    updateQuantity, removeFromCart 
  } = useCart()
  
  // 2. Gestion des Modales et Menus
  const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure() // Panier
  const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure() // Burger Menu
  
  // 3. NOUVEAU : État pour les liens de navigation (depuis Strapi)
  const [menuLinks, setMenuLinks] = useState([])

  // 4. Fonction de déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut()
    onMenuClose()
  }

  // 5. FETCH LE MENU DE NAVIGATION DEPUIS STRAPI (Single Type Global)
  useEffect(() => {
    async function fetchGlobal() {
      try {
        // Fetch de la structure 'Global' et population de la relation 'navigation'
        const res = await fetch(`${STRAPI_URL}/api/global?populate[navigation]=*`)
        const json = await res.json()
        
        if (json.data && json.data.navigation) {
          // Strapi v5 retourne data.navigation
          setMenuLinks(json.data.navigation || [])
        }
      } catch (error) {
        console.error("Erreur fetching global menu:", error)
      }
    }
    fetchGlobal()
  }, [])
  
  // La fonction handleValidateOrder (logique DB) vit dans CheckoutPage.jsx

  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      
      {/* --- HEADER --- */}
      <Box shadow="sm" borderBottomWidth="1px" borderColor="gray.100" position="sticky" top={0} zIndex={10} bg="white">
        <Container maxW="container.lg">
          <Flex justifyContent="space-between" alignItems="center" py={3}>
            {/* Logo */}
            <Heading as={RouterLink} to="/" size="md" color="brand.green">
              Webmecameal
            </Heading>

            {/* --- NAVIGATION DESKTOP (Liens Dynamiques) --- */}
            <HStack 
                as="nav" 
                spacing={6} 
                display={{ base: 'none', md: 'flex' }} 
                flex="1" 
                ml={8}
            >
              {menuLinks.map((link) => (
                <Link 
                  key={link.id} 
                  as={RouterLink} 
                  to={link.url} 
                  fontWeight="medium" 
                  color="brand.dark"
                  _hover={{ color: 'brand.orange', textDecoration: 'none' }}
                >
                  {link.label}
                </Link>
              ))}
            </HStack>
            
            {/* --- ACTIONS DROITE (Desktop) --- */}
            <Flex alignItems="center" display={{ base: 'none', md: 'flex' }}>
              {session ? (
                <HStack spacing={4}>
                  <Button as={RouterLink} to="/compte" variant="ghost" leftIcon={<FiUser />} size="sm">
                    Mon Compte
                  </Button>
                  <Button variant="ghost" onClick={onCartOpen} size="sm">
                    <FiShoppingCart />
                    <Text ml={2}>{itemCount}</Text>
                  </Button>
                  <Button colorScheme="gray" variant="outline" onClick={handleLogout} size="sm">
                    Déconnexion
                  </Button>
                </HStack>
              ) : (
                <Button as={RouterLink} to="/login" colorScheme="teal" size="sm">
                  Connexion / Inscription
                </Button>
              )}
            </Flex>

            {/* --- NAVIGATION MOBILE (Icônes + Burger) --- */}
            <HStack display={{ base: 'flex', md: 'none' }} spacing={2}>
               {session && (
                  <IconButton 
                    icon={<Flex align="center"><FiShoppingCart /><Text ml={1} fontSize="xs">{itemCount}</Text></Flex>}
                    variant="ghost"
                    onClick={onCartOpen}
                    aria-label="Ouvrir le panier"
                    size="sm"
                  />
               )}
               <IconButton 
                  icon={<FiMenu />} 
                  onClick={onMenuOpen} 
                  variant="outline"
                  aria-label="Ouvrir le menu"
                  size="sm"
               />
            </HStack>

          </Flex>
        </Container>
      </Box>
      
      {/* --- DRAWER MOBILE (Tiroir pour le Menu Burger) --- */}
      <Drawer isOpen={isMenuOpen} placement="right" onClose={onMenuClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={4} mt={4}>
              {/* Liens dynamiques dans le Drawer */}
              {menuLinks.map((link) => (
                 <Button key={link.id} as={RouterLink} to={link.url} justifyContent="flex-start" variant="ghost" onClick={onMenuClose}>
                    {link.label}
                 </Button>
              ))}
              <Divider />
              {session ? (
                <>
                  <Button as={RouterLink} to="/compte" leftIcon={<FiUser />} justifyContent="flex-start" variant="ghost" onClick={onMenuClose}>
                    Mon Compte
                  </Button>
                  <Button as={RouterLink} to="/admin" justifyContent="flex-start" variant="ghost" onClick={onMenuClose}>
                    Accès Admin
                  </Button>
                  <Divider />
                  <Button leftIcon={<FiLogOut />} colorScheme="red" variant="ghost" justifyContent="flex-start" onClick={handleLogout}>
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button as={RouterLink} to="/login" colorScheme="teal" w="full" onClick={onMenuClose}>
                  Connexion / Inscription
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* --- CONTENU PRINCIPAL --- */}
      <Box flex="1">
        <Outlet context={useOutletContext()} /> 
      </Box>

      {/* --- FOOTER --- */}
      <Box bg="gray.50" color="gray.600" mt={20}>
        <Container maxW="container.lg" py={10} textAlign="center">
          <Text>© 2025 Webmecameal. Tous droits réservés.</Text>
        </Container>
      </Box>

      {/* --- MODAL PANIER (Aperçu avant Checkout) --- */}
      <Modal isOpen={isCartOpen} onClose={onCartClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Votre Panier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {cartItems.length === 0 ? (
                <Text py={8} textAlign="center" color="gray.500">Votre panier est vide.</Text>
              ) : (
                cartItems.map((item) => (
                  <Flex 
                    key={item.id} 
                    justifyContent="space-between" 
                    alignItems="center" 
                    p={3} 
                    borderWidth="1px" 
                    borderRadius="md"
                  >
                    <Box>
                      <Heading size="sm" noOfLines={1}>{item.week_name}</Heading>
                      <Text fontSize="sm" color="gray.600">{item.price} €</Text>
                    </Box>
                    <HStack>
                      <IconButton icon={<FaMinus />} size="xs" onClick={() => updateQuantity(item.id, -1)} aria-label="Diminuer"/>
                      <Text fontWeight="bold" w="20px" textAlign="center">{item.quantity}</Text>
                      <IconButton icon={<FaPlus />} size="xs" onClick={() => updateQuantity(item.id, 1)} aria-label="Augmenter"/>
                      <IconButton icon={<FaTrash />} size="xs" colorScheme="red" variant="ghost" onClick={() => removeFromCart(item.id)} aria-label="Supprimer"/>
                    </HStack>
                  </Flex>
                ))
              )}
              
              {cartItems.length > 0 && (
                <Box pt={4} borderTopWidth="1px">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="lg">Total</Text>
                    <Heading size="md">{total.toFixed(2)} €</Heading>
                  </Flex>
                </Box>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onCartClose} mr={3}>
              Continuer les achats
            </Button>
            <Button 
              as={RouterLink}
              to="/checkout"
              colorScheme="green" 
              isDisabled={cartItems.length === 0}
              onClick={onCartClose}
            >
              Valider la commande
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}