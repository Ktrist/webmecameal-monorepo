import { Box, Container, Heading, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react'

export default function Faq({ data }) {
  const questions = data.questions || []

  return (
    <Box py={20} bg="white">
      <Container maxW="container.md">
        <Heading textAlign="center" mb={10} size="xl">
          {data.titre || "Questions Fréquentes"}
        </Heading>

        <Accordion allowMultiple>
          {questions.map((q, idx) => (
            <AccordionItem key={idx} border="none" mb={4} bg="gray.50" borderRadius="lg">
              <h2>
                <AccordionButton _expanded={{ bg: 'brand.green', color: 'white' }} borderRadius="lg">
                  <Box as="span" flex='1' textAlign='left' fontWeight="bold" py={2}>
                    {q.question}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} color="gray.600" lineHeight="tall">
                 {/* Gestion du Rich Text CKEditor si besoin, sinon texte simple */}
                 <div dangerouslySetInnerHTML={{ __html: q.reponse }} />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Box>
  )
}