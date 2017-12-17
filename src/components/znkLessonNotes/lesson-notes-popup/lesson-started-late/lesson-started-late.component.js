(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonStartedLate', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-started-late/lesson-started-late.component.html',
            controllerAs: 'vm',
            controller: function ($log, ZnkLessonNotesSrv, UserTypeContextEnum, ZnkLessonNotesUiSrv) {
                'ngInject';


                this.$onInit = () => {
                    $log.debug('LessonStartedLateComponent: Init');
                    this.lessonSummary.lessonNotes = this.lessonSummary.lessonNotes || {};
                    this.lessonSummary.studentFeedback = this.lessonSummary.studentFeedback || {};
                    this.initLessonStartedLate();
                    this.determineLessonStartedLate();
                };

                this.initLessonStartedLate = () => {
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.isTeacher = this.userContext === UserTypeContextEnum.EDUCATOR.enum;
                    if (this.isTeacher) {
                        this.lessonSummary.lessonNotes.isStudentLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lessonSummary.lessonNotes.isStudentLate) ?
                            this.lessonSummary.lessonNotes.isStudentLate : false;
                    } else {
                        this.lessonSummary.studentFeedback.isTeacherLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lessonSummary.studentFeedback.isTeacherLate) ?
                            this.lessonSummary.studentFeedback.isTeacherLate : false;
                    }
                };

                this.determineLessonStartedLate = () => {
                    ZnkLessonNotesSrv.getGlobalVariables().then(globalVariables => {
                        this.lessonStartedLate = (this.lesson.date + globalVariables.liveSession.lessonStartedLateTimeout) < this.lessonSummary.startTime;
                    });
                };
            }
        });
})(angular);
