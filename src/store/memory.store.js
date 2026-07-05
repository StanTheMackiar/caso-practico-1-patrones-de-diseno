
export const store = {
  faculties: [],
  professors: [],
  courses: [],
  students: [],
  projects: [],
  evaluations: []
};

export function add(collectionName, entity) {
  store[collectionName].push(entity);
  return entity;
}

export function findById(collectionName, id) {
  return store[collectionName].find((item) => item.id === id);
}

export function assertExists(collectionName, id, message) {
  const entity = findById(collectionName, id);

  if (!entity) {
    throw new Error(message);
  }

  return entity;
}

export function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}
