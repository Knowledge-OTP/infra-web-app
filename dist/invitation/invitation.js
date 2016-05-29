(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation',
        ['ngMaterial',
        'znk.infra.svgIcon',
        'znk.infra.popUp',
        'pascalprecht.translate',
        'znk.infra-web-app.purchase',
        'znk.infra.user']);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('invitationApproveModalCtrl',

        function (locals, $mdDialog, InvitationHelperService, $filter, PopUpSrv) {
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
        }
    );
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').directive('invitationManager',

        function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv) {
            'ngInject';

           return {
                templateUrl: 'components/invitation/directives/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope, element) {
                    var t = element;
                    t= 3;
                    //if (!ENV.dashboardFeatureEnabled) {
                    //    element.remove();
                    //    return;
                    //}

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


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('inviteTeacherModalController',

        function ($mdDialog, InvitationService, PopUpSrv, $filter, $timeout) {
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
        }
    );
})(angular);

'use strict';

angular.module('znk.infra-web-app.invitation').service('InvitationListenerService',
    function (ENV, InfraConfigSrv, AuthService, $timeout, $q) {
        'ngInject';

        var studentStorageProm = InfraConfigSrv.getStudentStorage();

        var NEW_INVITATION_PATH, SENT_INVITATION_PATH, MY_TEACHER_PATH;

        var self = this;
        self.receivedInvitations = {};
        self.pendingConformations = {};
        self.declinedInvitations = {};
        self.myTeacher = {};


        var pathsProm = $q.when(studentStorageProm).then(function (studentStorage) {
            var STUDENT_INVITATION_PATH = studentStorage.variables.appUserSpacePath + '/invitations';
            NEW_INVITATION_PATH = STUDENT_INVITATION_PATH + '/received';
            SENT_INVITATION_PATH = STUDENT_INVITATION_PATH + '/sent';
            MY_TEACHER_PATH = STUDENT_INVITATION_PATH + '/approved/';
           return $q.when();
        });

        this.removeListeners = function () {
            $q.when(pathsProm).then(function(){
                var receivedInvitationRef = firebaseListenerRef(NEW_INVITATION_PATH);
                receivedInvitationRef.off('child_added', receivedInvitationsChildAdded);
                receivedInvitationRef.off('child_removed', receivedInvitationsChildRemoved);

                var myTeacherRef = firebaseListenerRef(MY_TEACHER_PATH);
                myTeacherRef.off('child_added', myTeacherChildAdded);
                myTeacherRef.off('child_removed', myTeacherChildRemoved);

                var sentInvitationRef = firebaseListenerRef(SENT_INVITATION_PATH);
                sentInvitationRef.off('child_added', sentInvitationsChildAdded);
                sentInvitationRef.off('child_removed', sentInvitationsChildRemoved);
            });
        };


        self.addListeners = function () {
            $q.when(pathsProm).then(function(){
                _childAddedOrRemovedListener(NEW_INVITATION_PATH, receivedInvitationsChildAdded, receivedInvitationsChildRemoved);
                _childAddedOrRemovedListener(MY_TEACHER_PATH, myTeacherChildAdded, myTeacherChildRemoved);
                _childAddedOrRemovedListener(SENT_INVITATION_PATH, sentInvitationsChildAdded, sentInvitationsChildRemoved);
            });
        };

        function _childAddedOrRemovedListener(path, childAddedHandler, childRemovedHandler){
            var ref = firebaseListenerRef(path);
            ref.on('child_added', childAddedHandler);
            ref.on('child_removed', childRemovedHandler);
        }


        function receivedInvitationsChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.receivedInvitations[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function receivedInvitationsChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.receivedInvitations[dataSnapshot.key()];
                }
            });
        }

        function myTeacherChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.myTeacher[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function myTeacherChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.myTeacher[dataSnapshot.key()];
                }
            });
        }

        function sentInvitationsChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.pendingConformations[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function sentInvitationsChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.pendingConformations[dataSnapshot.key()];
                }
            });
        }

        function firebaseListenerRef(userPath) {
            var authData = AuthService.getAuth();
            var fullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + userPath;
            var userFullPath = fullPath.replace('$$uid', authData.uid);
            return new Firebase(userFullPath);
        }

    }
);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationService',

        function ($mdDialog, ENV, AuthService, $q, $http, PopUpSrv, $filter, UserProfileService, InvitationListenerService) {
            'ngInject';

            var invitationEndpoint = ENV.backendEndpoint + 'invitation';
            var translate = $filter('translate');
            var httpConfig = {
                headers: 'application/json',
                timeout: ENV.promiseTimeOut
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

            this.getMyTeacher = function () {
                return $q.when(InvitationListenerService.myTeacher);
            };

            this.getReceived = function () {
                return $q.when(InvitationListenerService.receivedInvitations);
            };

            this.getPendingConformations = function () {
                return $q.when(InvitationListenerService.pendingConformations);
            };

            this.getDeclinedInvitations = function () {
                return $q.when(InvitationListenerService.declinedInvitations);
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
                            controller: 'InvitationApproveModalController',
                            controllerAs: 'vm',
                            templateUrl: 'app/components/invitation/approveModal/invitationApproveModal.template.html',
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
                    controller: 'InviteTeacherModalController',
                    controllerAs: 'vm',
                    templateUrl: 'app/components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html',
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

            this.removeListeners = function () {
                InvitationListenerService.removeListeners();
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

            InvitationListenerService.addListeners();
        }
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationHelperService',

        function (InvitationService, $filter, PopUpSrv, UserProfileService) {
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
        }
    );
})(angular);

