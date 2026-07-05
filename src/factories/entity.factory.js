import crypto from 'node:crypto';

const creators = {
  faculty(data) {
    return {
      id: createId('fac'),
      name: required(data.name, 'name'),
      description: data.description || '',
      createdAt: now()
    };
  },

  professor(data) {
    return {
      id: createId('pro'),
      name: required(data.name, 'name'),
      email: required(data.email, 'email'),
      facultyId: required(data.facultyId, 'facultyId'),
      projectId: data.projectId || null,
      createdAt: now()
    };
  },

  course(data) {
    return {
      id: createId('cou'),
      name: required(data.name, 'name'),
      facultyId: required(data.facultyId, 'facultyId'),
      professorId: required(data.professorId, 'professorId'),
      studentIds: data.studentIds || [],
      createdAt: now()
    };
  },

  student(data) {
    return {
      id: createId('stu'),
      name: required(data.name, 'name'),
      email: required(data.email, 'email'),
      country: required(data.country, 'country'),
      courseIds: data.courseIds || [],
      projectIds: data.projectIds || [],
      createdAt: now()
    };
  },

  project(data) {
    return {
      id: createId('prj'),
      name: required(data.name, 'name'),
      description: data.description || '',
      courseId: required(data.courseId, 'courseId'),
      professorId: required(data.professorId, 'professorId'),
      studentIds: data.studentIds || [],
      evaluationScore: 100,
      status: 'active',
      createdAt: now()
    };
  },

  evaluation(data) {
    return {
      id: createId('eva'),
      studentId: required(data.studentId, 'studentId'),
      projectId: required(data.projectId, 'projectId'),
      score: Number(required(data.score, 'score')),
      comments: data.comments || '',
      createdAt: now()
    };
  }
};

export function createEntity(type, data = {}) {
  const creator = creators[type];

  if (!creator) {
    throw new Error(`No existe creador para el tipo de entidad: ${type}`);
  }

  return creator(data);
}

function required(value, field) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`El campo ${field} es obligatorio`);
  }

  return value;
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function now() {
  return new Date().toISOString();
}
