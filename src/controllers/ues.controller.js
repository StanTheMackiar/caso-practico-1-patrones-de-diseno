import * as service from '../services/ues.service.js';

export const collections = ['faculties', 'professors', 'courses', 'students', 'projects', 'evaluations'];

export function getApiInfo(req, res) {
  res.json({
    name: 'UES + ICCIS API',
    patterns: ['MVC', 'Factory Method'],
    resources: collections.map((collection) => `/api/${collection}`),
    report: '/api/report'
  });
}

export function listCollection(collectionName) {
  return (req, res) => {
    res.json(service.list(collectionName));
  };
}

export function createFaculty(req, res) {
  res.status(201).json(service.createFaculty(req.body));
}

export function createProfessor(req, res) {
  res.status(201).json(service.createProfessor(req.body));
}

export function createCourse(req, res) {
  res.status(201).json(service.createCourse(req.body));
}

export function createProject(req, res) {
  res.status(201).json(service.createProject(req.body));
}

export function createStudent(req, res) {
  res.status(201).json(service.createStudent(req.body));
}

export function enrollStudent(req, res) {
  res.json(service.enrollStudent(req.params.courseId, req.body.studentId));
}

export function addStudentToProject(req, res) {
  res.json(service.addStudentToProject(req.params.projectId, req.body.studentId));
}

export function createEvaluation(req, res) {
  res.status(201).json(service.createEvaluation(req.body));
}

export function getReport(req, res) {
  res.json(service.getReport());
}
