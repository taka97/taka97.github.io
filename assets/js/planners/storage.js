const DATABASE_NAME = 'lands-of-jail-tools';
const DATABASE_VERSION = 1;
const LEGACY_DATABASE_NAME = 'forticlad-planner';

export async function createProfileStore() {
  const database = await openDatabase();
  await migrateLegacyForticladProfiles(database);

  return {
    async listProfiles() {
      return requestToPromise(database.transaction('profiles').objectStore('profiles').getAll());
    },
    async saveProfile(profile) {
      const normalized = normalizeProfile(profile);
      await completeTransaction(database.transaction('profiles', 'readwrite'), (stores) => stores.profiles.put(normalized));
      return normalized;
    },
    async deleteProfile(id) {
      await completeTransaction(database.transaction(['profiles', 'settings'], 'readwrite'), (stores) => {
        stores.profiles.delete(id);
        stores.settings.get('selectedProfileId').onsuccess = (event) => {
          if (event.target.result?.value === id) stores.settings.delete('selectedProfileId');
        };
      });
    },
    async getSelectedProfileId() {
      const setting = await requestToPromise(database.transaction('settings').objectStore('settings').get('selectedProfileId'));
      return setting?.value ?? null;
    },
    async setSelectedProfileId(id) {
      await completeTransaction(database.transaction('settings', 'readwrite'), (stores) => stores.settings.put({ key: 'selectedProfileId', value: id }));
    },
    async replaceProfiles(profiles) {
      const normalized = profiles.map(normalizeProfile);
      if (new Set(normalized.map((profile) => profile.id)).size !== normalized.length) {
        throw new TypeError('The backup contains duplicate profile IDs.');
      }
      await completeTransaction(database.transaction(['profiles', 'settings'], 'readwrite'), (stores) => {
        stores.profiles.clear();
        stores.settings.clear();
        normalized.forEach((profile) => stores.profiles.put(profile));
        if (normalized[0]) stores.settings.put({ key: 'selectedProfileId', value: normalized[0].id });
      });
      return normalized;
    },
  };
}

export function normalizeProfile(profile) {
  const server = String(profile?.server ?? '').trim();
  const name = String(profile?.name ?? '').trim();
  if (!server || !name) throw new TypeError('Server and name are required.');

  const now = new Date().toISOString();
  return {
    id: profile?.id || crypto.randomUUID(),
    server,
    name,
    tools: structuredClone(profile?.tools ?? {}),
    createdAt: profile?.createdAt ?? now,
    updatedAt: now,
  };
}

export function getToolData(profile, tool) {
  const data = profile?.tools?.[tool] ?? {};
  if (tool !== 'forticlad') return data;
  return {
    ...data,
    fcOnHand: Number.isInteger(data.fcOnHand) ? data.fcOnHand : data.coreOnHand,
    afcOnHand: Number.isInteger(data.afcOnHand) ? data.afcOnHand : undefined,
    ...(data.buildingBases ? { buildingBases: migrateBoomerBarrackKey(data.buildingBases) } : {}),
  };
}

function migrateBoomerBarrackKey(buildingBases) {
  if (!buildingBases['boomer-barrack']) return buildingBases;
  const { 'boomer-barrack': legacy, ...rest } = buildingBases;
  return { ...rest, 'bomber-barrack': legacy };
}

export function updateToolData(profile, tool, data) {
  return {
    ...profile,
    tools: {
      ...(profile?.tools ?? {}),
      [tool]: structuredClone(data),
    },
  };
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () => reject(request.error || new Error('Browser storage is unavailable.'));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('profiles')) database.createObjectStore('profiles', { keyPath: 'id' });
      if (!database.objectStoreNames.contains('settings')) database.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function migrateLegacyForticladProfiles(database) {
  if (!indexedDB.databases) return;
  const databases = await indexedDB.databases();
  if (!databases.some((entry) => entry.name === LEGACY_DATABASE_NAME)) return;

  const marker = await requestToPromise(database.transaction('settings').objectStore('settings').get('migration:forticlad-planner-v1'));
  if (marker) return;

  const legacyDatabase = await openExistingDatabase(LEGACY_DATABASE_NAME);
  const legacyTransaction = legacyDatabase.transaction(['profiles', 'settings']);
  const [legacyProfiles, legacySelection] = await Promise.all([
    requestToPromise(legacyTransaction.objectStore('profiles').getAll()),
    requestToPromise(legacyTransaction.objectStore('settings').get('selectedProfileId')),
  ]);
  legacyDatabase.close();

  await completeTransaction(database.transaction(['profiles', 'settings'], 'readwrite'), (stores) => {
    legacyProfiles.forEach((legacyProfile) => {
      const profile = normalizeProfile(legacyProfile);
      const currentBase = legacyProfile.forticlad?.currentBase;
      stores.profiles.put(currentBase ? updateToolData(profile, 'forticlad', { currentBase }) : profile);
    });
    if (legacySelection?.value && legacyProfiles.some((profile) => profile.id === legacySelection.value)) {
      stores.settings.put({ key: 'selectedProfileId', value: legacySelection.value });
    }
    stores.settings.put({ key: 'migration:forticlad-planner-v1', value: true });
  });
}

function openExistingDatabase(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function completeTransaction(transaction, action) {
  return new Promise((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Browser storage could not save changes.'));
    transaction.oncomplete = () => resolve();
    action(Object.fromEntries([...transaction.objectStoreNames].map((name) => [name, transaction.objectStore(name)])));
  });
}
