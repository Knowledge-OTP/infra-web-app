(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation',
        ['ngMaterial',
        'znk.infra.popUp',
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'znk.infra-web-app.purchase',
        'znk.infra.user'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'invitation-teacher-icon': 'components/invitation/svg/teacher-icon.svg',
                    'invitation-close-popup': 'components/invitation/svg/invitation-close-popup.svg',
                    'invitation-teacher-active-icon': 'components/invitation/svg/invitation-teacher-active-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('invitationApproveModalCtrl',

        ["locals", "$mdDialog", "InvitationHelperService", "$filter", "PopUpSrv", function (locals, $mdDialog, InvitationHelperService, $filter, PopUpSrv) {
            'ngInject';

            var self = this;
            self.translate = $filter('translate');
            self.invitation = locals.invitation;
            self.requestMessage = false;
            self.btnDisable = false;

            this.approve = function () {
                self.btnDisable = true;
                self.approveStartLoader = true;
                InvitationHelperService.approve(self.invitation).then(function (response) {
                    self.requestMessage = true;
                    self.approveFillLoader = true;
                    if (response.data && response.data.success) {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_CONNECT') + self.invitation.senderName;
                    } else {
                        self.closeModal();
                        PopUpSrv.error('', self.translate('INVITATION_MANAGER_DIRECTIVE.APPROVE_INVITE_ERROR'));
                    }
                }, function () {
                    self.closeModal();
                    PopUpSrv.error('', self.translate('INVITATION_MANAGER_DIRECTIVE.APPROVE_INVITE_ERROR'));
                });
            };

            this.decline = function () {
                self.btnDisable = true;
                self.cancelStartLoader = true;
                InvitationHelperService.decline(self.invitation).then(function (response) {
                    self.requestMessage = true;
                    self.cancelFillLoader = true;
                    if (response.data && response.data.success) {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_DECLINE');
                    } else {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.CANCEL_INVITE_ERROR');
                    }
                }, function () {
                    self.requestMessage = true;
                    self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.CANCEL_INVITE_ERROR');
                });
            };

            this.closeModal = function () {
                $mdDialog.cancel();
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').directive('invitationManager',

        ["InvitationService", "$filter", "InvitationHelperService", "ENV", "PopUpSrv", "$translatePartialLoader", "StudentContextSrv", "$timeout", function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv, $translatePartialLoader, StudentContextSrv, $timeout) {
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
                    scope.hasTeachers = scope.hasInvitations = scope.hasConfirmations = false;

                    function myTeachersCB(teacher){
                        $timeout(function () {
                            if (!angular.isObject(scope.myTeachers)) {
                                scope.myTeachers = {};
                            }
                            scope.myTeachers[teacher.senderUid] = teacher;
                            scope.hasTeachers = scope.getItemsCount(scope.myTeachers) > 0;
                        });
                    }

                    function newInvitationsCB(invitation){
                        $timeout(function () {
                            if (!angular.isObject(scope.invitations)) {
                                scope.invitations = {};
                            }
                            scope.invitations[invitation.invitationId] = invitation;
                            scope.pendingTitle += ' (' + (scope.getItemsCount(scope.invitations) || 0) + ')';
                            scope.hasInvitations = scope.getItemsCount(scope.invitations) > 0;
                        });
                    }

                    function pendingConfirmationsCB(pendingConf){
                        $timeout(function () {
                            if (!angular.isObject(scope.conformations)) {
                                scope.conformations = {};
                            }
                            scope.conformations[pendingConf.invitationId] = pendingConf;
                            scope.pendingConformationsTitle += ' (' + (scope.getItemsCount(scope.conformations) || 0) + ')';
                            scope.hasConfirmations = scope.getItemsCount(scope.conformations) > 0;
                        });
                    }

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
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('inviteTeacherModalController',

        ["$mdDialog", "InvitationService", "PopUpSrv", "$filter", "$timeout", function ($mdDialog, InvitationService, PopUpSrv, $filter, $timeout) {
            'ngInject';
            var self = this;
            self.translate = $filter('translate');

            this.sendInvitation = function () {
                self.startLoader = true;
                InvitationService.inviteTeacher(self.teacherEmail, self.teacherName).then(function (response) {
                    self.fillLoader = true;
                    if (response.data && response.data.success) {
                        $timeout(function () {
                            self.showSuccess = true;
                        }, 100);
                    } else {
                        $timeout(function () {
                            self.closeModal();
                            PopUpSrv.error('', self.translate('INVITE_TEACHER_MODAL.GENERAL_ERROR'));
                        }, 100);
                    }
                });
            };

            this.closeModal = function () {
                $mdDialog.hide();
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation')
        .run(["$location", "InvitationService", function($location, InvitationService){
            'ngInject';
            var search = $location.search();

            if (angular.isDefined(search.iid)) {
                InvitationService.showInvitationConfirm(search.iid);
                delete search.iid;
                $location.search(search);
            }
        }]);

})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationService',

        ["$mdDialog", "ENV", "AuthService", "$q", "$http", "PopUpSrv", "$filter", "UserProfileService", "InfraConfigSrv", "StudentContextSrv", function ($mdDialog, ENV, AuthService, $q, $http, PopUpSrv, $filter, UserProfileService, InfraConfigSrv, StudentContextSrv) {
            'ngInject';
            var self = this;
            var invitationEndpoint = ENV.backendEndpoint + 'invitation';
            var translate = $filter('translate');
            var registerEvents = {};
            var httpConfig = {
                headers: 'application/json',
                timeout: ENV.promiseTimeOut
            };

            this.invitationDataListener = {
                USER_TEACHERS: 'approved',
                NEW_INVITATIONS: 'sent',
                PENDING_CONFIRMATIONS: 'received'
            };

            this.invitationStatus = {
                pending: 0,
                approved: 1,
                receiverDeclined: 2,
                senderDelete: 3,
                resent: 4,
                connectToUser: 5,
                receiverDelete: 6
            };

            this.offListenerCB = function (event, userId, valueCB) {
                InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    var listenerData = getListenerData(userId, event);
                    studentStorage.offEvent('child_added', listenerData.path, listenerData.cb);
                    studentStorage.offEvent('child_removed', listenerData.path, listenerData.cb);

                    angular.forEach(registerEvents[userId][event].cb, function (cb, index) {
                        if (cb === valueCB) {
                            registerEvents[userId][event].cb.splice(index, 1);
                        }
                    });
                });
            };

            this.registerListenerCB = function (event, userId, valueCB) {
                InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    if (!registerEvents[userId]) {
                        registerEvents[userId] = {};
                    }

                    if (!registerEvents[userId][event]) {
                        registerEvents[userId][event] = {
                            cb: []
                        };
                    }

                    registerEvents[userId][event].cb.push(valueCB);

                    var listenerData = getListenerData(userId, event);
                    studentStorage.onEvent('child_added', listenerData.path, listenerData.cb);
                    studentStorage.onEvent('child_removed', listenerData.path, listenerData.cb);
                });
            };

            this.showInvitationConfirm = function (invitationId) {
                if (!ENV.dashboardFeatureEnabled) {
                    return false;
                }
                var invitation = {
                    status: this.invitationStatus.connectToUser,
                    invitationId: invitationId,
                    receiverAppName: ENV.firebaseAppScopeName,
                    senderAppName: ENV.firebaseDashboardAppScopeName
                };
                return this.updateInvitationStatus(invitation).then(function (response) {
                    if (response.data.success) {
                        return $mdDialog.show({
                            locals: {
                                invitation: response.data.data
                            },
                            controller: 'invitationApproveModalCtrl',
                            controllerAs: 'vm',
                            templateUrl: 'components/invitation/approveModal/invitationApproveModal.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    }

                    var errorTitle = translate('INVITE_APPROVE_MODAL.INVITE_ERROR_TITLE');
                    var errorMsg = translate('INVITE_APPROVE_MODAL.INVITE_ERROR_MSG');
                    return PopUpSrv.error(errorTitle, errorMsg);
                });
            };

            this.updateInvitationStatus = function (invitation) {
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.senderAppName = ENV.firebaseDashboardAppScopeName;
                invitation.senderEmail = authData.password.email;
                return updateStatus(invitation);
            };

            this.openInviteTeacherModal = function () {
                return $mdDialog.show({
                    controller: 'inviteTeacherModalController',
                    controllerAs: 'vm',
                    templateUrl: 'components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html',
                    clickOutsideToClose: true,
                    escapeToClose: true
                });
            };

            this.inviteTeacher = function (receiverEmail, receiverName) {
                return UserProfileService.getProfile().then(function (profile) {
                    var authData = AuthService.getAuth();
                    var newInvitiation = [{
                       receiverAppName: ENV.firebaseDashboardAppScopeName,
                       receiverEmail: receiverEmail,
                       receiverName: receiverName || receiverEmail,
                       senderAppName: ENV.firebaseAppScopeName,
                       senderEmail: profile.email,
                       senderName: profile.nickname || profile.email,
                       senderUid: authData.uid
                    }];
                    return $http.post(invitationEndpoint, newInvitiation, httpConfig).then(function (response) {
                       return {
                           data: response.data[0]
                       };
                    }, function (error) {
                       return {
                           data: error.data
                       };
                    });
                });
            };

            this.deletePendingConformations = function (invitation) {
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.status = this.invitationStatus.senderDelete;
                invitation.receiverAppName = ENV.firebaseDashboardAppScopeName;
                invitation.senderAppName = ENV.firebaseAppScopeName;
                invitation.senderEmail = authData.password.email;
                return updateStatus(invitation);
            };

            function updateStatus(invitation) {
                var updateUrl = invitationEndpoint + '/' + invitation.invitationId;
                return $http.put(updateUrl, invitation, httpConfig).then(
                    function (response) {
                        return {
                            data: response.data
                        };
                    },
                    function (error) {
                        return {
                            data: error.data
                        };
                    });
            }

            function getListenerData(userId, event){
                var listenerData = {
                    path: 'users/' + userId + '/invitations/' + event
                };

                switch (event){
                    case self.invitationDataListener.USER_TEACHERS:
                        listenerData.cb = userTeachersCB;
                        break;
                    case self.invitationDataListener.NEW_INVITATIONS:
                        listenerData.cb = newInvitationsCB;
                        break;
                    case self.invitationDataListener.PENDING_CONFIRMATIONS:
                        listenerData.cb = pendingConfirmationsCB;
                        break;
                }

                return listenerData;
            }

            function userTeachersCB(teacher) {
                if (!angular.isUndefined(teacher) && teacher.senderUid) {
                    var userId = StudentContextSrv.getCurrUid();
                    UserProfileService.getProfileByUserId(teacher.senderUid).then(function (profile) {
                        teacher.zinkerzTeacher = profile.zinkerzTeacher;
                        teacher.zinkerzTeacherSubject = profile.zinkerzTeacherSubject;

                        angular.forEach(registerEvents[userId][self.invitationDataListener.USER_TEACHERS].cb, function (cb) {
                            if (angular.isFunction(cb)) {
                                cb(teacher);
                            }
                        });
                    });
                }
            }

            function newInvitationsCB (data) {
                var userId = StudentContextSrv.getCurrUid();
                angular.forEach(registerEvents[userId][self.invitationDataListener.NEW_INVITATIONS].cb, function (cb) {
                    if (angular.isFunction(cb)) {
                        cb(data);
                    }
                });
            }

            function pendingConfirmationsCB (data) {
                var userId = StudentContextSrv.getCurrUid();
                angular.forEach(registerEvents[userId][self.invitationDataListener.PENDING_CONFIRMATIONS].cb, function (cb) {
                    if (angular.isFunction(cb)) {
                        cb(data);
                    }
                });
            }
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationHelperService',

        ["InvitationService", "$filter", "PopUpSrv", "UserProfileService", function (InvitationService, $filter, PopUpSrv, UserProfileService) {
            'ngInject';

            var self = this;
            self.translate = $filter('translate');
            self.translatedTitles = {
                successDisconnect: self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_DISCONNECT'),
                errorDisconnect: self.translate('INVITATION_MANAGER_DIRECTIVE.DISCONNECT_ERROR')
            };

            this.approve = function (invitation) {
                return UserProfileService.getProfile().then(function (profile) {
                    invitation.status = InvitationService.invitationStatus.approved;
                    invitation.originalReceiverName = profile.nickname || profile.email;
                    invitation.originalReceiverEmail = profile.email;
                    invitation.invitationReceiverName = invitation.receiverName;
                    invitation.invitationReceiverEmail = invitation.receiverEmail;

                    return updateStatus(invitation);
                });
            };

            this.decline = function (invitation) {
                invitation.status = InvitationService.invitationStatus.receiverDeclined;
                return updateStatus(invitation);
            };

            this.deleteTeacher = function (invitation) {
                invitation.status = InvitationService.invitationStatus.receiverDelete;
                updateStatus(invitation).then(function (response) {
                    if (response.data && response.data.success) {
                        PopUpSrv.success(self.translatedTitles.success, self.translatedTitles.successDisconnect);
                    } else {
                        PopUpSrv.error('', self.translatedTitles.errorDisconnect);
                    }
                }, function () {
                    PopUpSrv.error('', self.translatedTitles.errorDisconnect);
                });
            };

            function updateStatus(invitation) {
                return InvitationService.updateInvitationStatus(invitation);
            }
        }]
    );
})(angular);

angular.module('znk.infra-web-app.invitation').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/invitation/approveModal/invitationApproveModal.template.html",
    "<md-dialog ng-cloak class=\"invitation-confirm-modal\" translate-namespace=\"INVITE_APPROVE_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"invitation-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content ng-switch=\"vm.requestMessage\">\n" +
    "        <section ng-switch-when=\"false\">\n" +
    "            <div class=\"main-title md-subheader\" translate=\".YOU_HAVE_INVITE\"></div>\n" +
    "            <div class=\"teacher\">\n" +
    "                <span>{{::vm.invitation.senderName}}</span>\n" +
    "                <span class=\"want-to-connect\" translate=\".WANT_TO_CONNECT\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <button class=\"md-button md-sm outline-blue\"\n" +
    "                        ng-disabled=\"vm.btnDisable === true\"\n" +
    "                        ng-click=\"vm.decline()\"\n" +
    "                        element-loader\n" +
    "                        fill-loader=\"vm.cancelFillLoader\"\n" +
    "                        show-loader=\"vm.cancelStartLoader\"\n" +
    "                        bg-loader=\"'#acacac'\"\n" +
    "                        precentage=\"50\"\n" +
    "                        font-color=\"'#0a9bad'\"\n" +
    "                        bg=\"'#FFFFFF'\">\n" +
    "                    <span translate=\".DECLINE\"></span>\n" +
    "                </button>\n" +
    "                <button class=\"md-button md-sm primary\"\n" +
    "                        ng-disabled=\"vm.btnDisable === true\"\n" +
    "                        ng-click=\"vm.approve()\"\n" +
    "                        element-loader\n" +
    "                        fill-loader=\"vm.approveFillLoader\"\n" +
    "                        show-loader=\"vm.approveStartLoader\"\n" +
    "                        bg-loader=\"'#07434A'\"\n" +
    "                        precentage=\"50\"\n" +
    "                        font-color=\"'#FFFFFF'\"\n" +
    "                        bg=\"'#0a9bad'\">\n" +
    "                    <span translate=\".ACCEPT\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </section>\n" +
    "\n" +
    "        <div class=\"big-success-msg switch-animation\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "            <div ng-bind-html=\"vm.responseMessage\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button aria-label=\"{{'INVITE_APPROVE_MODAL.DONE' | translate}}\"\n" +
    "                           class=\"success lg drop-shadow\" ng-click=\"vm.closeModal()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"exclamation-mark-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/invitation/directives/invitation-manager.template.html",
    "<div translate-namespace=\"INVITATION_MANAGER_DIRECTIVE\">\n" +
    "    <md-menu md-offset=\"-225 51\"  class=\"invitation-manager\">\n" +
    "        <div ng-click=\"$mdOpenMenu($event);\" class=\"md-icon-button invite-icon-btn\" aria-label=\"Open Invite menu\" ng-switch=\"hasTeachers\">\n" +
    "            <div class=\"num-of-receive\" ng-if=\"hasInvitations\">{{getItemsCount(invitations)}}</div>\n" +
    "            <section ng-switch-when=\"false\" class=\"circle-invite-wrap teacher-icon-wrap\">\n" +
    "                <svg-icon name=\"invitation-teacher-icon\"></svg-icon>\n" +
    "            </section>\n" +
    "            <section ng-switch-when=\"true\" class=\"circle-invite-wrap teacher-active-icon-wrap\">\n" +
    "                <svg-icon name=\"invitation-teacher-active-icon\" class=\"invitation-teacher-active-icon\"></svg-icon>\n" +
    "            </section>\n" +
    "        </div>\n" +
    "        <md-menu-content class=\"md-menu-content-invitation-manager\" ng-switch=\"(hasInvitations || hasTeachers || hasConfirmations)\">\n" +
    "            <div class=\"empty-invite\" ng-switch-when=\"false\">\n" +
    "                <div class=\"empty-msg\" translate=\".EMPTY_INVITE\"></div>\n" +
    "                <div class=\"invite-action\">\n" +
    "                    <div class=\"md-button outline-blue invite-btn\" ng-click=\"openInviteModal()\">\n" +
    "                        <div translate=\".INVITE_STUDENTS\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"true\" ng-if=\"hasTeachers\" class=\"my-teacher-wrap\" ng-repeat=\"teacher in myTeachers\">\n" +
    "                <div class=\"title\" translate=\".MY_TEACHER\"></div>\n" +
    "                <div class=\"teacher-name\">{{::teacher.senderName}}</div>\n" +
    "                <div class=\"teacher-email\">{{::teacher.senderEmail}}</div>\n" +
    "                <svg-icon name=\"invitation-close-popup\" class=\"delete-teacher\" ng-click=\"deleteTeacher(teacher)\"></svg-icon>\n" +
    "            </div>\n" +
    "            <md-list ng-switch-when=\"true\" ng-if=\"hasInvitations\">\n" +
    "                <md-subheader class=\"invite-sub-title\">{{::pendingTitle}}</md-subheader>\n" +
    "                <md-list-item ng-repeat=\"invite in invitations\">\n" +
    "                    <svg-icon name=\"received-invitations-icon\" class=\"received-invitations\"></svg-icon>\n" +
    "                    <div class=\"teacher-wrap\">\n" +
    "                        <div class=\"teacher-name\">{{::invite.senderName}}</div>\n" +
    "                        <div class=\"creation-time\">{{::invite.creationTime | date : 'd MMM, h:mm a'}}</div>\n" +
    "                    </div>\n" +
    "                    <div class=\"decline-invite\">\n" +
    "                        <svg-icon name=\"invitation-close-popup\" class=\"decline-invite-btn\" ng-click=\"decline(invite)\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <div class=\"approve-invite\">\n" +
    "                        <svg-icon name=\"v-icon\" class=\"v-icon-btn\" ng-click=\"approve(invite)\"></svg-icon>\n" +
    "                    </div>\n" +
    "                </md-list-item>\n" +
    "            </md-list>\n" +
    "            <md-list g-switch-when=\"true\" ng-if=\"hasConfirmations\">\n" +
    "                <md-subheader class=\"invite-sub-title\">{{::pendingConformationsTitle}}</md-subheader>\n" +
    "                <md-list-item ng-repeat=\"conformation in conformations\">\n" +
    "                    <svg-icon name=\"sent-invitations-icon\" class=\"sent-invitations\"></svg-icon>\n" +
    "                    <div class=\"teacher-wrap\">\n" +
    "                        <div class=\"teacher-email\">{{::conformation.receiverName}}</div>\n" +
    "                    </div>\n" +
    "                    <div class=\"decline-conformation\">\n" +
    "                        <svg-icon name=\"invitation-close-popup\" class=\"decline-conformation-btn\" ng-click=\"deletePendingConformations(conformation)\"></svg-icon>\n" +
    "                    </div>\n" +
    "                </md-list-item>\n" +
    "            </md-list>\n" +
    "        </md-menu-content>\n" +
    "    </md-menu>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html",
    "<md-dialog class=\"invite-teacher-modal-wrap\" ng-cloak translate-namespace=\"INVITE_TEACHER_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"invitation-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content class=\"modal-content invite-teacher-content\" ng-switch=\"!!vm.showSuccess\">\n" +
    "        <div class=\"modal-main-title\" translate=\".INVITE_TEACHER\"></div>\n" +
    "        <form ng-switch-when=\"false\" class=\"invite-teacher-form\" novalidate name=\"inviteTeacherForm\"\n" +
    "              ng-submit=\"inviteTeacherForm.$valid && vm.sendInvitation()\">\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.teacherEmail && inviteTeacherForm.$submitted}\">\n" +
    "                <input type=\"email\" autocomplete=\"off\"\n" +
    "                       placeholder=\"{{::'INVITE_TEACHER_MODAL.TEACHER_EMAIL' | translate}}\" name=\"teacherEmail\"\n" +
    "                       ng-minlength=\"6\" ng-maxlength=\"25\" ng-required=\"true\" ng-model=\"vm.teacherEmail\">\n" +
    "                <div class=\"error-msg\" translate=\".REQUIRED\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"znk-input-group\">\n" +
    "                <input type=\"text\" autocomplete=\"off\"\n" +
    "                       placeholder=\"{{::'INVITE_TEACHER_MODAL.TEACHER_NAME' | translate}}\" name=\"teacherName\"\n" +
    "                       ng-model=\"vm.teacherName\">\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <div translate=\".INVITE_MSG\" class=\"invite-msg\"></div>\n" +
    "               <!-- <button type=\"submit\" class=\"md-button success lg drop-shadow\" translate=\".INVITE\"></button>-->\n" +
    "                <button type=\"submit\" class=\"md-button lg success drop-shadow\"\n" +
    "                    element-loader\n" +
    "                    fill-loader=\"vm.fillLoader\"\n" +
    "                    show-loader=\"vm.startLoader\"\n" +
    "                    bg-loader=\"'#72ab40'\"\n" +
    "                    precentage=\"50\"\n" +
    "                    font-color=\"'#FFFFFF'\"\n" +
    "                    bg=\"'#87ca4d'\">\n" +
    "                    <span translate=\".INVITE\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "        <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "            <div translate=\".SUCCESS_INVITE\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button class=\"success lg drop-shadow\" ng-click=\"vm.closeModal()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <div class=\"invite-teacher-icon\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/invitation/svg/invitation-close-popup.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "    class=\"invitation-close-popup\">\n" +
    "    <style>\n" +
    "        .invitation-close-popup .st0{fill:none;}\n" +
    "        .invitation-close-popup .st1{fill:none;stroke:\n" +
    "        #ffffff;;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/invitation/svg/invitation-teacher-active-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 193.7 145.6\" xml:space=\"preserve\" class=\"active-teacher-icon\">\n" +
    "<style type=\"text/css\">\n" +
    "	.active-teacher-icon .st0{display:none;fill:none;stroke:#000000;stroke-width:6;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "	.active-teacher-icon .st1{fill:none;stroke:#000000;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "	.active-teacher-icon .st2{display:none;}\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M76.7,114.2H16c-1.6,0-3-1.3-3-3V9c0-1.7,1.4-3,3-3h134c1.6,0,3,1.3,3,3l0,45.9\"/>\n" +
    "<path class=\"st1\" d=\"M135.7,103.2\"/>\n" +
    "<path d=\"M83,137.2H3c-1.7,0-3-1.3-3-3s1.3-3,3-3h80c1.7,0,3,1.3,3,3S84.7,137.2,83,137.2z\"/>\n" +
    "<path d=\"M193.7,145.6c0.8-29.2-29.3-39.7-29.3-39.7l-0.8-0.1c7.1-4.2,11.8-11.9,11.8-20.8c0-12.7-9.8-23.2-22.3-24.1\n" +
    "	c-0.6,0-1.2-0.1-1.8-0.1c-13.3,0-24.2,10.8-24.2,24.2c0,7.5,3.4,14.2,8.8,18.6l-0.9-0.1l-33.2,17.9c-1.8,0.9-3.9,0.3-4.9-1.4\n" +
    "	L82.6,95.5c-0.9-1.6-3.1-3.4-4.9-3.9c-6.1-1.7-9.8,2.3-9.7,7.2c0,1.5,0.8,3.7,1.6,5c3.6,5.5,12.2,18.7,17.4,26.2\n" +
    "	c4.3,6.2,8.4,8,10.8,8.5c1.1,0.2,2.2,0.2,3.3-0.2l9.3-3l-3.3,10.3H193.7z\"/>\n" +
    "<path class=\"st2\" d=\"M65.8,105.8c-1.1-1.7-2.3-4.7-2.3-7.4c0-2.9,0.8-5.6,2.4-7.7l-24.6-34c-1-1.3-0.7-3.2,0.7-4.2\n" +
    "	c1.3-1,3.2-0.7,4.2,0.7L70.7,87c2.5-1,5.3-1.1,8.3-0.2c2.9,0.8,6.1,3.3,7.6,6l12.2,21.3h6.4l23-12.4c-3.6-4.9-5.6-10.9-5.6-17.1\n" +
    "	c0-15.8,12.9-28.7,28.7-28.7c0.6,0,1.2,0,1.8,0.1V9c0-1.6-1.3-3-3-3H16c-1.6,0-3,1.4-3,3v102.2c0,1.6,1.4,3,3,3h55.3\n" +
    "	C69.1,110.8,67.1,107.7,65.8,105.8z M68,21.2h61c1.7,0,3,1.3,3,3s-1.3,3-3,3H68c-1.7,0-3-1.3-3-3S66.3,21.2,68,21.2z M68,41.3h61\n" +
    "	c1.7,0,3,1.3,3,3s-1.3,3-3,3H68c-1.7,0-3-1.3-3-3S66.3,41.3,68,41.3z M68,61.5h46c1.7,0,3,1.3,3,3s-1.3,3-3,3H68c-1.7,0-3-1.3-3-3\n" +
    "	S66.3,61.5,68,61.5z\"/>\n" +
    "<path d=\"M60,120.2H16c-5,0-9-4-9-9V9c0-5,4-9,9-9h134c5,0,9,4,9,9v41.2c0,3.3-2.7,6-6,6s-6-2.7-6-6V12H19v96.2h41c3.3,0,6,2.7,6,6\n" +
    "	S63.3,120.2,60,120.2z\"/>\n" +
    "<path d=\"M129,27.2H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,27.2,129,27.2z\"/>\n" +
    "<path d=\"M129,47.3H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,47.3,129,47.3z\"/>\n" +
    "<path d=\"M114,67.5H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h46c1.7,0,3,1.3,3,3S115.7,67.5,114,67.5z\"/>\n" +
    "<path d=\"M70.7,95.2c-0.9,0-1.8-0.4-2.4-1.2L41.3,56.7c-1-1.3-0.7-3.2,0.7-4.2c1.3-1,3.2-0.7,4.2,0.7l26.9,37.2\n" +
    "	c1,1.3,0.7,3.2-0.7,4.2C71.9,95,71.3,95.2,70.7,95.2z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/invitation/svg/teacher-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 196.7 145.2\" class=\"teacher-icon\">\n" +
    "<path d=\"M76.7,114.2H16c-3.3,0-6-2.7-6-6V6c0-3.3,2.7-6,6-6h134c3.3,0,6,2.7,6,6l0,45.9c0,1.7-1.3,3-3,3c0,0,0,0,0,0\n" +
    "	c-1.7,0-3-1.3-3-3L150,6L16,6v102.2h60.7c1.7,0,3,1.3,3,3S78.4,114.2,76.7,114.2z\"/>\n" +
    "<path d=\"M129,24.2H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,24.2,129,24.2z\"/>\n" +
    "<path d=\"M129,44.3H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,44.3,129,44.3z\"/>\n" +
    "<path d=\"M114,64.5H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h46c1.7,0,3,1.3,3,3S115.7,64.5,114,64.5z\"/>\n" +
    "<path d=\"M153,108.8c-1.6,0-2.9-1.2-3-2.8c-0.1-1.7,1.1-3.1,2.8-3.2c11-0.8,19.6-10.1,19.6-21.1c0-11-8.6-20.3-19.6-21.1\n" +
    "	c-1.7-0.1-2.9-1.6-2.8-3.2c0.1-1.7,1.6-2.9,3.2-2.8c14.1,1.1,25.1,13,25.1,27.1c0,14.1-11,26-25.1,27.1\n" +
    "	C153.1,108.8,153.1,108.8,153,108.8z\"/>\n" +
    "<path d=\"M151.2,108.8c-15,0-27.2-12.2-27.2-27.2s12.2-27.2,27.2-27.2c0.7,0,1.4,0,2.1,0.1c1.7,0.1,2.9,1.6,2.8,3.2s-1.5,2.9-3.2,2.8\n" +
    "	c-0.5,0-1.1-0.1-1.6-0.1c-11.7,0-21.2,9.5-21.2,21.2c0,12.2,10.4,22,22.8,21.1c1.7-0.1,3.1,1.1,3.2,2.8c0.1,1.7-1.1,3.1-2.8,3.2\n" +
    "	C152.5,108.8,151.8,108.8,151.2,108.8z\"/>\n" +
    "<path d=\"M115.6,113.8c-1.1,0-2.1-0.6-2.7-1.6c-0.8-1.5-0.2-3.3,1.3-4.1l20.1-10.6c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1\n" +
    "	L117,113.5C116.5,113.7,116.1,113.8,115.6,113.8z\"/>\n" +
    "<path d=\"M115,114.2c-1.1,0-2.1-0.6-2.7-1.6c-0.8-1.5-0.2-3.3,1.3-4.1l0.6-0.3c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1\n" +
    "	l-0.6,0.3C115.9,114.1,115.4,114.2,115,114.2z\"/>\n" +
    "<path d=\"M193.7,145.2H107c-1,0-1.9-0.5-2.4-1.2c-0.6-0.8-0.7-1.8-0.4-2.7l1.5-4.8l-3.7,1.2c-1.6,0.5-3.3,0.6-4.8,0.3\n" +
    "	c-3.2-0.7-7.9-2.9-12.6-9.7c-5.2-7.6-13.9-20.9-17.4-26.2c-1-1.6-2.1-4.3-2.1-6.6c-0.1-3.5,1.4-6.7,3.9-8.6c2.6-2,6-2.5,9.6-1.4\n" +
    "	c2.5,0.7,5.4,3,6.7,5.3l14.1,24.7c0.2,0.3,0.6,0.4,0.9,0.3l13.3-7c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1l-13.3,7\n" +
    "	c-3.2,1.7-7.1,0.5-8.9-2.6L80,93.5c-0.5-1-2.1-2.2-3.2-2.5c-1.3-0.4-3-0.6-4.3,0.4c-1,0.8-1.6,2.2-1.6,3.8c0,0.9,0.6,2.6,1.1,3.4\n" +
    "	c3.5,5.4,12.2,18.6,17.3,26.1c3.8,5.5,7.2,6.9,8.9,7.3c0.6,0.1,1.2,0.1,1.7-0.1l9.2-3c1.1-0.3,2.2-0.1,3,0.7s1.1,2,0.7,3l-2.1,6.4\n" +
    "	h79.5c-1.3-24.4-26.2-33.4-27.3-33.8c-1.6-0.5-2.4-2.3-1.8-3.8c0.5-1.6,2.3-2.4,3.8-1.8c0.3,0.1,32.1,11.6,31.3,42.6\n" +
    "	C196.6,143.9,195.3,145.2,193.7,145.2z\"/>\n" +
    "<path d=\"M70.7,92.2c-0.9,0-1.8-0.4-2.4-1.2L41.3,53.7c-1-1.3-0.7-3.2,0.7-4.2c1.3-1,3.2-0.7,4.2,0.7l26.9,37.2\n" +
    "	c1,1.3,0.7,3.2-0.7,4.2C71.9,92,71.3,92.2,70.7,92.2z\"/>\n" +
    "<path d=\"M83,134.2H3c-1.7,0-3-1.3-3-3s1.3-3,3-3h80c1.7,0,3,1.3,3,3S84.7,134.2,83,134.2z\"/>\n" +
    "</svg>\n" +
    "");
}]);
