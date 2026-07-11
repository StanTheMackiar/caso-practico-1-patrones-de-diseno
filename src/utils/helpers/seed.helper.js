import { createEntity } from "../../factories/entity.factory.js";
import { add, save } from "../../adapters/store.adapter.js";

export function seed() {
  const faculty = add('faculties', createEntity('faculty', {
    name: 'Facultad de Ciencias de la Salud',
    description: 'Programas academicos asociados a investigacion del ICCIS.'
  }));

  const professor = add('professors', createEntity('professor', {
    name: 'Dra. Laura Mendoza',
    email: 'laura.mendoza@ues.edu',
    facultyId: faculty.id
  }));

  const course = add('courses', createEntity('course', {
    name: 'Biotecnologia Amazonica I',
    facultyId: faculty.id,
    professorId: professor.id
  }));

  const project = add('projects', createEntity('project', {
    name: 'Analisis de recursos naturales amazonicos',
    description: 'Proyecto ICCIS para estudiar insumos naturales aplicados a salud.',
    courseId: course.id,
    professorId: professor.id
  }));

  professor.projectId = project.id;
  save('professors', professor);

  const studentOne = add('students', createEntity('student', {
    name: 'Ana Torres',
    email: 'ana.torres@ues.edu',
    country: 'Colombia',
    courseIds: [course.id],
    projectIds: [project.id]
  }));

  const studentTwo = add('students', createEntity('student', {
    name: 'Bruno Silva',
    email: 'bruno.silva@ues.edu',
    country: 'Brasil',
    courseIds: [course.id],
    projectIds: [project.id]
  }));

  course.studentIds.push(studentOne.id, studentTwo.id);
  project.studentIds.push(studentOne.id, studentTwo.id);
}
