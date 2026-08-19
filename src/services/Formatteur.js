/**
 * Formate un nombre d'abonnés ou de vues au format court (ex: 3300 -> 3,3k, 1200000 -> 1,2M).
 * @param {string|number} nombre - Le nombre à formater.
 * @return {string} Le nombre formaté.
 */
export const formaterNombre = (nombre) => {
    const num = parseInt(nombre, 10);

    if (isNaN(num)) return '0';

    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    }

    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    }

    return num.toString();
};

/**
 * Formate une date au format français (ex: "17 août 2026").
 * @param {string} dateString - La date au format ISO.
 * @return {string} La date formatée.
 */
export const formaterDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};