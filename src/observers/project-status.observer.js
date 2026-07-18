import { findById, list as listStore, save } from '../adapters/store.adapter.js';

export class ProjectStatusObserver {
  update(evaluation) {
    const project = findById('projects', evaluation.projectId);
    const evaluations = listStore('evaluations')
      .filter((currentEvaluation) => currentEvaluation.projectId === evaluation.projectId);

    const total = evaluations.reduce((sum, currentEvaluation) => sum + currentEvaluation.score, 0);
    const lowEvaluations = evaluations
      .filter((currentEvaluation) => currentEvaluation.score < 70)
      .length;

    project.evaluationScore = Number((total / evaluations.length).toFixed(2));
    project.status = lowEvaluations / evaluations.length >= 0.5 ? 'closed' : 'active';
    save('projects', project);
  }
}
