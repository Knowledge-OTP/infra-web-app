(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').directive('invitationManager',

        function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv, $translatePartialLoader, StudentContextSrv) {
            'ngInject';

           return {
                templateUrl: 'components/invitation/directives/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope) {
                    var userId = StudentContextSrv.getCurrUid();
                    $translatePartialLoader.addPart('invitation');
                    scope.translate = $filter('translate');
                    scope.pendingTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_INVITATIONS');
                    scope.pendingConformationsTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_CONFORMATIONS');
                    scope.declinedTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.DECLINED_INVITATIONS');

                    function myTeachersCB(teacher){
                        if (!angular.isObject(scope.myTeachers)) {
                            scope.myTeachers = {};
                        }
                        scope.myTeachers[teacher.senderUid] = teacher;
                    }

                    function newInvitationsCB(invitation){
                        if (!angular.isObject(scope.invitations)) {
                            scope.invitations = {};
                        }
                        scope.invitations[invitation.invitationId] = invitation;
                        scope.pendingTitle += ' (' + (scope.getItemsCount(scope.invitations) || 0) + ')';
                    }

                    function pendingConfirmationsCB(pendingConf){
                        if (!angular.isObject(scope.conformations)) {
                            scope.conformations = {};
                        }
                        scope.conformations[pendingConf.invitationId] = pendingConf;
                        scope.pendingConformationsTitle += ' (' + (scope.getItemsCount(scope.conformations) || 0) + ')';
                    }

                    scope.hasItems = function (obj) {
                        return !!scope.getItemsCount(obj || {});
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

                    InvitationService.registerListenerCB(InvitationService.invitationDataListener.USER_TEACHERS, userId, myTeachersCB);
                    InvitationService.registerListenerCB(InvitationService.invitationDataListener.NEW_INVITATIONS, userId, newInvitationsCB);
                    InvitationService.registerListenerCB(InvitationService.invitationDataListener.PENDING_CONFIRMATIONS, userId, pendingConfirmationsCB);

                    var watcherDestroy = scope.$on('$destroy', function () {
                        InvitationService.offListenerCB(InvitationService.invitationDataListener.USER_TEACHERS, userId, myTeachersCB);
                        InvitationService.offListenerCB(InvitationService.invitationDataListener.NEW_INVITATIONS, userId, newInvitationsCB);
                        InvitationService.offListenerCB(InvitationService.invitationDataListener.PENDING_CONFIRMATIONS, userId, pendingConfirmationsCB);

                        watcherDestroy();
                    });
                }
            };
        }
    );
})(angular);
