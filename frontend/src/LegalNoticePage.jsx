import { Container, Heading, VStack, Text, Box, Divider } from '@chakra-ui/react'

export default function LegalNoticePage() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack align="stretch" spacing={8}>
        <Heading size="xl" color="brand.green">Mentions Légales</Heading>

        <Box>
          <Heading size="md" mb={3}>1. Informations légales</Heading>
          <Text mb={2}>
            <strong>Nom de l'entreprise :</strong> Webmecameal
          </Text>
          <Text mb={2}>
            <strong>Forme juridique :</strong> [À compléter]
          </Text>
          <Text mb={2}>
            <strong>Capital social :</strong> [À compléter]
          </Text>
          <Text mb={2}>
            <strong>Siège social :</strong> Annecy, France
          </Text>
          <Text mb={2}>
            <strong>Numéro SIRET :</strong> [À compléter]
          </Text>
          <Text mb={2}>
            <strong>Numéro TVA intracommunautaire :</strong> [À compléter]
          </Text>
          <Text mb={2}>
            <strong>Email :</strong> contact@webmecameal.fr
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>2. Directeur de la publication</Heading>
          <Text>
            Le directeur de la publication du site est : [Nom du directeur]
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>3. Hébergement</Heading>
          <Text mb={2}>
            Le site est hébergé par :
          </Text>
          <Text mb={2}>
            <strong>Supabase</strong>
            <br />
            970 Toa Payoh North #07-04
            <br />
            Singapore 318992
          </Text>
          <Text mb={4}>
            <strong>Vercel Inc.</strong>
            <br />
            440 N Barranca Ave #4133
            <br />
            Covina, CA 91723
            <br />
            États-Unis
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>4. Propriété intellectuelle</Heading>
          <Text mb={3}>
            L'ensemble du contenu de ce site (textes, images, vidéos, etc.) est la propriété
            exclusive de Webmecameal, sauf mention contraire.
          </Text>
          <Text mb={3}>
            Toute reproduction, distribution, modification, adaptation, retransmission ou publication
            de ces différents éléments est strictement interdite sans l'accord exprès par écrit de
            Webmecameal.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>5. Données personnelles</Heading>
          <Text mb={3}>
            Les informations recueillies sur ce site sont enregistrées dans un fichier informatisé
            par Webmecameal pour la gestion des commandes et des abonnements.
          </Text>
          <Text mb={3}>
            Conformément à la loi « Informatique et Libertés » et au Règlement Général sur la
            Protection des Données (RGPD), vous pouvez exercer votre droit d'accès aux données
            vous concernant et les faire rectifier en contactant : contact@webmecameal.fr
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>6. Cookies</Heading>
          <Text mb={3}>
            Ce site utilise des cookies nécessaires à son bon fonctionnement et pour améliorer
            votre expérience utilisateur. En naviguant sur ce site, vous acceptez l'utilisation
            de ces cookies.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>7. Litiges</Heading>
          <Text mb={3}>
            Les présentes mentions légales sont régies par le droit français. En cas de litige et
            à défaut d'accord amiable, le litige sera porté devant les tribunaux français
            conformément aux règles de compétence en vigueur.
          </Text>
        </Box>

        <Box mt={8} p={4} bg="blue.50" borderRadius="md">
          <Text fontSize="sm" color="gray.600">
            Dernière mise à jour : Janvier 2025
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}
