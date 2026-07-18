export class EvaluationAuditObserver {
  update(evaluation) {
    console.log(
      `[AUDITORIA] Evaluacion ${evaluation.id}: estudiante ${evaluation.studentId}, `
      + `proyecto ${evaluation.projectId}, calificacion ${evaluation.score}`
    );
  }
}
