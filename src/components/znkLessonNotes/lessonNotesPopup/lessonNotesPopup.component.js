(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonNotesPopup', {
            bindings: {
                lessonId: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonNotesPopup.template.html',
            controllerAs: 'vm',
            controller: function ($log, $mdDialog, ZnkLessonNotesSrv) {
                'ngInject';

                let vm = this;
                vm.save = save;

                this.$onInit = function () {
                    $log.debug('lessonNotesPopup: Init');
                    ZnkLessonNotesSrv.getLessonById(vm.lessonId).then(lesson => {
                        vm.lesson = lesson.data;
                    });
                    vm.closeModal = $mdDialog.cancel;
                    vm.showSpinner = false;
                    vm.save = save;
                };

                function save() {
                    vm.showSpinner = true;
                    ZnkLessonNotesSrv.updateLesson(vm.lesson)
                        .then(updatedLesson => {
                            vm.lesson = updatedLesson.data;
                            vm.showSpinner = false;
                            vm.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: updateLesson failed. Error: ', err));
                }
            }
        });
})(angular);