angular.module('znk.infra-web-app.invitation').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/invitation/approveModal/invitationApproveModal.template.html",
    "<md-dialog ng-cloak class=\"invitation-confirm-modal\" translate-namespace=\"INVITE_APPROVE_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"close-popup\"></svg-icon>\n" +
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
    "<md-menu md-offset=\"-225 51\" translate-namespace=\"INVITATION_MANAGER_DIRECTIVE\" class=\"invitation-manager\">\n" +
    "    <div ng-click=\"$mdOpenMenu($event);\" class=\"md-icon-button invite-icon-btn\" aria-label=\"Open Invite menu\" ng-switch=\"hasItems(myTeachers)\">\n" +
    "        <div class=\"num-of-receive\" ng-if=\"hasItems(invitations)\">{{getItemsCount(invitations)}}</div>\n" +
    "        <section ng-switch-when=\"false\" class=\"circle-invite-wrap teacher-icon-wrap\">\n" +
    "            <svg-icon name=\"teacher-icon\"></svg-icon>\n" +
    "        </section>\n" +
    "        <section ng-switch-when=\"true\" class=\"circle-invite-wrap teacher-active-icon-wrap\">\n" +
    "            <svg-icon name=\"teacher-active-icon\"></svg-icon>\n" +
    "        </section>\n" +
    "    </div>\n" +
    "    <md-menu-content class=\"md-menu-content-invitation-manager\" ng-switch=\"(hasItems(invitations) || hasItems(myTeachers) || hasItems(declinedInvitations) || hasItems(conformations))\">\n" +
    "        <div class=\"empty-invite\" ng-switch-when=\"false\">\n" +
    "            <div class=\"empty-msg\" translate=\".EMPTY_INVITE\"></div>\n" +
    "            <div class=\"invite-action\">\n" +
    "                <div class=\"md-button outline-blue invite-btn\" ng-click=\"openInviteModal()\">\n" +
    "                    <div translate=\".INVITE_STUDENTS\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"hasItems(myTeachers)\" class=\"my-teacher-wrap\" ng-repeat=\"teacher in myTeachers\">\n" +
    "            <div class=\"title\" translate=\".MY_TEACHER\"></div>\n" +
    "            <div class=\"teacher-name\">{{::teacher.senderName}}</div>\n" +
    "            <div class=\"teacher-email\">{{::teacher.senderEmail}}</div>\n" +
    "            <svg-icon name=\"close-popup\" class=\"delete-teacher\" ng-click=\"deleteTeacher(teacher)\"></svg-icon>\n" +
    "        </div>\n" +
    "        <md-list ng-if=\"hasItems(declinedInvitations)\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::declinedTitle}}</md-subheader>\n" +
    "            <md-list-item class=\"declined-invitation-list\" ng-repeat=\"declinedInvitation in declinedInvitations\">\n" +
    "                <div class=\"declined-teacher-wrap\">\n" +
    "                    <div class=\"teacher-name\">{{::declinedInvitation.teacherName}} </div>\n" +
    "                    <span class=\"declined-your-invitation-text\" translate=\".DECLINED_YOR_INVITATION\"></span>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "        <md-list ng-if=\"hasItems(invitations)\" ng-switch-when=\"true\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::pendingTitle}}</md-subheader>\n" +
    "            <md-list-item ng-repeat=\"invite in invitations\">\n" +
    "                <svg-icon name=\"received-invitations-icon\" class=\"received-invitations\"></svg-icon>\n" +
    "                <div class=\"teacher-wrap\">\n" +
    "                    <div class=\"teacher-name\">{{::invite.senderName}}</div>\n" +
    "                    <div class=\"creation-time\">{{::invite.creationTime | date : 'd MMM, h:mm a'}}</div>\n" +
    "                </div>\n" +
    "                <div class=\"decline-invite\">\n" +
    "                    <svg-icon name=\"close-popup\" class=\"decline-invite-btn\" ng-click=\"decline(invite)\"></svg-icon>\n" +
    "                </div>\n" +
    "                <div class=\"approve-invite\">\n" +
    "                    <svg-icon name=\"v-icon\" class=\"v-icon-btn\" ng-click=\"approve(invite)\"></svg-icon>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "        <md-list ng-if=\"hasItems(conformations)\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::pendingConformationsTitle}}</md-subheader>\n" +
    "            <md-list-item ng-repeat=\"conformation in conformations\">\n" +
    "                <svg-icon name=\"sent-invitations-icon\" class=\"sent-invitations\"></svg-icon>\n" +
    "                <div class=\"teacher-wrap\">\n" +
    "                    <div class=\"teacher-email\">{{::conformation.receiverName}}</div>\n" +
    "                </div>\n" +
    "                <div class=\"decline-conformation\">\n" +
    "                    <svg-icon name=\"close-popup\" class=\"decline-conformation-btn\" ng-click=\"deletePendingConformations(conformation)\"></svg-icon>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "    </md-menu-content>\n" +
    "</md-menu>\n" +
    "");
  $templateCache.put("components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html",
    "<md-dialog class=\"invite-teacher-modal-wrap\" ng-cloak translate-namespace=\"INVITE_TEACHER_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"close-popup\"></svg-icon>\n" +
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
}]);
