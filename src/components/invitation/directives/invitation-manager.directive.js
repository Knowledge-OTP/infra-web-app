(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').directive('invitationManager',

        function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv, $translatePartialLoader, StudentContextSrv, $timeout, PresenceService) {
            'ngInject';

           return {
                templateUrl: 'components/invitation/directives/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope) {
                    $translatePartialLoader.addPart('invitation');
                    scope.translate = $filter('translate');
                    scope.userStatus = PresenceService.userStatus;
                    scope.deleteTeacherMode = false;

                    function invitationManagerMyTeachersCB(teachers){

                        scope.myTeachers = teachers;
                        scope.hasTeachers = scope.getItemsCount(scope.myTeachers) > 0;
                        startTrackTeachersPresence();
                    }

                    function newInvitationsCB(invitation){
                        if (!angular.isObject(scope.invitations)) {
                            scope.invitations = {};
                        }
                        scope.invitations[invitation.invitationId] = invitation;
                        scope.hasInvitations = scope.getItemsCount(scope.invitations) > 0;
                    }

                    function pendingConfirmationsCB(pendingConf){
                        if (!angular.isObject(scope.conformations)) {
                            scope.conformations = {};
                        }
                        scope.conformations[pendingConf.invitationId] = pendingConf;
                        scope.hasConfirmations = scope.getItemsCount(scope.conformations) > 0;
                    }

                    function startTrackTeachersPresence() {
                        if (startTrackTeachersPresence.isTracking) {
                            return;
                        }
                        startTrackTeachersPresence.isTracking = true;
                        angular.forEach(scope.myTeachers, function (teacher) {
                            PresenceService.startTrackUserPresence(teacher.senderUid, trackUserPresenceCB.bind(null, teacher.senderUid));
                        });
                    }

                    function trackUserPresenceCB(userId, newStatus) {
                        $timeout(function () {
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

                    scope.toggleDeleteTeacher = function () {
                        scope.deleteTeacherMode = !scope.deleteTeacherMode;
                    };

                    scope.getItemsCount = function (obj) {
                        return Object.keys(obj || {}).length;
                    };

                    scope.hasAnyItems = function () {
                        return (Object.keys(scope.invitations || {}).length > 0 ||
                        Object.keys(scope.conformations || {}).length > 0 ||
                        Object.keys(scope.myTeachers || {}).length > 0);
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

                    var watcherDestroy = scope.$on('$destroy', function () {
                        InvitationService.offListenerCB(InvitationService.listeners.USER_TEACHERS, invitationManagerMyTeachersCB);
                        InvitationService.offListenerCB(InvitationService.listeners.NEW_INVITATIONS, newInvitationsCB);
                        InvitationService.offListenerCB(InvitationService.listeners.PENDING_CONFIRMATIONS, pendingConfirmationsCB);

                        watcherDestroy();
                    });
                }
            };
        }
    );
})(angular);
