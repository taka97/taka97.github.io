// One-time manual migration: converts each profile's Robots & Satellites robot
// slots from the old array (position-based) storage shape to the new object
// shape keyed by stable "robot_1", "robot_2", ... ids.
//
// Before running: export a backup from the site's Settings page (Backup ->
// Export), in case anything needs to be restored.
//
// How to run: open the site in a browser tab (any /en/ or /vi/ page, since
// IndexedDB is scoped to the origin), open DevTools console, paste this whole
// file, and press Enter. It only touches profiles whose robots-satellites data
// is still in the old array shape; everything else is left untouched.

(async () => {
  const ROBOT_KEY_PREFIX = 'robot_';
  const robotKey = (index) => `${ROBOT_KEY_PREFIX}${index + 1}`;

  const { createProfileStore, getToolData, updateToolData } = await import('/assets/js/planners/storage.js');
  const store = await createProfileStore();
  const profiles = await store.listProfiles();

  let migrated = 0;
  let skipped = 0;

  for (const profile of profiles) {
    const toolData = getToolData(profile, 'robots-satellites');
    if (!Array.isArray(toolData.robots)) {
      skipped += 1;
      continue;
    }
    // 12 matches caps.robots in _data/lands_of_jail/robots_satellites.yml.
    const robots = Object.fromEntries(toolData.robots.slice(0, 12).map((instance, index) => [robotKey(index), instance]));
    await store.saveProfile(updateToolData(profile, 'robots-satellites', { ...toolData, robots }));
    migrated += 1;
    console.log(`Migrated profile "${profile.server} — ${profile.name}" (${toolData.robots.length} robot slot(s)).`);
  }

  console.log(`Done. Migrated ${migrated} profile(s), skipped ${skipped} (already migrated or no robots-satellites data).`);
})();
