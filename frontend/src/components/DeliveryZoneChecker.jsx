import { useState } from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  Text,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { FiMapPin, FiCheck, FiX } from 'react-icons/fi'
import {
  validateDeliveryInput,
  getDeliveryErrorMessage,
  getDeliverySuccessMessage,
  getDeliveryZonesList,
} from '../utils/deliveryZones'

/**
 * Composant de vérification de zone de livraison
 *
 * @param {Object} props
 * @param {Function} props.onValidZone - Callback appelé quand le CP est valide (postalCode)
 * @param {Function} props.onInvalidZone - Callback appelé quand le CP est invalide (postalCode)
 * @param {boolean} props.showZonesList - Afficher la liste des zones livrables
 * @param {boolean} props.required - Si le champ est requis
 * @param {string} props.initialValue - Valeur initiale du code postal
 */
export default function DeliveryZoneChecker({
  onValidZone,
  onInvalidZone,
  showZonesList = true,
  required = false,
  initialValue = '',
}) {
  const [input, setInput] = useState(initialValue)
  const [validationResult, setValidationResult] = useState(null) // null | { isValid, postalCode, cityName, type }
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  const handleCheck = () => {
    setIsChecking(true)

    // Simuler un léger délai pour l'UX
    setTimeout(() => {
      const result = validateDeliveryInput(input)

      setValidationResult(result)

      if (result.isValid) {
        setErrorMessage('')
        setSuccessMessage(getDeliverySuccessMessage(result))
        if (onValidZone) onValidZone(result.postalCode)
      } else {
        const message = getDeliveryErrorMessage(input)
        setErrorMessage(message)
        setSuccessMessage('')
        if (onInvalidZone) onInvalidZone(input)
      }

      setIsChecking(false)
    }, 300)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)
    // Reset la validation quand on modifie
    setValidationResult(null)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCheck()
    }
  }

  return (
    <Box>
      <FormControl isRequired={required}>
        <FormLabel display="flex" alignItems="center" gap={2}>
          <Icon as={FiMapPin} />
          Vérifiez votre zone de livraison
        </FormLabel>

        <Flex gap={2}>
          <Input
            type="text"
            placeholder="Ex: 74000 ou Annecy"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            bg="white"
            borderColor={
              validationResult?.isValid
                ? 'green.400'
                : validationResult && !validationResult.isValid
                ? 'red.400'
                : 'gray.300'
            }
            _focus={{
              borderColor:
                validationResult?.isValid
                  ? 'green.500'
                  : validationResult && !validationResult.isValid
                  ? 'red.500'
                  : 'brand.green',
            }}
          />
          <Button
            onClick={handleCheck}
            colorScheme="teal"
            isLoading={isChecking}
            loadingText="Vérification..."
            minW="120px"
          >
            Vérifier
          </Button>
        </Flex>

        {showZonesList && !validationResult && (
          <Text fontSize="sm" color="gray.600" mt={2}>
            {getDeliveryZonesList()}
          </Text>
        )}
      </FormControl>

      {/* Résultat de validation */}
      {validationResult?.isValid && (
        <Alert status="success" mt={4} borderRadius="md">
          <AlertIcon as={FiCheck} />
          <Box>
            <AlertTitle>Zone de livraison valide !</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Box>
        </Alert>
      )}

      {validationResult && !validationResult.isValid && (
        <Alert status="error" mt={4} borderRadius="md">
          <AlertIcon as={FiX} />
          <Box>
            <AlertTitle>Zone non desservie</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  )
}
