import { createEntity } from '../factories/entity.factory.js';
import { add, addUnique, assertExists, findById, store } from '../store/memory.store.js';
import { SOUTH_AMERICAN_COUNTRIES } from '../utils/constants/countries.const.js';

export function list(collectionName) {
  return store[collectionName];
}

export function createFaculty(data) {
  return add('faculties', createEntity('faculty', data));
}

export function createProfessor(data) {
  assertExists('faculties', data.facultyId, 'La facultad no existe');
  return add('professors', createEntity('professor', data));
}

export function createCourse(data) {
  assertExists('faculties', data.facultyId, 'La facultad no existe');
  assertExists('professors', data.professorId, 'El profesor no existe');
  return add('courses', createEntity('course', data));
}

export function createProject(data) {
  const course = assertExists('courses', data.courseId, 'El curso no existe');
  const professor = assertExists('professors', course.professorId, 'El profesor del curso no existe');

  if (professor.projectId) {
    throw new Error('El profesor ya tiene un proyecto ICCIS asociado');
  }

  const project = add('projects', createEntity('project', {
    ...data,
    professorId: professor.id
  }));

  professor.projectId = project.id;
  return project;
}

export function createStudent(data) {
  if (!SOUTH_AMERICAN_COUNTRIES.includes(data.country)) {
    throw new Error('El pais del estudiante debe pertenecer a Suramerica');
  }

  if (!Array.isArray(data.projectIds) || data.projectIds.length === 0) {
    throw new Error('Cada estudiante debe participar en al menos un proyecto');
  }

  data.courseIds = data.courseIds || [];

  data.courseIds.forEach((courseId) => assertExists('courses', courseId, 'Uno de los cursos no existe'));
  data.projectIds.forEach((projectId) => assertExists('projects', projectId, 'Uno de los proyectos no existe'));

  const student = add('students', createEntity('student', data));

  student.courseIds.forEach((courseId) => enrollStudent(courseId, student.id));
  student.projectIds.forEach((projectId) => addStudentToProject(projectId, student.id));

  return student;
}

export function enrollStudent(courseId, studentId) {
  const course = assertExists('courses', courseId, 'El curso no existe');
  const student = assertExists('students', studentId, 'El estudiante no existe');

  addUnique(course.studentIds, student.id);
  addUnique(student.courseIds, course.id);

  return course;
}

export function addStudentToProject(projectId, studentId) {
  const project = assertExists('projects', projectId, 'El proyecto no existe');
  const student = assertExists('students', studentId, 'El estudiante no existe');

  addUnique(project.studentIds, student.id);
  addUnique(student.projectIds, project.id);

  return project;
}

export function createEvaluation(data) {
  const score = Number(data.score);

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error('La calificacion debe estar entre 0 y 100');
  }

  const student = assertExists('students', data.studentId, 'El estudiante no existe');
  const project = assertExists('projects', data.projectId, 'El proyecto no existe');

  if (!project.studentIds.includes(student.id)) {
    throw new Error('El estudiante no participa en el proyecto');
  }

  const evaluation = add('evaluations', createEntity('evaluation', {
    ...data,
    score
  }));

  updateProjectStatus(project.id);
  return evaluation;
}

export function getReport() {
  return {
    totals: {
      faculties: store.faculties.length,
      professors: store.professors.length,
      courses: store.courses.length,
      students: store.students.length,
      projects: store.projects.length,
      evaluations: store.evaluations.length
    },
    closedProjects: store.projects.filter((project) => project.status === 'closed'),
    studentsWithoutProjects: store.students.filter((student) => student.projectIds.length === 0),
    professorsWithoutProject: store.professors.filter((professor) => !professor.projectId)
  };
}

function updateProjectStatus(projectId) {
  const project = findById('projects', projectId);
  const evaluations = store.evaluations.filter((evaluation) => evaluation.projectId === projectId);

  if (evaluations.length === 0) {
    project.evaluationScore = 100;
    project.status = 'active';
    return project;
  }

  const total = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
  const lowEvaluations = evaluations.filter((evaluation) => evaluation.score < 70).length;

  project.evaluationScore = Number((total / evaluations.length).toFixed(2));
  project.status = lowEvaluations / evaluations.length >= 0.5 ? 'closed' : 'active';

  return project;
}

