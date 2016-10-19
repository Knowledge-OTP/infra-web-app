(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationService',

        function ($mdDialog, ENV, AuthService, $q, $http, PopUpSrv, $filter, UserProfileService, InvitationListenerService, InfraConfigSrv, StudentContextSrv) {
            'ngInject';

            var invitationEndpoint = ENV.backendEndpoint + 'invitation';
            var translate = $filter('translate');
            var httpConfig = {
                headers: 'application/json',
                timeout: ENV.promiseTimeOut
            };

            /*-------------------New Code Start --------------------------------------------*/
            var registerEvents = {};

            this.offMyTeachersCB = function (userId, valueCB) {
                InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    var path = 'users/' + userId + '/invitations/approved/';
                    studentStorage.offEvent('value', path, myTeachersCB);

                    angular.forEach(registerEvents[userId].valueCB, function (cb, index) {
                        if (cb === valueCB) {
                            registerEvents[userId].valueCB.splice(index, 1);
                        }
                    });
                });
            };

            this.registerMyTeachersCB = function (userId, valueCB) {
                InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    if (!registerEvents[userId]) {
                        registerEvents[userId] = {};
                    }

                    if (!registerEvents[userId].valueCB) {
                        registerEvents[userId].valueCB = [];
                    }
                    registerEvents[userId].valueCB.push(valueCB);

                    var path = 'users/' + userId + '/invitations/approved/';

                    studentStorage.onEvent('value', path, myTeachersCB);
                });
            };

            function myTeachersCB(teachers) {
                if (!angular.isUndefined(teachers)) {
                    var userId = StudentContextSrv.getCurrUid();
                    var promArr = [];
                    angular.forEach(teachers, function (teacher) {
                        var prom = UserProfileService.getProfileByUserId(teacher.senderUid).then(function (profile) {
                            teacher.zinkerzTeacher = profile.zinkerzTeacher;
                        });
                        promArr.push(prom);
                    });

                    $q.all(promArr).then(function () {
                        angular.forEach(registerEvents[userId].valueCB, function (valueCB) {
                            if (angular.isFunction(valueCB)) {
                                valueCB(teachers);
                            }
                        });
                    });
                }
            }

            /*---------------------------------------------------------------*/


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
