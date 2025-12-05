import { Container, Heading, VStack, Text, Box, Divider, UnorderedList, ListItem } from '@chakra-ui/react'

export default function PrivacyPolicyPage() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack align="stretch" spacing={8}>
        <Heading size="xl" color="brand.green">Politique de Confidentialité (RGPD)</Heading>

        <Box>
          <Heading size="md" mb={3}>1. Introduction</Heading>
          <Text mb={3}>
            Webmecameal accorde une grande importance à la protection de vos données personnelles.
            Cette politique de confidentialité explique comment nous collectons, utilisons, stockons
            et protégeons vos informations personnelles conformément au Règlement Général sur la
            Protection des Données (RGPD).
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>2. Responsable du traitement</Heading>
          <Text mb={2}>
            <strong>Webmecameal</strong>
            <br />
            Siège social : Annecy, France
            <br />
            Email : contact@webmecameal.fr
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>3. Données collectées</Heading>
          <Text mb={3}>
            Nous collectons les données personnelles suivantes :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem><strong>Données d'identification :</strong> prénom, nom, adresse email</ListItem>
            <ListItem><strong>Données de contact :</strong> numéro de téléphone, adresse de livraison</ListItem>
            <ListItem><strong>Données de paiement :</strong> informations bancaires (traitées de manière sécurisée par Stripe)</ListItem>
            <ListItem><strong>Données de navigation :</strong> adresse IP, cookies, historique de navigation sur le site</ListItem>
            <ListItem><strong>Données de commande :</strong> historique des commandes, préférences alimentaires, sélections de menus</ListItem>
          </UnorderedList>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>4. Finalités du traitement</Heading>
          <Text mb={3}>
            Vos données personnelles sont collectées et traitées pour les finalités suivantes :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem>Gestion de votre compte client et authentification</ListItem>
            <ListItem>Traitement et suivi de vos commandes et abonnements</ListItem>
            <ListItem>Organisation des livraisons</ListItem>
            <ListItem>Traitement des paiements</ListItem>
            <ListItem>Communication relative à vos commandes (confirmations, notifications)</ListItem>
            <ListItem>Amélioration de nos services et personnalisation de votre expérience</ListItem>
            <ListItem>Respect de nos obligations légales et réglementaires</ListItem>
          </UnorderedList>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>5. Base légale du traitement</Heading>
          <Text mb={3}>
            Le traitement de vos données repose sur les bases légales suivantes :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem><strong>Exécution du contrat :</strong> pour la gestion de vos commandes et abonnements</ListItem>
            <ListItem><strong>Consentement :</strong> pour l'envoi d'emails marketing (si vous avez accepté)</ListItem>
            <ListItem><strong>Obligation légale :</strong> pour la comptabilité et la facturation</ListItem>
            <ListItem><strong>Intérêt légitime :</strong> pour l'amélioration de nos services</ListItem>
          </UnorderedList>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>6. Destinataires des données</Heading>
          <Text mb={3}>
            Vos données personnelles sont accessibles :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem>Aux équipes de Webmecameal (préparation, livraison, support client)</ListItem>
            <ListItem>À nos prestataires de services : Supabase (hébergement), Stripe (paiement), Vercel (hébergement web)</ListItem>
            <ListItem>Aux autorités compétentes sur demande légale</ListItem>
          </UnorderedList>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>7. Durée de conservation</Heading>
          <Text mb={3}>
            Vos données sont conservées pour les durées suivantes :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem><strong>Données de compte :</strong> tant que votre compte est actif</ListItem>
            <ListItem><strong>Données de commande :</strong> 3 ans après la dernière commande</ListItem>
            <ListItem><strong>Données de facturation :</strong> 10 ans (obligation légale)</ListItem>
            <ListItem><strong>Cookies :</strong> 13 mois maximum</ListItem>
          </UnorderedList>
          <Text mb={3}>
            Après ces délais, vos données sont supprimées ou anonymisées.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>8. Vos droits</Heading>
          <Text mb={3}>
            Conformément au RGPD, vous disposez des droits suivants :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</ListItem>
            <ListItem><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</ListItem>
            <ListItem><strong>Droit à l'effacement :</strong> demander la suppression de vos données</ListItem>
            <ListItem><strong>Droit à la limitation :</strong> limiter le traitement de vos données</ListItem>
            <ListItem><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</ListItem>
            <ListItem><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</ListItem>
            <ListItem><strong>Droit de retirer votre consentement :</strong> à tout moment</ListItem>
          </UnorderedList>
          <Text mb={3}>
            Pour exercer ces droits, contactez-nous à : contact@webmecameal.fr
          </Text>
          <Text mb={3}>
            Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (Commission
            Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{color: '#319795', textDecoration: 'underline'}}>www.cnil.fr</a>
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>9. Sécurité des données</Heading>
          <Text mb={3}>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
            protéger vos données contre la perte, l'utilisation abusive, l'accès non autorisé,
            la divulgation, l'altération ou la destruction.
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem>Chiffrement SSL/TLS pour toutes les communications</ListItem>
            <ListItem>Authentification sécurisée avec mots de passe hachés</ListItem>
            <ListItem>Accès restreint aux données (principe du moindre privilège)</ListItem>
            <ListItem>Sauvegardes régulières</ListItem>
            <ListItem>Hébergement chez des prestataires certifiés (ISO 27001, SOC 2)</ListItem>
          </UnorderedList>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>10. Cookies</Heading>
          <Text mb={3}>
            Nous utilisons des cookies pour :
          </Text>
          <UnorderedList spacing={2} mb={3}>
            <ListItem>Assurer le bon fonctionnement du site (cookies nécessaires)</ListItem>
            <ListItem>Maintenir votre session de connexion</ListItem>
            <ListItem>Mémoriser vos préférences</ListItem>
            <ListItem>Analyser l'utilisation du site pour l'améliorer</ListItem>
          </UnorderedList>
          <Text mb={3}>
            Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela pourrait
            affecter certaines fonctionnalités du site.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>11. Transferts de données hors UE</Heading>
          <Text mb={3}>
            Certains de nos prestataires (comme Stripe et Vercel) peuvent être situés hors de l'Union
            Européenne. Dans ce cas, nous veillons à ce que des garanties appropriées soient mises en
            place conformément au RGPD (clauses contractuelles types, certifications Privacy Shield, etc.).
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>12. Modifications de la politique</Heading>
          <Text mb={3}>
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
            Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour.
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="md" mb={3}>13. Contact</Heading>
          <Text mb={3}>
            Pour toute question concernant cette politique de confidentialité ou vos données personnelles,
            contactez-nous à :
          </Text>
          <Text mb={2}>
            Email : contact@webmecameal.fr
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
