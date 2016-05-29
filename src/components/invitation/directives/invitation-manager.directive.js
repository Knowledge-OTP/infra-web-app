(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('invitationManager',

        function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv) {
            'ngInject';

           return {
                templateUrl: 'app/components/invitation/directives/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope, element) {
                    if (!ENV.dashboardFeatureEnabled) {
                        element.remove();
                        return;
                    }

                    scope.translate = $filter('translate');

                    scope.pendingTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_INVITATIONS');
                    scope.pendingConformationsTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_CONFORMATIONS');
                    scope.declinedTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.DECLINED_INVITATIONS');

                    InvitationService.getReceived().then(function (invitations) {
                        scope.invitations = invitations;
                        scope.pendingTitle += ' (' + (scope.getItemsCount(scope.invitations) || 0) + ')';
                    });

                    InvitationService.getPendingConformations().then(function (conformations) {
                        angular.forEach(conformations, function (conformation, key) {
                            conformation.invitationId = key;
                        });
                        scope.conformations = conformations;
                        scope.pendingConformationsTitle += ' (' + (scope.getItemsCount(scope.conformations) || 0) + ')';
                    });

                    InvitationService.getDeclinedInvitations().then(function (declinedInvitations) {
                        scope.declinedInvitations = declinedInvitations;
                    });

                    InvitationService.getMyTeacher().then(function (teacherObj) {
                        scope.myTeachers = teacherObj;
                    });

                    scope.hasItems = function (obj) {
                        return !!scope.getItemsCount(obj);
                    };

                    scope.getItemsCount = function (obj) {
                        return Object.keys(obj).length;
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

                    var watcherDestroy = scope.$on('$destroy', function () {
                        InvitationService.removeListeners();
                        watcherDestroy();
                    });
                }
            };
        }
    );
})(angular);
