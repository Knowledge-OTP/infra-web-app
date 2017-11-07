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
            controller: function ($log, $mdDialog, LiveSessionSrv, ZnkLessonNotesSrv) {
                'ngInject';

                const vm = this;
                vm.save = save;

                this.$onInit = function () {
                    $log.debug('lessonNotesPopup: Init');
                    ZnkLessonNotesSrv.getLessonById(vm.lessonId).then(lesson => {
                        vm.lesson = lesson;
                    });
                    vm.closeModal = $mdDialog.cancel;
                    vm.showSpinner = false;
                    vm.save = save;
                };

                function save() {
                    vm.showSpinner = true;
                    LiveSessionSrv.updateLiveSession(vm.lesson)
                        .then(updatedLesson => {
                            vm.lesson = updatedLesson;
                            vm.showSpinner = false;
                            vm.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: updateLesson failed. Error: ', err));
                }
            }
        });
})(angular);
