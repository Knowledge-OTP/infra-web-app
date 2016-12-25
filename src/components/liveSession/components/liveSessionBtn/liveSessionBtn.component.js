(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession')
        .component('liveSessionBtn', {
            bindings: {
                student: '='
            },
            templateUrl: 'components/liveSession/components/liveSessionBtn/liveSessionBtn.template.html',
            controllerAs: 'vm',
            controller: function ($log, $scope, $mdDialog, LiveSessionSrv, StudentContextSrv, TeacherContextSrv,
                                  PresenceService, ENV, LiveSessionStatusEnum) {
                'ngInject';

                var vm = this;
                var isTeacher = (ENV.appContext.toLowerCase()) === 'dashboard';
                var isStudent = ENV.appContext.toLowerCase() === 'student';

                function trackStudentOrTeacherPresenceCB(prevUid, uid) {
                    PresenceService.getCurrentUserStatus(uid).then(function (currUserPresenceStatus) {
                        vm.isOffline = currUserPresenceStatus === PresenceService.userStatus.OFFLINE;
                    });
                }
                function liveSessionStateChanged(newLiveSessionData) {
                    vm.isLiveSessionActive = newLiveSessionData === LiveSessionStatusEnum.CONFIRMED.enum;
                }

                function endSession() {
                    LiveSessionSrv.getActiveLiveSessionData().then(function (liveSessionData) {
                        LiveSessionSrv.endLiveSession(liveSessionData.guid);
                    });
                }

                this.$onInit = function() {
                    vm.isLiveSessionActive = false;
                    vm.endSession = endSession;
                    vm.isOffline = true;

                    if (isTeacher) {
                        StudentContextSrv.registerToStudentContextChange(trackStudentOrTeacherPresenceCB);
                    } else if (isStudent) {
                        TeacherContextSrv.registerToTeacherContextChange(trackStudentOrTeacherPresenceCB);
                    } else {
                        $log.error('appContext is not compatible with this component: ', ENV.appContext);
                    }

                    LiveSessionSrv.registerToCurrUserLiveSessionStateChanges(liveSessionStateChanged);

                    vm.showSessionModal = function () {
                        $mdDialog.show({
                            template: '<live-session-subject-modal student="vm.student"></live-session-subject-modal>',
                            scope: $scope,
                            preserveScope: true,
                            clickOutsideToClose: true
                        });
                    };
                };
            }
        });
})(angular);
