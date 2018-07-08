(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').directive('invitationManager',

        function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv, StudentContextSrv, $timeout, PresenceService, $log) {
            'ngInject';

           return {
                templateUrl: 'components/invitation/invitationManager/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope) {
                    scope.translate = $filter('translate');
                    scope.userStatus = PresenceService.userStatus;
                    scope.deleteTeacherMode = false;

                    function invitationManagerMyTeachersCB(teachers){
                        $log.debug('invitationManager:: teachers cb', teachers);
                        scope.myTeachers = teachers;
                        scope.hasTeachers = scope.getItemsCount(scope.myTeachers) > 0;
                        startTrackTeachersPresence();
                    }

                    function newInvitationsCB(invitation){
                        $log.debug('invitationManager:: new invitations cb', invitation);
                        scope.invitations = invitation;
                        scope.hasInvitations = scope.getItemsCount(scope.invitations) > 0;
                    }

                    function pendingConfirmationsCB(pendingConf){
                        $log.debug('invitationManager:: pending conf cb', pendingConf);
                        scope.conformations = pendingConf;
                        scope.hasConfirmations = scope.getItemsCount(scope.conformations) > 0;
                    }

                    function startTrackTeachersPresence() {
                        if (startTrackTeachersPresence.isTracking) {
                            return;
                        }
                        startTrackTeachersPresence.isTracking = true;
                        angular.forEach(scope.myTeachers, function (teacher) {
                            PresenceService.startTrackUserPresence(teacher.senderUid, trackUserPresenceCB);
                        });
                    }

                    function trackUserPresenceCB(snapshot) {
                        if (snapshot && snapshot.val()){
                            const userId = snapshot.key;
                            const newStatus = snapshot.val();
                            $timeout(() => {
                                angular.forEach(scope.myTeachers, function (teacher) {
                                    if (teacher.senderUid === userId) {
                                        teacher.presence = newStatus;
                                        teacher.callBtnData = angular.copy({
                                            receiverId: teacher.senderUid,
                                            isOffline: teacher.presence === PresenceService.userStatus.OFFLINE
                                        });
                                    }
                                });
                            });
                        }
                    }

                    scope.toggleDeleteTeacher = function () {
                        scope.deleteTeacherMode = !scope.deleteTeacherMode;
                    };

                    scope.getItemsCount = function (obj) {
                        return Object.keys(obj || {}).length;
                    };

                    scope.approve = function (invitation) {
                        InvitationHelperService.approve(invitation);
                    };

                    scope.decline = function (invitation) {
                        InvitationHelperService.decline(invitation);
                    };

                    scope.deletePendingConformations = function (invitation) {
                        var _title = scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_INVITATION');
                        var _content = scope.translate('INVITATION_MANAGER_DIRECTIVE.ARE_U_SURE');
                        var _yes = scope.translate('INVITATION_MANAGER_DIRECTIVE.YES');
                        var _no = scope.translate('INVITATION_MANAGER_DIRECTIVE.NO');

                        PopUpSrv.ErrorConfirmation(_title, _content, _yes, _no).promise.then(function (result) {
                            if (result === 'Yes') {
                                InvitationService.deletePendingConformations(invitation).then(function (response) {
                                    if (response.data && response.data.success) {
                                        PopUpSrv.success(scope.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS'), scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_SUCCESS'));
                                    } else {
                                        PopUpSrv.error('', scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_ERROR'));
                                    }
                                });
                            }
                        });
                    };

                    scope.deleteTeacher = function (teacher) {
                        InvitationHelperService.deleteTeacher(teacher);
                    };

                    scope.openInviteModal = function () {
                        InvitationService.openInviteTeacherModal();
                    };

                    InvitationService.registerListenerCB(InvitationService.listeners.USER_TEACHERS, invitationManagerMyTeachersCB);
                    InvitationService.registerListenerCB(InvitationService.listeners.NEW_INVITATIONS, newInvitationsCB);
                    InvitationService.registerListenerCB(InvitationService.listeners.PENDING_CONFIRMATIONS, pendingConfirmationsCB);

                    scope.$on('$destroy', function () {
                        // InvitationService.offListenerCB(InvitationService.listeners.USER_TEACHERS, invitationManagerMyTeachersCB);
                        // InvitationService.offListenerCB(InvitationService.listeners.NEW_INVITATIONS, newInvitationsCB);
                        // InvitationService.offListenerCB(InvitationService.listeners.PENDING_CONFIRMATIONS, pendingConfirmationsCB);
                        angular.forEach(scope.myTeachers, function (teacher) {
                            PresenceService.stopTrackUserPresence(teacher.senderUid, trackUserPresenceCB);
                        });

                    });
                }
            };
        }
    );
})(angular);
