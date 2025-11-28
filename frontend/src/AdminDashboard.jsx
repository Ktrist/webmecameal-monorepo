import { Container, Heading, Text } from '@chakra-ui/react'

export default function AdminDashboard() {
  return (
    <Container py={10}>
      <Heading>Tableau de Bord Admin</Heading>
      <Text mt={4}>Bienvenue dans votre espace de gestion.</Text>
    </Container>
  )
}