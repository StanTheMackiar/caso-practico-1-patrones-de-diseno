import { database } from '../store/database.store.js';

export function list(collectionName) {
  return database.listRows(collectionName).map((row) => toAppEntity(collectionName, row));
}

export function add(collectionName, entity) {
  const row = toDatabaseRow(collectionName, entity);
  database.insertRow(collectionName, row);
  return toAppEntity(collectionName, row);
}

export function findById(collectionName, id) {
  const row = database.findRow(collectionName, id);
  return row ? toAppEntity(collectionName, row) : undefined;
}

export function save(collectionName, entity) {
  database.updateRow(collectionName, entity.id, toDatabaseRow(collectionName, entity));
  return entity;
}

export function assertExists(collectionName, id, message) {
  const entity = findById(collectionName, id);
  if (!entity) throw new Error(message);
  return entity;
}

export function addUnique(list, value) {
  if (!list.includes(value)) list.push(value);
}

function toDatabaseRow(collectionName, entity) {
  if (collectionName === 'professors') {
    return { id: entity.id, name: entity.name, email: entity.email, faculty_id: entity.facultyId, project_id: entity.projectId, created_at: entity.createdAt };
  }

  if (collectionName === 'courses') {
    return { id: entity.id, name: entity.name, faculty_id: entity.facultyId, professor_id: entity.professorId, student_ids: entity.studentIds, created_at: entity.createdAt };
  }

  if (collectionName === 'students') {
    return { id: entity.id, name: entity.name, email: entity.email, country: entity.country, course_ids: entity.courseIds, project_ids: entity.projectIds, created_at: entity.createdAt };
  }

  if (collectionName === 'projects') {
    return { id: entity.id, name: entity.name, description: entity.description, course_id: entity.courseId, professor_id: entity.professorId, student_ids: entity.studentIds, evaluation_score: entity.evaluationScore, status: entity.status, created_at: entity.createdAt };
  }

  if (collectionName === 'evaluations') {
    return { id: entity.id, student_id: entity.studentId, project_id: entity.projectId, score: entity.score, comments: entity.comments, created_at: entity.createdAt };
  }

  return { id: entity.id, name: entity.name, description: entity.description, created_at: entity.createdAt };
}

function toAppEntity(collectionName, row) {
  if (collectionName === 'professors') {
    return { id: row.id, name: row.name, email: row.email, facultyId: row.faculty_id, projectId: row.project_id, createdAt: row.created_at };
  }

  if (collectionName === 'courses') {
    return { id: row.id, name: row.name, facultyId: row.faculty_id, professorId: row.professor_id, studentIds: row.student_ids, createdAt: row.created_at };
  }

  if (collectionName === 'students') {
    return { id: row.id, name: row.name, email: row.email, country: row.country, courseIds: row.course_ids, projectIds: row.project_ids, createdAt: row.created_at };
  }

  if (collectionName === 'projects') {
    return { id: row.id, name: row.name, description: row.description, courseId: row.course_id, professorId: row.professor_id, studentIds: row.student_ids, evaluationScore: row.evaluation_score, status: row.status, createdAt: row.created_at };
  }

  if (collectionName === 'evaluations') {
    return { id: row.id, studentId: row.student_id, projectId: row.project_id, score: row.score, comments: row.comments, createdAt: row.created_at };
  }

  return { id: row.id, name: row.name, description: row.description, createdAt: row.created_at };
}
