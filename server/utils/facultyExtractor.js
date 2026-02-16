/**
 * Logique intelligente : Extraction de la faculté depuis le matricule
 * Format attendu : XX2024XXX (ex: SI2024001, DR2024002, MD2024003)
 */

const FACULTY_MAP = {
  'SI': 'Info',
  'DR': 'Droit',
  'MD': 'Medecine',
  'GC': 'Genie Civil',
  'EC': 'Economie',
  'LT': 'Lettres'
};

/**
 * Extrait le code faculté du matricule
 * @param {string} matricule - Le matricule de l'étudiant
 * @returns {string|null} - Le nom de la faculté ou null
 */
function extractFacultyFromMatricule(matricule) {
  if (!matricule || typeof matricule !== 'string') {
    return null;
  }

  // Extraction des 2 premiers caractères
  const facultyCode = matricule.substring(0, 2).toUpperCase();
  
  return FACULTY_MAP[facultyCode] || null;
}

/**
 * Extrait l'année de promotion du matricule
 * @param {string} matricule - Le matricule de l'étudiant
 * @returns {string|null} - L'année de promotion
 */
function extractPromotionYear(matricule) {
  if (!matricule || typeof matricule !== 'string' || matricule.length < 6) {
    return null;
  }

  // Extraction des caractères 3 à 6 (année)
  return matricule.substring(2, 6);
}

/**
 * Valide le format du matricule
 * @param {string} matricule - Le matricule à valider
 * @returns {boolean}
 */
function validateMatriculeFormat(matricule) {
  // Format: 2 lettres + 4 chiffres + 3 chiffres minimum
  const regex = /^[A-Z]{2}\d{4}\d{3,}$/i;
  return regex.test(matricule);
}

module.exports = {
  extractFacultyFromMatricule,
  extractPromotionYear,
  validateMatriculeFormat,
  FACULTY_MAP
};
