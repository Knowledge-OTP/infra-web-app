(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonStartedLate', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-started-late/lesson-started-late.component.html',
            controllerAs: 'vm',
            controller: function ($log, ZnkLessonNotesSrv, UserTypeContextEnum, ZnkLessonNotesUiSrv) {
                'ngInject';


                this.$onInit = () => {
                    $log.debug('LessonStartedLateComponent: Init');
                    this.initLessonStartedLate();
                    this.determineLessonStartedLate();
                };

                this.initLessonStartedLate = () => {
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.isTeacher = this.userContext === UserTypeContextEnum.EDUCATOR.enum;
                    if (this.isTeacher) {
                        this.lesson.lessonNotes.isStudentLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lesson.lessonNotes.isStudentLate) ?
                            this.lesson.lessonNotes.isStudentLate : false;
                    } else {
                        this.lesson.studentFeedback.isTeacherLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lesson.studentFeedback.isTeacherLate) ?
                            this.lesson.studentFeedback.isTeacherLate : false;
                    }
                };

                this.determineLessonStartedLate = () => {
                    ZnkLessonNotesSrv.getGlobalVariables().then(globalVariables => {
                        this.lessonStartedLate = (this.lesson.date + globalVariables.liveSession.lessonStartedLateTimeout) < this.lesson.startTime;
                    });
                };
            }
        });
})(angular);
