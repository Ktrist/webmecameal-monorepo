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
  isDeliverable,
  getDeliveryErrorMessage,
  getDeliverySuccessMessage,
  DELIVERY_ZONES,
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
  const [postalCode, setPostalCode] = useState(initialValue)
  const [validationResult, setValidationResult] = useState(null) // null | 'valid' | 'invalid'
  const [errorMessage, setErrorMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  const handleCheck = () => {
    setIsChecking(true)

    // Simuler un léger délai pour l'UX
    setTimeout(() => {
      const isValid = isDeliverable(postalCode)

      setValidationResult(isValid ? 'valid' : 'invalid')

      if (isValid) {
        setErrorMessage('')
        if (onValidZone) onValidZone(postalCode)
      } else {
        const message = getDeliveryErrorMessage(postalCode)
        setErrorMessage(message)
        if (onInvalidZone) onInvalidZone(postalCode)
      }

      setIsChecking(false)
    }, 300)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setPostalCode(value)
    // Reset la validation quand on modifie
    setValidationResult(null)
    setErrorMessage('')
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
            placeholder="Ex: 74000"
            value={postalCode}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            maxLength={5}
            pattern="[0-9]*"
            inputMode="numeric"
            bg="white"
            borderColor={
              validationResult === 'valid'
                ? 'green.400'
                : validationResult === 'invalid'
                ? 'red.400'
                : 'gray.300'
            }
            _focus={{
              borderColor:
                validationResult === 'valid'
                  ? 'green.500'
                  : validationResult === 'invalid'
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
            Zones livrables : {DELIVERY_ZONES.join(', ')}
          </Text>
        )}
      </FormControl>

      {/* Résultat de validation */}
      {validationResult === 'valid' && (
        <Alert status="success" mt={4} borderRadius="md">
          <AlertIcon as={FiCheck} />
          <Box>
            <AlertTitle>Zone de livraison valide !</AlertTitle>
            <AlertDescription>{getDeliverySuccessMessage()}</AlertDescription>
          </Box>
        </Alert>
      )}

      {validationResult === 'invalid' && (
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
