const TROOP_TRANSLATIONS = {
  shieldbearer: 'Lính khiên',
  bomber: 'Lính ném bom',
  shooter: 'Lính súng',
};

export function troopName(troop, language) {
  return language === 'vi' ? TROOP_TRANSLATIONS[troop] : troop.charAt(0).toUpperCase() + troop.slice(1);
}
