import { ExerciseHeaderUtil } from './exerciseHeader.util.js';

export class exerciseHeaderController {
  constructor(SubjectEnum) {
      'ngInject';
      // required: subjectId
      if (angular.isUndefined(this.subjectId)) {
          throw new Error('Error: exerciseHeaderController: subjectId is required!');
      }

      this.subjectId = +this.subjectId;

      var classUtil = new ExerciseHeaderUtil(SubjectEnum, this.subjectId);
      this.subjectName = classUtil.getSubjectName();
  }
}
