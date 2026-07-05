import express from 'express';
import * as controller from '../controllers/ues.controller.js';
import { wrap } from '../utils/helpers/wrap.helper.js';

const router = express.Router();

router.get('/', controller.getApiInfo);

controller.collections.forEach((collection) => {
  router.get(`/${collection}`, controller.listCollection(collection));
});

router.post('/faculties', wrap(controller.createFaculty));
router.post('/professors', wrap(controller.createProfessor));
router.post('/courses', wrap(controller.createCourse));
router.post('/projects', wrap(controller.createProject));
router.post('/students', wrap(controller.createStudent));
router.post('/courses/:courseId/students', wrap(controller.enrollStudent));
router.post('/projects/:projectId/students', wrap(controller.addStudentToProject));
router.post('/evaluations', wrap(controller.createEvaluation));
router.get('/report', controller.getReport);

export default router;
