(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonTeacherNotes', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/lesson-teacher-notes.component.html',
            controllerAs: 'vm',
            controller: function ($log, $translate, UserTypeContextEnum) {
                'ngInject';

                this.$onInit = function () {
                    $log.debug('znkLessonTeacherNotes: Init');
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.showComponent = this.isAdmin || this.userContext === UserTypeContextEnum.EDUCATOR.enum;
                    this.lesson.lessonNotes = this.lesson.lessonNotes || {};
                    this.initEducatorNotes();
                };

                this.initEducatorNotes = () => {
                    if (!this.lesson.lessonNotes.educatorNotes) {
                        $translate('LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.NOTES_TEMPLATE')
                            .then(notesTemplate => this.lesson.lessonNotes.educatorNotes = notesTemplate);
                    }
                };
            }
        });
})(angular);
