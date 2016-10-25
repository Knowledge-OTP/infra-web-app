(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationService',

        function ($mdDialog, ENV, AuthService, $q, $http, $timeout, PopUpSrv, $filter, UserProfileService, InfraConfigSrv, StudentContextSrv) {
            'ngInject';
            var self = this;
            var invitationEndpoint = ENV.backendEndpoint + 'invitation';
            var translate = $filter('translate');
            var registerEvents = {};
            var httpConfig = {
                headers: 'application/json',
                timeout: ENV.promiseTimeOut
            };

            this.listeners = {
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

            this.offListenerCB = function (event, valueCB) {
                InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    var userId = StudentContextSrv.getCurrUid();
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

            this.registerListenerCB = function (event, valueCB) {
                InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    var userId = StudentContextSrv.getCurrUid();
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
                    case self.listeners.USER_TEACHERS:
                        listenerData.cb = userTeachersCB;
                        break;
                    case self.listeners.NEW_INVITATIONS:
                        listenerData.cb = newInvitationsCB;
                        break;
                    case self.listeners.PENDING_CONFIRMATIONS:
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

                        angular.forEach(registerEvents[userId][self.listeners.USER_TEACHERS].cb, function (cb) {
                            if (angular.isFunction(cb)) {
                                $timeout(function () {
                                    cb(teacher);
                                });
                            }
                        });
                    });
                }
            }

            function newInvitationsCB (data) {
                var userId = StudentContextSrv.getCurrUid();
                angular.forEach(registerEvents[userId][self.listeners.NEW_INVITATIONS].cb, function (cb) {
                    if (angular.isFunction(cb)) {
                        $timeout(function () {
                            cb(data);
                        });
                    }
                });
            }

            function pendingConfirmationsCB (data) {
                var userId = StudentContextSrv.getCurrUid();
                angular.forEach(registerEvents[userId][self.listeners.PENDING_CONFIRMATIONS].cb, function (cb) {
                    if (angular.isFunction(cb)) {
                        $timeout(function () {
                            cb(data);
                        });
                    }
                });
            }
        }
    );
})(angular);
