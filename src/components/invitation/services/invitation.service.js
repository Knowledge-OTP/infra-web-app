(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationService',

        function ($mdDialog, ENV, AuthService, $q, $http, $timeout, PopUpSrv, $filter, UserProfileService, InfraConfigSrv, StudentContextSrv) {
            'ngInject';
            var self = this;
            var invitationEndpoint = ENV.backendEndpoint + 'invitation';
            var translate = $filter('translate');
            var registerEvents = {};
            var myTeachers = {};
            var newInvitations = {};
            var pendingConfirmations = {};
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
                receiverDelete: 6,
                senderDeletedAfterApproved: 7
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
                    var listenerData = getListenerData(userId, event);

                    if (!registerEvents[userId]) {
                        registerEvents[userId] = {};
                    }

                    if (!registerEvents[userId][event]) {
                        registerEvents[userId][event] = {
                            cb: [valueCB]
                        };
                        studentStorage.onEvent('child_added', listenerData.path, listenerData.childAddedHandler);
                        studentStorage.onEvent('child_removed', listenerData.path, listenerData.childRemoveHandler);
                    } else {
                        // listener is register fot this event for current User
                        // add cb to cb's array & return data
                        registerEvents[userId][event].cb.push(valueCB);
                        applyCallback(event, valueCB);

                    }
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

            this.sendInvitations = function (newInvitations) {

                return UserProfileService.getProfile().then(function (profile) {
                    angular.forEach(newInvitations, function (invitation) {
                        addInvitationUserData(invitation, profile);
                    });
                    return $http.post(invitationEndpoint, newInvitations, httpConfig).then(
                        function (response) {
                            return {
                                data: response.data
                            };
                        }, function _error(error) {
                            return {
                                data: error.data || translate('INVITE_APPROVE_MODAL.GENERAL_ERROR')
                            };
                        });
                });
            };

            this.resentInvitation = function (inviteId) {
                return this.getInvitationObject(inviteId).then(function (invitation) {
                    var authData = AuthService.getAuth();
                    invitation.uid = authData.uid;
                    invitation.status = self.invitationStatus.resent;
                    return self.updateInvitation(invitation).then(
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
                });
            };

            this.updateInvitation = function (invitation) {
                return UserProfileService.getProfile().then(function (profile) {
                    addInvitationUserData(invitation, profile);
                    return self.updateStatus(invitation);
                });
            };

            this.getInvitationObject = function (inviteId) {
                return InfraConfigSrv.getGlobalStorage().then(function (storage) {
                    return storage.get('invitations/' + inviteId);
                });

            };

            this.deletePendingInvitation = function (inviteId) {
                return this.getInvitationObject(inviteId).then(function (invitation) {
                    var authData = AuthService.getAuth();
                    invitation.uid = authData.uid;
                    invitation.status = self.invitationStatus.senderDelete;
                    return self.updateInvitation(invitation).then(
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
                });
            };

            this.approveInvitation = function (invitation) {
                var oldInvitationStatus = invitation.status;
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.status = self.invitationStatus.approved;
                return updateStatus(invitation, oldInvitationStatus);
            };

            this.declineInvitation = function (invitation) {
                var oldInvitationStatus = invitation.status;
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.status = self.invitationStatus.receiverDeclined;
                return updateStatus(invitation, oldInvitationStatus);
            };

            this.connectSupportToUser = function (userData) {
                var config = {
                    timeout: ENV.promiseTimeOut
                };

                return $http.post(invitationEndpoint + '/support', userData, config).then(
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
            };

            function addInvitationUserData(invitation, profile) {
                var senderEmail;
                var authData = AuthService.getAuth();
                if (authData.password && authData.password.email) {
                    senderEmail = authData.password.email;
                } else if (authData.auth && authData.auth.email) {
                    senderEmail = authData.auth.email;
                } else if (authData.token && authData.token.email) {
                    senderEmail = authData.token.email;
                }

                invitation.senderUid = authData.uid;
                invitation.senderName = profile.nickname || profile.email;
                invitation.senderAppName = ENV.firebaseAppScopeName;
                invitation.senderEmail = senderEmail;
                invitation.receiverAppName = ENV.studentAppName;
            }

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

            function getListenerData(userId, event) {
                var listenerData = {
                    path: 'users/' + userId + '/invitations/' + event
                };

                switch (event) {
                    case self.listeners.USER_TEACHERS:
                        listenerData.childAddedHandler = userTeachersChildAdded;
                        listenerData.childRemoveHandler = userTeachersChildRemove;
                        break;
                    case self.listeners.NEW_INVITATIONS:
                        listenerData.childAddedHandler = newInvitationsChildAdded;
                        listenerData.childRemoveHandler = newInvitationsChildRemove;
                        break;
                    case self.listeners.PENDING_CONFIRMATIONS:
                        listenerData.childAddedHandler = pendingConfirmationsChildAdded;
                        listenerData.childRemoveHandler = pendingConfirmationsChildRemove;
                        break;
                }

                return listenerData;
            }

            function userTeachersChildAdded(teacher) {
                if (angular.isDefined(teacher)) {
                    UserProfileService.getProfileByUserId(teacher.senderUid).then(function (profile) {
                        teacher.zinkerzTeacher = profile.zinkerzTeacher;
                        teacher.zinkerzTeacherSubject = profile.zinkerzTeacherSubject;

                        myTeachers[teacher.senderUid] = teacher;
                        angular.forEach(registerEvents[StudentContextSrv.getCurrUid()][self.listeners.USER_TEACHERS].cb, function (cb) {
                            if (angular.isFunction(cb)) {
                                $timeout(function () {
                                    cb(myTeachers);
                                });
                            }
                        });
                    });
                }
            }

            function userTeachersChildRemove(teacher) {
                if (angular.isDefined(teacher)) {
                    delete myTeachers[teacher.senderUid];
                    angular.forEach(registerEvents[StudentContextSrv.getCurrUid()][self.listeners.USER_TEACHERS].cb, function (cb) {
                        if (angular.isFunction(cb)) {
                            $timeout(function () {
                                cb(myTeachers);
                            });
                        }
                    });
                }
            }

            function newInvitationsChildAdded(invitation) {
                if (angular.isDefined(invitation)) {
                    newInvitations[invitation.invitationId] = invitation;
                    var userId = StudentContextSrv.getCurrUid();
                    angular.forEach(registerEvents[userId][self.listeners.NEW_INVITATIONS].cb, function (cb) {
                        if (angular.isFunction(cb)) {
                            $timeout(function () {
                                cb(newInvitations);
                            });
                        }
                    });
                }
            }

            function newInvitationsChildRemove(invitation) {
                delete newInvitations[invitation.invitationId];
                var userId = StudentContextSrv.getCurrUid();
                angular.forEach(registerEvents[userId][self.listeners.NEW_INVITATIONS].cb, function (cb) {
                    if (angular.isFunction(cb)) {
                        $timeout(function () {
                            cb(newInvitations);
                        });
                    }
                });
            }

            function pendingConfirmationsChildAdded(invitation) {
                if (angular.isDefined(invitation)) {
                    pendingConfirmations[invitation.invitationId] = invitation;
                    var userId = StudentContextSrv.getCurrUid();
                    angular.forEach(registerEvents[userId][self.listeners.PENDING_CONFIRMATIONS].cb, function (cb) {
                        if (angular.isFunction(cb)) {
                            $timeout(function () {
                                cb(pendingConfirmations);
                            });
                        }
                    });
                }
            }

            function pendingConfirmationsChildRemove(invitation) {
                delete pendingConfirmations[invitation.invitationId];
                var userId = StudentContextSrv.getCurrUid();
                angular.forEach(registerEvents[userId][self.listeners.PENDING_CONFIRMATIONS].cb, function (cb) {
                    if (angular.isFunction(cb)) {
                        $timeout(function () {
                            cb(pendingConfirmations);
                        });
                    }
                });
            }

            function applyCallback(event, cb) {
                switch (event) {
                    case self.listeners.USER_TEACHERS:
                        cb(myTeachers);
                        break;
                    case self.listeners.NEW_INVITATIONS:
                        cb(newInvitations);
                        break;
                    case self.listeners.PENDING_CONFIRMATIONS:
                        cb(pendingConfirmations);
                        break;
                }
            }
        }
    );
})(angular);
