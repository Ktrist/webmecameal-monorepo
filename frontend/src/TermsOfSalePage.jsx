import { Container, Heading, VStack, Text, Box, Divider, UnorderedList, ListItem } from '@chakra-ui/react'

export default function TermsOfSalePage() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack align="stretch" spacing={8}>
        <Heading size="xl" color="brand.green">Conditions Générales de Vente (CGV)</Heading>

        <Box>
          <Heading size="md" mb={3}>1. Objet</Heading>
          <Text mb={3}>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles
            entre Webmecameal et ses clients dans le cadre de la vente de repas livrés en entreprise
            par le biais d'un service d'abonnement.
          </Text>
          <Text mb={3}>
            Toute commande implique l'acceptation sans réserve des présentes CGV.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>2. Produits et services</Heading>
          <Text mb={3}>
            Webmecameal propose un service d'abonnement permettant aux entreprises de faire
            bénéficier leurs collaborateurs de repas quotidiens livrés sur leur lieu de travail.
          </Text>
          <Text mb={3}>
            Les menus proposés sont consultables sur le site et peuvent varier selon la disponibilité
            des produits et les saisons.
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem>Abonnement hebdomadaire 2 jours</ListItem>
            <ListItem>Abonnement hebdomadaire 3 jours</ListItem>
            <ListItem>Abonnement hebdomadaire 5 jours</ListItem>
            <ListItem>Abonnement mensuel</ListItem>
          </UnorderedList>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>3. Prix et paiement</Heading>
          <Text mb={3}>
            Les prix sont indiqués en euros TTC. Webmecameal se réserve le droit de modifier ses prix
            à tout moment, étant entendu que le prix figurant au catalogue le jour de la commande sera
            le seul applicable à l'acheteur.
          </Text>
          <Text mb={3}>
            Le paiement s'effectue de manière sécurisée par carte bancaire via notre prestataire
            Stripe. L'abonnement est renouvelé automatiquement jusqu'à résiliation.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>4. Zone de livraison</Heading>
          <Text mb={3}>
            Webmecameal livre uniquement dans la zone d'Annecy et ses environs :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem>74000 - Annecy</ListItem>
            <ListItem>74370 - Annecy-le-Vieux, Metz-Tessy, Pringy, Épagny</ListItem>
            <ListItem>74600 - Seynod</ListItem>
            <ListItem>74940 - Annecy-le-Vieux</ListItem>
            <ListItem>74960 - Cran-Gevrier, Meythet</ListItem>
          </UnorderedList>
          <Text mb={3}>
            Les livraisons sont effectuées uniquement les jours ouvrés (du lundi au vendredi), entre
            11h30 et 12h30, directement sur le lieu de travail indiqué lors de la commande.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>5. Modalités de livraison</Heading>
          <Text mb={3}>
            Les repas sont livrés frais et prêts à être consommés. Il est de la responsabilité du
            client de s'assurer que quelqu'un soit présent pour réceptionner la livraison.
          </Text>
          <Text mb={3}>
            En cas d'absence, Webmecameal ne pourra être tenu responsable et aucun remboursement
            ne sera effectué.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>6. Droit de rétractation</Heading>
          <Text mb={3}>
            Conformément aux dispositions de l'article L.221-28 du Code de la consommation, le droit
            de rétractation ne peut être exercé pour les denrées alimentaires périssables.
          </Text>
          <Text mb={3}>
            Toutefois, vous pouvez suspendre ou annuler votre abonnement à tout moment depuis votre
            espace personnel. La suspension prend effet à la fin de la période d'abonnement en cours.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>7. Gestion de l'abonnement</Heading>
          <Text mb={3}>
            <strong>Pause de l'abonnement :</strong> Vous pouvez suspendre votre abonnement. Il sera
            automatiquement annulé à la fin de la période payée.
          </Text>
          <Text mb={3}>
            <strong>Réactivation :</strong> Vous pouvez réactiver votre abonnement suspendu à tout
            moment avant la fin de la période en cours.
          </Text>
          <Text mb={3}>
            <strong>Annulation immédiate :</strong> Vous pouvez annuler votre abonnement immédiatement.
            Aucun remboursement ne sera effectué pour la période en cours.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>8. Réclamations</Heading>
          <Text mb={3}>
            En cas de non-conformité d'un produit, le client doit formuler sa réclamation par email
            à contact@webmecameal.fr dans les 24 heures suivant la livraison.
          </Text>
          <Text mb={3}>
            Après examen, Webmecameal s'engage à remplacer le produit défectueux ou à rembourser
            le client si le remplacement n'est pas possible.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>9. Responsabilité</Heading>
          <Text mb={3}>
            Webmecameal s'engage à fournir des produits conformes aux normes d'hygiène et de sécurité
            alimentaire en vigueur. La société ne saurait être tenue responsable en cas de mauvaise
            conservation du produit après livraison.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>10. Protection des données personnelles</Heading>
          <Text mb={3}>
            Les données personnelles collectées sont traitées conformément au RGPD. Pour plus
            d'informations, consultez notre Politique de Confidentialité.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>11. Droit applicable et juridiction</Heading>
          <Text mb={3}>
            Les présentes CGV sont soumises au droit français. En cas de litige, et à défaut de
            solution amiable, le différend sera porté devant les tribunaux compétents.
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
