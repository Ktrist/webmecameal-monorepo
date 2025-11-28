import { Box, Container, Flex, Heading, Link, VStack } from '@chakra-ui/react'
import { Link as RouterLink, Outlet, useOutletContext } from 'react-router-dom'

// La barre latérale de navigation de l'admin
function AdminSidebar() {
  return (
    <Box w="250px" bg="gray.50" p={4} h="calc(100vh - 60px)" borderRightWidth="1px">
      <VStack align="stretch" spacing={4}>
        <Heading size="sm">Gestion</Heading>
        <Link as={RouterLink} to="/admin" _hover={{ textDecor: 'none', bg: 'gray.200' }} p={2} borderRadius="md">
          Tableau de Bord
        </Link>
        <Link as={RouterLink} to="/admin/menus" _hover={{ textDecor: 'none', bg: 'gray.200' }} p={2} borderRadius="md">
          Gérer les Menus
        </Link>
        <Link as={RouterLink} to="/admin/commandes" _hover={{ textDecor: 'none', bg: 'gray.200' }} p={2} borderRadius="md">
          Voir les Commandes
        </Link>
      </VStack>
    </Box>
  )
}

// Le Header de l'admin (simple)
function AdminHeader() {
  return (
    <Box w="full" h="60px" bg="white" borderBottomWidth="1px" px={4}>
      <Flex h="full" alignItems="center">
        <Heading size="md" color="brand.green">Admin - Webmecameal</Heading>
        {/* On pourrait ajouter un bouton "Déconnexion" ici */}
      </Flex>
    </Box>
  )
}

// Le composant Layout principal
export default function AdminLayout() {
  return (
    <Flex direction="column" h="100vh">
      <AdminHeader />
      <Flex h="full">
        <AdminSidebar />
        <Box flex="1" p={8} overflowY="auto">
          {/* Les pages (Dashboard, Menus, Commandes) s'affichent ici */}
          <Outlet context={useOutletContext()} />
        </Box>
      </Flex>
    </Flex>
  )
}