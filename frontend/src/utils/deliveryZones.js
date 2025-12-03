/**
 * Configuration des zones de livraison Webmecameal
 *
 * Zone de livraison: Annecy et environs
 * Codes postaux autorisés pour la livraison
 */

export const DELIVERY_ZONES = [
  '74000', // Annecy
  '74370', // Annecy-le-Vieux / Metz-Tessy / Pringy / Épagny-Metz-Tessy
  '74600', // Seynod / Annecy (secteur)
  '74940', // Annecy-le-Vieux
  '74960', // Cran-Gevrier / Meythet
]

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

  return DELIVERY_ZONES.includes(cleanedCode)
}

/**
 * Obtient un message d'erreur personnalisé pour un code postal
 * @param {string} postalCode - Code postal non livrable
 * @returns {string} - Message d'erreur
 */
export function getDeliveryErrorMessage(postalCode) {
  if (!postalCode || postalCode.trim() === '') {
    return 'Veuillez entrer votre code postal'
  }

  const cleanedCode = postalCode.toString().trim().replace(/[\s-]/g, '')

  if (!/^\d{5}$/.test(cleanedCode)) {
    return 'Le code postal doit contenir 5 chiffres'
  }

  return `Désolé, nous ne livrons pas encore au code postal ${cleanedCode}. Notre zone de livraison actuelle couvre Annecy et ses environs (${DELIVERY_ZONES.join(', ')}).`
}

/**
 * Obtient un message de succès pour un code postal livrable
 * @returns {string} - Message de succès
 */
export function getDeliverySuccessMessage() {
  return '✓ Bonne nouvelle ! Nous livrons dans votre zone'
}
