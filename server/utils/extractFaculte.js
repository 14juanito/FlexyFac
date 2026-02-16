// Fonction d'extraction de la faculté à partir du matricule
// Exemples : SIxxxxxx -> Info, DRxxxxxx -> Droit

/**
 * Extrait la faculté du matricule UPC
 * @param {string} matricule
 * @returns {string|null} Faculté ou null
 */
function extractFaculte(matricule) {
  if (!matricule || typeof matricule !== 'string') return null;
  const prefix = matricule.substring(0, 2).toUpperCase();
  switch (prefix) {
    case 'SI':
      return 'Info';
    case 'DR':
      return 'Droit';
    case 'EC':
      return 'Economie';
    case 'GE':
      return 'Gestion';
    // Ajoutez d'autres mappings si besoin
    default:
      return null;
  }
}

module.exports = extractFaculte;
