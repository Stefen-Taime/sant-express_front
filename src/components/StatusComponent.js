// Ce fichier contient la logique pour StatusComponent.vue
// Il peut être utilisé pour centraliser la logique complexe ou effectuer des calculs

/**
 * Formatte une date au format local français
 * @param {string} dateString - La date au format ISO 
 * @param {boolean} includeTime - Inclure l'heure dans le format
 * @returns {string} - La date formattée
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('fr-CA', options).format(date);
}

/**
 * Obtient la classe CSS pour un taux d'occupation donné
 * @param {number} taux - Le taux d'occupation
 * @returns {string} - La classe CSS correspondante
 */
export function getOccupationClass(taux) {
  if (!taux && taux !== 0) return '';
  
  if (taux < 80) return 'text-green-600 dark:text-green-400';
  if (taux < 100) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Obtient le texte de statut pour un taux d'occupation donné
 * @param {number} taux - Le taux d'occupation
 * @returns {string} - Le texte de statut
 */
export function getStatusText(taux) {
  if (!taux && taux !== 0) return 'Inconnu';
  
  if (taux < 80) return 'Normal';
  if (taux < 100) return 'Occupé';
  return 'Saturé';
}

/**
 * Obtient la classe CSS pour un statut de taux d'occupation
 * @param {number} taux - Le taux d'occupation
 * @returns {string} - La classe CSS pour l'élément de statut
 */
export function getStatusClass(taux) {
  if (!taux && taux !== 0) {
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
  
  if (taux < 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (taux < 100) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

/**
 * Calcule la moyenne des valeurs d'un tableau
 * @param {Array<number>} values - Tableau de valeurs numériques
 * @returns {number} - La moyenne arrondie
 */
export function calculateAverage(values) {
  if (!values || values.length === 0) return 0;
  
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / validValues.length);
}

/**
 * Calcule la valeur maximale d'un tableau
 * @param {Array<number>} values - Tableau de valeurs numériques
 * @returns {number} - La valeur maximale
 */
export function calculateMax(values) {
  if (!values || values.length === 0) return 0;
  
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return 0;
  
  return Math.round(Math.max(...validValues));
}

/**
 * Calcule la valeur minimale d'un tableau
 * @param {Array<number>} values - Tableau de valeurs numériques
 * @returns {number} - La valeur minimale
 */
export function calculateMin(values) {
  if (!values || values.length === 0) return 0;
  
  const validValues = values.filter(v => v !== null && v !== undefined);
  if (validValues.length === 0) return 0;
  
  return Math.round(Math.min(...validValues));
}