/**
 * Configuration des zones de livraison Webmecameal
 *
 * Zone de livraison: Annecy et environs
 * Codes postaux et villes autorisés pour la livraison
 */

export const DELIVERY_ZONES = [
  { postalCode: '74000', cities: ['Annecy'] },
  { postalCode: '74370', cities: ['Annecy-le-Vieux', 'Metz-Tessy', 'Pringy', 'Épagny', 'Épagny-Metz-Tessy'] },
  { postalCode: '74600', cities: ['Seynod', 'Annecy'] },
  { postalCode: '74940', cities: ['Annecy-le-Vieux'] },
  { postalCode: '74960', cities: ['Cran-Gevrier', 'Meythet'] },
]

// Flatten postal codes for easy access
export const VALID_POSTAL_CODES = DELIVERY_ZONES.map(zone => zone.postalCode)

// Flatten cities for search (normalized)
const ALL_CITIES = DELIVERY_ZONES.flatMap(zone =>
  zone.cities.map(city => ({
    name: city,
    normalizedName: normalizeString(city),
    postalCode: zone.postalCode
  }))
)

/**
 * Normalize a string for comparison (remove accents, lowercase, trim)
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Keep only letters and numbers
    .trim()
}

/**
 * Vérifie si un code postal est dans la zone de livraison
 * @param {string} postalCode - Code postal à vérifier (5 chiffres)
 * @returns {boolean} - true si livrable, false sinon
 */
export function isDeliverable(postalCode) {
  if (!postalCode) return false

  // Nettoyer le code postal (enlever espaces, tirets)
  const cleanedCode = postalCode.toString().trim().replace(/[\s-]/g, '')

  // Vérifier si c'est bien 5 chiffres
  if (!/^\d{5}$/.test(cleanedCode)) return false

  return VALID_POSTAL_CODES.includes(cleanedCode)
}

/**
 * Vérifie si une ville est dans la zone de livraison
 * @param {string} cityName - Nom de la ville à vérifier
 * @returns {Object|null} - { postalCode, cityName } si trouvé, null sinon
 */
export function findCityInZones(cityName) {
  if (!cityName || cityName.trim() === '') return null

  const normalized = normalizeString(cityName)

  const found = ALL_CITIES.find(city => city.normalizedName === normalized)
  return found ? { postalCode: found.postalCode, cityName: found.name } : null
}

/**
 * Vérifie si une entrée (code postal OU ville) est dans la zone
 * @param {string} input - Code postal ou nom de ville
 * @returns {Object} - { isValid, postalCode, cityName, type }
 */
export function validateDeliveryInput(input) {
  if (!input || input.trim() === '') {
    return { isValid: false, type: 'empty' }
  }

  const cleaned = input.trim().replace(/[\s-]/g, '')

  // Check if it's a postal code (5 digits)
  if (/^\d{5}$/.test(cleaned)) {
    const isValid = isDeliverable(cleaned)
    if (isValid) {
      const zone = DELIVERY_ZONES.find(z => z.postalCode === cleaned)
      return {
        isValid: true,
        postalCode: cleaned,
        cityName: zone.cities[0],
        type: 'postalCode'
      }
    }
    return { isValid: false, postalCode: cleaned, type: 'postalCode' }
  }

  // Check if it's a city name
  const cityResult = findCityInZones(input)
  if (cityResult) {
    return {
      isValid: true,
      postalCode: cityResult.postalCode,
      cityName: cityResult.cityName,
      type: 'city'
    }
  }

  return { isValid: false, type: 'unknown' }
}

/**
 * Obtient un message d'erreur personnalisé pour un code postal
 * @param {string} input - Code postal ou ville non livrable
 * @returns {string} - Message d'erreur
 */
export function getDeliveryErrorMessage(input) {
  if (!input || input.trim() === '') {
    return 'Veuillez entrer votre code postal ou votre ville'
  }

  const result = validateDeliveryInput(input)

  if (result.type === 'postalCode' && !result.isValid) {
    return `Désolé, nous ne livrons pas encore au code postal ${result.postalCode}. Consultez la liste des zones desservies ci-dessous.`
  }

  if (result.type === 'city' || result.type === 'unknown') {
    return `Désolé, nous ne livrons pas encore à "${input}". Consultez la liste des zones desservies ci-dessous.`
  }

  return 'Cette zone n\'est pas encore desservie.'
}

/**
 * Obtient un message de succès pour un code postal livrable
 * @param {Object} result - Résultat de validateDeliveryInput
 * @returns {string} - Message de succès
 */
export function getDeliverySuccessMessage(result) {
  if (result.type === 'postalCode') {
    return `Parfait ! Nous livrons au ${result.postalCode} (${result.cityName})`
  }
  return `Parfait ! Nous livrons à ${result.cityName} (${result.postalCode})`
}

/**
 * Obtient une liste formatée des zones de livraison
 * @returns {string} - Liste formatée
 */
export function getDeliveryZonesList() {
  return DELIVERY_ZONES.map(zone =>
    `${zone.postalCode} (${zone.cities.join(', ')})`
  ).join(' • ')
}
