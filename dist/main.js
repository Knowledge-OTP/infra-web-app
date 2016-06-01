(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function(){}
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('WebAppInfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var webAppInfraConfigSrv = {};

                    return webAppInfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.config',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'diagnostic-intro-check-mark': 'components/diagnosticIntro/svg/check-mark-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').directive('diagnosticIntro', ['DiagnosticIntroSrv', '$translatePartialLoader', '$log',
    function DiagnosticIntroDirective(DiagnosticIntroSrv, $translatePartialLoader, $log) {

    var directive = {
        restrict: 'E',
        scope: {
            showInstructions: '=?'
        },
        templateUrl: 'components/diagnosticIntro/diagnosticIntro.template.html',
        link: function link(scope) {

            $translatePartialLoader.addPart('diagnosticIntro');

            scope.d = {};

            DiagnosticIntroSrv.getActiveData().then(function(activeData) {
                if (!activeData || !activeData.id) {
                    $log.error('DiagnosticIntroDirective: activeData id must exist!');
                }
                scope.d.activeId = activeData.id;
                return DiagnosticIntroSrv.getConfigMap();
            }).then(function(mapData) {
                if (!angular.isArray(mapData.subjects)) {
                    $log.error('DiagnosticIntroDirective: configMap must have subjects array!');
                }
                var currMapData;
                var currMapIndex;

                scope.d.subjects = mapData.subjects.map(function (subject, index) {
                    subject.mapId = index + 1;
                    return subject;
                });

                switch (scope.d.activeId) {
                    case 'none':
                        currMapIndex = -1;
                        currMapData = mapData.none;
                        break;
                    case 'all':
                        currMapIndex = Infinity;
                        currMapData = mapData.all;
                        break;
                    default:
                        currMapData = scope.d.subjects.filter(function(subject) {
                            return subject.id === scope.d.activeId;
                        })[0];
                        currMapIndex = currMapData.mapId;
                }

                scope.d.currMapData = currMapData;
                scope.d.currMapIndex = currMapIndex;
            }).catch(function(err) {
                $log.error('DiagnosticIntroDirective: Error catch' + err);
            });
        }
    };

    return directive;
}]);

'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').provider('DiagnosticIntroSrv', [
    function DiagnosticIntroSrv() {

        var _activeData;

        var _configMap;

        this.setActiveSubjectGetter = function(activeData) {
            _activeData = activeData;
        };

        this.setConfigGetter = function(configMap) {
            _configMap = configMap;
        };

        this.$get = ['$injector', '$log', '$q', function($injector, $log, $q) {
            return {
                getActiveData: function() {
                    if (!_activeData) {
                        $log.error('DiagnosticIntroSrv: no activeData!');
                    }
                    return $q.when($injector.invoke(_activeData));
                },
                getConfigMap: function() {
                    if (!_configMap) {
                        $log.error('DiagnosticIntroSrv: no configMap!');
                    }
                    return $q.when($injector.invoke(_configMap));
                }
            };
        }];
}]);

angular.module('znk.infra-web-app.diagnosticIntro').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/diagnosticIntro/diagnosticIntro.template.html",
    "<div class=\"diagnostic-intro-drv\" translate-namespace=\"DIAGNOSTIC_INTRO\">\n" +
    "    <div class=\"description\">\n" +
    "        <div class=\"diagnostic-text\" translate=\".DIAG_DESCRIPTION_{{d.currMapData.subjectNameAlias | uppercase}}\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"icons-section\" ng-class=\"{pristine: d.currMapIndex === -1}\">\n" +
    "        <div ng-repeat=\"subject in d.subjects\"\n" +
    "             class=\"icon-circle {{subject.subjectNameAlias}}-color\"\n" +
    "             ng-class=\"{\n" +
    "                    active: subject.mapId === d.currMapIndex,\n" +
    "                    done: subject.mapId < d.currMapIndex\n" +
    "            }\">\n" +
    "            <div class=\"icon-wrapper\">\n" +
    "                <svg-icon class=\"subject-icon\" name=\"{{subject.subjectIconName}}\"></svg-icon>\n" +
    "                <svg-icon class=\"section-complete\" name=\"diagnostic-intro-check-mark\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"raccoon-img-container\">\n" +
    "        <div class=\"raccoon-img-wrapper\">\n" +
    "            <div class=\"diagnostic-raccoon\" ng-class=\"'diagnostic-raccoon-'+d.currMapData.subjectNameAlias\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"section-question\" ng-if=\"!d.currMapData.hideSectionQuestion\">\n" +
    "            <div>\n" +
    "                <span translate=\".DIAG_SUBJECT_TEXT_{{d.currMapData.subjectNameAlias | uppercase}}\"></span>\n" +
    "                <span\n" +
    "                    class=\"{{d.currMapData.subjectNameAlias}}\"\n" +
    "                    translate=\".DIAG_SUBJECT_NAME_{{d.currMapData.subjectNameAlias | uppercase}}\">\n" +
    "                </span>\n" +
    "                <span translate=\".QUESTIONS\"></span>\n" +
    "                <div class=\"diagnostic-instructions\" ng-if=\"showInstructions\">\n" +
    "                    <span class=\"diagnostic-instructions-title\" translate=\".INSTRUCTIONS_TITLE\"></span>\n" +
    "                    <span class=\"diagnostic-instructions-text\" translate=\".DIAG_INSTRUCTIONS_{{d.currMapData.subjectNameAlias | uppercase}}\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticIntro/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation',
        ['ngMaterial',
        'znk.infra.svgIcon',
        'znk.infra.popUp',
        'pascalprecht.translate',
        'znk.infra-web-app.purchase',
        'znk.infra.user'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'invitation-teacher-icon': 'components/invitation/svg/teacher-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

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

        function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv, $translatePartialLoader) {
            'ngInject';

           return {
                templateUrl: 'components/invitation/directives/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope) {
                    // if (!ENV.dashboardFeatureEnabled) {
                    //    element.remove();
                    //    return;
                    // }

                    scope.translate = $filter('translate');
                    $translatePartialLoader.addPart('invitation');


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
            //var authData = AuthService.getAuth();
            var authData = 'sadssad';
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
    "<div translate-namespace=\"INVITATION_MANAGER_DIRECTIVE\">\n" +
    "<md-menu md-offset=\"-225 51\"  class=\"invitation-manager\">\n" +
    "    <div ng-click=\"$mdOpenMenu($event);\" class=\"md-icon-button invite-icon-btn\" aria-label=\"Open Invite menu\" ng-switch=\"hasItems(myTeachers)\">\n" +
    "        <div class=\"num-of-receive\" ng-if=\"hasItems(invitations)\">{{getItemsCount(invitations)}}</div>\n" +
    "        <section ng-switch-when=\"false\" class=\"circle-invite-wrap teacher-icon-wrap\">\n" +
    "            <svg-icon name=\"invitation-teacher-icon\"></svg-icon>\n" +
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
    "</div>\n" +
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

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm', [
        'pascalprecht.translate',
        'znk.infra.svgIcon'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'login-form-envelope': 'components/loginForm/svg/login-form-envelope.svg',
                'login-form-lock': 'components/loginForm/svg/login-form-lock.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').directive('loginForm', [
        '$translatePartialLoader', 'LoginFormSrv',
        function ($translatePartialLoader, LoginFormSrv) {
            return {
                templateUrl: 'components/loginForm/templates/loginForm.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginForm');

                    scope.vm = {};

                    scope.vm.submit = function(){
                        LoginFormSrv.login(scope.vm.formData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').service('LoginFormSrv', [
        'ENV', '$http', '$window',
        function (ENV, $http, $window) {
            this.login = function(loginData){
                var ref = new Firebase(ENV.fbGlobalEndPoint);
                return ref.authWithPassword(loginData).then(function(authData){
                    var postUrl = ENV.backendEndpoint + 'firebase/token';
                    var postData = {
                        email: authData.password ? authData.password.email : '',
                        uid: authData.uid,
                        fbDataEndPoint: ENV.fbDataEndPoint,
                        fbEndpoint: ENV.fbGlobalEndPoint,
                        auth: ENV.dataAuthSecret,
                        token: authData.token
                    };

                    return $http.post(postUrl, postData).then(function (token) {
                        var refDataDB = new Firebase(ENV.fbDataEndPoint);
                        refDataDB.authWithCustomToken(token.data).then(function(){
                            var appUrl = ENV.redirectLogin;
                            $window.location.replace(appUrl);
                        });
                    });
                });
            };
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.loginForm').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/loginForm/svg/login-form-envelope.svg",
    "<svg\n" +
    "    class=\"login-form-envelope-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 190.2 143.7\">\n" +
    "    <style>\n" +
    "        .login-form-envelope-svg{\n" +
    "            width: 20px;\n" +
    "            stroke: #CACACA;\n" +
    "            fill: none;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M174.7,141.2H15.4c-7.1,0-12.9-5.8-12.9-12.9V15.4c0-7.1,5.8-12.9,12.9-12.9h159.3c7.1,0,12.9,5.8,12.9,12.9\n" +
    "		v112.8C187.7,135.3,181.9,141.2,174.7,141.2z\"/>\n" +
    "	<path class=\"st0\" d=\"M4.1,7.3l77.3,75.1c7.6,7.4,19.8,7.4,27.4,0l77.3-75.1\"/>\n" +
    "	<line class=\"st0\" x1=\"77\" y1=\"78\" x2=\"7.7\" y2=\"135.5\"/>\n" +
    "	<line class=\"st0\" x1=\"112.8\" y1=\"78\" x2=\"182.1\" y2=\"135.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/svg/login-form-lock.svg",
    "<svg class=\"locked-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .locked-svg{\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/templates/loginForm.directive.html",
    "<ng-form novalidate class=\"login-form-container\" translate-namespace=\"LOGIN_FORM\" ng-submit=\"vm.submit()\">\n" +
    "    <div class=\"title\"\n" +
    "         translate=\".LOGIN\">\n" +
    "    </div>\n" +
    "    <div class=\"inputs-container\">\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-envelope\"></svg-icon>\n" +
    "            <input type=\"text\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                   name=\"email\"\n" +
    "                   ng-model=\"vm.formData.email\">\n" +
    "        </div>\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-lock\"></svg-icon>\n" +
    "            <input type=\"password\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                   name=\"password\"\n" +
    "                   ng-model=\"vm.formData.password\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"submit-btn-wrapper\">\n" +
    "        <button type=\"submit\" translate=\".LOGIN_IN\"></button>\n" +
    "    </div>\n" +
    "    <div class=\"forgot-pwd-wrapper\">\n" +
    "        <span translate=\".FORGOT_PWD\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth-title\" translate=\".CONNECT_WITH\"></div>\n" +
    "    </div>\n" +
    "</ng-form>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'znk.infra.config',
        'znk.infra.analytics',
        'znk.infra.storage',
        'znk.infra.user',
        'ui.router',
        'ngMaterial',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.diagnosticIntro'
    ]).config([
        'SvgIconSrvProvider', '$stateProvider',
        function (SvgIconSrvProvider, $stateProvider) {
            var svgMap = {
                'on-boarding-heart': 'components/onBoarding/svg/onboarding-heart-icon.svg',
                'on-boarding-target': 'components/onBoarding/svg/onboarding-target-icon.svg',
                'on-boarding-hat': 'components/onBoarding/svg/onboarding-hat-icon.svg',
                'on-boarding-dropdown-arrow-icon': 'components/onBoarding/svg/dropdown-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);

            $stateProvider
                .state('onBoarding', {
                    url: '/onBoarding',
                    templateUrl: 'components/onBoarding/templates/onBoarding.template.html',
                    controller: 'OnBoardingController',
                    controllerAs: 'vm',
                    resolve: {
                        onBoardingStep: ['OnBoardingService', function (OnBoardingService) {
                            return OnBoardingService.getOnBoardingStep();
                        }]
                    }
                })
                .state('onBoarding.welcome', {
                    templateUrl: 'components/onBoarding/templates/onBoardingWelcome.template.html',
                    controller: 'OnBoardingWelcomesController',
                    controllerAs: 'vm',
                    resolve: {
                        userProfile: ['UserProfileService', function (UserProfileService) {
                            return UserProfileService.getProfile();
                        }]
                    }
                })
                .state('onBoarding.schools', {
                    templateUrl: 'components/onBoarding/templates/onBoardingSchools.template.html',
                    controller: 'OnBoardingSchoolsController',
                    controllerAs: 'vm'
                })
                .state('onBoarding.goals', {
                    templateUrl: 'components/onBoarding/templates/onBoardingGoals.template.html',
                    controller: 'OnBoardingGoalsController',
                    controllerAs: 'vm'
                })
                .state('onBoarding.diagnostic', {
                    templateUrl: 'components/onBoarding/templates/onBoardingDiagnostic.template.html',
                    controller: 'OnBoardingDiagnosticController',
                    controllerAs: 'vm'
                });
        }
    ]);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ['$state', 'onBoardingStep', '$translatePartialLoader', function($state, onBoardingStep, $translatePartialLoader) {
        $translatePartialLoader.addPart('onBoarding');
        $state.go(onBoardingStep.url);
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingDiagnosticController', ['OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(OnBoardingService, $state, znkAnalyticsSrv) {
        this.setOnboardingCompleted = function (nextState, eventText) {
            znkAnalyticsSrv.eventTrack({
                eventName: 'onBoardingDiagnosticStep',
                props: {
                    clicked: eventText
                }
            });
            OnBoardingService.setOnBoardingStep(OnBoardingService.steps.ROADMAP).then(function () {
                $state.go(nextState);
            });
        };
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingGoalsController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function($state, OnBoardingService, znkAnalyticsSrv) {
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                saveBtn: {
                    title: '.SAVE_AND_CONTINUE',
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingGoalsStep' });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                $state.go('onBoarding.diagnostic');
            };
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingSchoolsController', ['$state', 'OnBoardingService', 'UserSchoolsService', 'znkAnalyticsSrv', '$timeout',
        function($state, OnBoardingService, UserSchoolsService, znkAnalyticsSrv, $timeout) {

            function _addEvent(clicked) {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'onBoardingSchoolsStep',
                    props: {
                        clicked: clicked
                    }
                });
            }

            function _goToGoalsState(newUserSchools, evtName) {
                _addEvent(evtName);
                UserSchoolsService.setDreamSchools(newUserSchools, true).then(function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.GOALS).then(function () {
                        $timeout(function () {
                            $state.go('onBoarding.goals');
                        });
                    });
                });
            }

            this.schoolSelectEvents = {
                onSave: function save(newUserSchools) {
                    _goToGoalsState(newUserSchools, 'Save and Continue');
                }
            };

            this.skipSelection = function () {
                _goToGoalsState([], 'I don\'t know yet');
            };
    }]);
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController', ['userProfile', 'OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(userProfile, OnBoardingService, $state, znkAnalyticsSrv) {

            var onBoardingSettings = OnBoardingService.getOnBoardingSettings();
            this.username = userProfile.nickname || '';

            this.nextStep = function () {
                var nextStep;
                var nextState;
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingWelcomeStep' });
                if (onBoardingSettings.showSchoolStep) {
                    nextStep = OnBoardingService.steps.SCHOOLS;
                    nextState = 'onBoarding.schools';
                } else {
                    nextStep = OnBoardingService.steps.GOALS;
                    nextState = 'onBoarding.goals';
                }
                OnBoardingService.setOnBoardingStep(nextStep);
                $state.go(nextState);
            };
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('onBoardingBar', function OnBoardingBarDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/onBoarding/templates/onBoardingBar.template.html',
            scope: {
                step: '@'
            }
        };

        return directive;
    });

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').provider('OnBoardingService', [function() {
        this.$get = ['InfraConfigSrv', 'StorageSrv', function(InfraConfigSrv, StorageSrv) {
            var self = this;
            var ONBOARDING_PATH = StorageSrv.variables.appUserSpacePath + '/' + 'onBoardingProgress';
            var onBoardingServiceObj = {};

            var onBoardingStates = {
                1: 'onBoarding.welcome',
                2: 'onBoarding.schools',
                3: 'onBoarding.goals',
                4: 'onBoarding.diagnostic',
                5: 'workouts.roadmap'
            };

            onBoardingServiceObj.steps = {
                WELCOME: 1,
                SCHOOLS: 2,
                GOALS: 3,
                DIAGNOSTIC: 4,
                ROADMAP: 5
            };

            onBoardingServiceObj.getOnBoardingStep = function () {
                return getProgress().then(function (progress) {
                    return {
                        url: onBoardingStates[progress.step]
                    };
                });
            };

            onBoardingServiceObj.setOnBoardingStep = function (stepNum) {
                return getProgress().then(function (progress) {
                    progress.step = stepNum;
                    return setProgress(progress);
                });
            };

            function getProgress() {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.get(ONBOARDING_PATH).then(function (progress) {
                        if (!progress.step) {
                            progress.step = 1;
                        }
                        return progress;
                    });
                });
            }

            function setProgress(progress) {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.set(ONBOARDING_PATH, progress);
                });
            }

            onBoardingServiceObj.isOnBoardingCompleted = function () {
                return getProgress().then(function (onBoardingProgress) {
                    return onBoardingProgress.step === self.steps.ROADMAP;
                });
            };

            onBoardingServiceObj.getOnBoardingSettings = function() {
                return self.settings;
            };

            return onBoardingServiceObj;
        }];
    }]);
})(angular);

angular.module('znk.infra-web-app.onBoarding').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/onBoarding/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-hat-icon.svg",
    "<svg class=\"on-boarding-hat-svg\"\n" +
    "     version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-366 104.4 57.2 34.6\"\n" +
    "     style=\"enable-background:new -366 104.4 57.2 34.6;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-hat-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "        width: 47px;\n" +
    "    }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-339.5,139.1c-9.8,0-15.9-5.6-16-5.7c-0.2-0.2-0.3-0.5-0.3-0.7v-11.2c0-0.6,0.4-1,1-1s1,0.4,1,1v10.7\n" +
    "		c2.1,1.7,13.5,10.2,30-0.1v-10.6c0-0.6,0.4-1,1-1s1,0.4,1,1v11.2c0,0.3-0.2,0.7-0.5,0.8C-328.7,137.7-334.6,139.1-339.5,139.1z\"/>\n" +
    "	<path class=\"st0\" d=\"M-338.7,128.5c-0.1,0-0.3,0-0.4-0.1l-26.1-10.5c-0.4-0.2-0.7-0.6-0.7-1.1c0-0.5,0.3-0.9,0.7-1.1l26.5-11.2\n" +
    "		c0.3-0.1,0.6-0.1,0.9,0l26.6,11.2c0.4,0.2,0.7,0.6,0.7,1.1c0,0.5-0.3,0.9-0.7,1.1l-27,10.5C-338.4,128.4-338.6,128.5-338.7,128.5z\n" +
    "		 M-361.7,116.8l23,9.3l23.9-9.3l-23.5-9.9L-361.7,116.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312.8,126.5c-0.6,0-1-0.4-1-1v-8c0-0.6,0.4-1,1-1s1,0.4,1,1v8C-311.8,126.1-312.2,126.5-312.8,126.5z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312,130.5c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,1.4-3.1,3.1-3.1s3.1,1.4,3.1,3.1\n" +
    "		C-308.9,129.1-310.3,130.5-312,130.5z M-312,126.7c-0.4,0-0.7,0.3-0.7,0.7s0.3,0.7,0.7,0.7s0.7-0.3,0.7-0.7S-311.6,126.7-312,126.7\n" +
    "		z\"/>\n" +
    "	<path class=\"st0\" d=\"M-315,132.7l1.5-2.7c0.6-1.1,2.2-1.1,2.9,0l1.5,2.7c0.6,1.1-0.2,2.5-1.4,2.5h-3.1\n" +
    "		C-314.8,135.2-315.6,133.8-315,132.7z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-heart-icon.svg",
    "<svg class=\"on-boarding-heart-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-377 106.7 35.9 31.3\"\n" +
    "     style=\"enable-background:new -377 106.7 35.9 31.3;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-heart-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "    </style>\n" +
    "\n" +
    "<path class=\"st0\" d=\"M-359,138c-0.2,0-0.4-0.1-0.6-0.2c-0.1,0-0.1-0.1-0.2-0.1l-0.2-0.2c-4.3-4-8.8-7.9-13.2-11.6\n" +
    "	c-3.1-2.7-4.4-6.5-3.6-10.4c0.9-4,4-7.5,7.7-8.6c3.4-1,6.9,0,10,2.9c3.1-2.9,6.7-3.9,10.1-2.9c3.7,1.1,6.7,4.4,7.6,8.5\n" +
    "	c0.9,3.9-0.4,7.8-3.6,10.5c-6.5,5.5-11.4,10-13,11.5l-0.3,0.2C-358.5,137.9-358.7,138-359,138z M-366.6,108.2\n" +
    "	c-0.7,0-1.4,0.1-2.1,0.3c-3.2,0.9-5.8,3.9-6.6,7.4c-0.4,2-0.6,5.8,3.1,8.9c4.4,3.7,8.8,7.6,13.2,11.6l0,0c1.6-1.5,6.6-6,13-11.6\n" +
    "	c2.7-2.3,3.8-5.6,3.1-9c-0.8-3.5-3.4-6.4-6.5-7.3c-3.1-0.9-6.3,0.2-9.1,3c-0.1,0.1-0.3,0.2-0.5,0.2c0,0,0,0,0,0\n" +
    "	c-0.2,0-0.4-0.1-0.5-0.2C-361.8,109.3-364.2,108.2-366.6,108.2z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-target-icon.svg",
    "<svg class=\"on-boarding-target-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-378 104 35 35\"\n" +
    "     style=\"enable-background:new -378 104 35 35;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.on-boarding-target-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-361,134.6c-7.5,0-13.5-6.1-13.5-13.5s6.1-13.5,13.5-13.5c7.5,0,13.5,6.1,13.5,13.5S-353.5,134.6-361,134.6z\n" +
    "		 M-361,108.8c-6.8,0-12.3,5.5-12.3,12.3c0,6.8,5.5,12.3,12.3,12.3s12.3-5.5,12.3-12.3C-348.7,114.3-354.2,108.8-361,108.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,129c-4.4,0-7.9-3.6-7.9-7.9c0-4.4,3.6-7.9,7.9-7.9c4.4,0,7.9,3.6,7.9,7.9\n" +
    "		C-353.1,125.5-356.6,129-361,129z M-361,114.4c-3.7,0-6.7,3-6.7,6.7c0,3.7,3,6.7,6.7,6.7s6.7-3,6.7-6.7\n" +
    "		C-354.3,117.4-357.3,114.4-361,114.4z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,139c-0.6,0-1-0.4-1-1v-33c0-0.6,0.4-1,1-1s1,0.4,1,1v33C-360,138.6-360.4,139-361,139z\"/>\n" +
    "	<path class=\"st0\" d=\"M-344,122h-33c-0.6,0-1-0.4-1-1s0.4-1,1-1h33c0.6,0,1,0.4,1,1S-343.4,122-344,122z\"/>\n" +
    "	<circle class=\"st0\" cx=\"-360.9\" cy=\"121.3\" r=\"1.9\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoarding.template.html",
    "<div class=\"on-board\">\n" +
    "    <div class=\"container base-border-radius base-box-shadow\" ui-view></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingBar.template.html",
    "<div class=\"on-board-pager-wrap\">\n" +
    "    <div class=\"on-board-pager\">\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'heart-circle-selected': step === 'welcome'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-heart\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'target-circle-selected': step === 'goals'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-target\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'hat-circle-selected': step === 'diagnostic'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-hat\"></svg-icon>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingDiagnostic.template.html",
    "<section class=\"step diagnostic\" translate-namespace=\"ON_BOARDING.DIAGNOSTIC\">\n" +
    "    <div class=\"diagnostic-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "    <diagnostic-intro></diagnostic-intro>\n" +
    "    <div class=\"btn-wrap\">\n" +
    "        <md-button tabindex=\"2\" class=\"default sm\" ng-click=\"vm.setOnboardingCompleted('app.workouts.roadmap', 'Take It Later')\">\n" +
    "            <span translate=\".TAKE_IT_LATER\"></span>\n" +
    "        </md-button>\n" +
    "        <md-button autofocus tabindex=\"1\" class=\"md-sm primary\" ng-click=\"vm.setOnboardingCompleted('app.workouts.diagnostic', 'Start Test')\">\n" +
    "            <span translate=\".START_TEST\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"diagnostic\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingGoals.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <user-goals on-save=\"vm.saveGoals()\" setting=\"vm.userGoalsSetting\"></user-goals>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingSchools.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <div class=\"sub-title\" translate=\".WHATS_YOUR_DREAM_SCHOOL\"></div>\n" +
    "        <div class=\"select-schools-title\" translate=\".SELECT_3_DREAM_SCHOOLS\"></div>\n" +
    "        <school-select user-schools=\"vm.userSchools\"\n" +
    "                       events=\"vm.schoolSelectEvents\">\n" +
    "        </school-select>\n" +
    "        <div class=\"light-title\" ng-click=\"vm.skipSelection()\" translate=\".I_DONT_KNOW\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"bg-wrap\">\n" +
    "        <div class=\"thinking-raccoon\"></div>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingWelcome.template.html",
    "<section class=\"step make-padding\" translate-namespace=\"ON_BOARDING.WELCOME\">\n" +
    "    <div class=\"welcome\">\n" +
    "        <div class=\"main-title\">\n" +
    "            <span translate=\".WELCOME\"></span>,\n" +
    "            <span class=\"user-name\">{{vm.username}}!</span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\">\n" +
    "            <div translate=\".THANK_YOU_MESSAGE\"></div>\n" +
    "            <span translate=\".ZINKERZ_APP_WELCOME_TEXT\"></span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\" translate=\".WE_ARE_HERE_TO_HELP\"></div>\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <md-button autofocus tabindex=\"1\" class=\"md primary inline-block\"\n" +
    "                       ng-click=\"vm.nextStep()\">\n" +
    "                <span translate=\".CONTINUE\" class=\"continue-title\"></span>\n" +
    "                <svg-icon name=\"on-boarding-dropdown-arrow-icon\"\n" +
    "                          class=\"dropdown-arrow-icon inline-block\">\n" +
    "                </svg-icon>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"smile-raccoon\"></div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"welcome\"></on-boarding-bar>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase',
        ['ngAnimate',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum',
            'znk.infra.config',
            'znk.infra.storage',
            'znk.infra.auth',
            'znk.infra.analytics'
        ])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'purchase-check-mark': 'components/purchase/svg/check-mark-icon.svg',
                    'purchase-close-popup': 'components/purchase/svg/close-popup.svg',
                    'purchase-popup-bullet-1-icon': 'components/purchase/svg/purchase-popup-bullet-1-icon.svg',
                    'purchase-popup-bullet-2-icon': 'components/purchase/svg/purchase-popup-bullet-2-icon.svg',
                    'purchase-popup-bullet-3-icon': 'components/purchase/svg/purchase-popup-bullet-3-icon.svg',
                    'purchase-popup-bullet-4-icon': 'components/purchase/svg/purchase-popup-bullet-4-icon.svg',
                    'purchase-popup-bullet-5-icon': 'components/purchase/svg/purchase-popup-bullet-5-icon.svg',
                    'purchase-raccoon-logo-icon': 'components/purchase/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').controller('PurchaseDialogController',['$mdDialog', 'purchaseService','PurchaseStateEnum',
        function($mdDialog, purchaseService, PurchaseStateEnum) {

            var self = this;

            self.purchaseStateEnum = PurchaseStateEnum;

            function _checkIfHasProVersion() {
                purchaseService.hasProVersion().then(function (hasProVersion) {
                    self.purchaseState = hasProVersion ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                });
            }

            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                pendingPurchaseProm.then(function () {
                    _checkIfHasProVersion();
                });
            } else {
                _checkIfHasProVersion();
            }



            purchaseService.getProduct().then(function (prodObj) {
                self.productPrice = +prodObj.price;
                self.productPreviousPrice = +prodObj.previousPrice;
                self.productDiscountPercentage = Math.floor(100 - ((self.productPrice / self.productPreviousPrice) * 100)) + '%';
            });

            this.close = function () {
                $mdDialog.hide();
            };
        }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').directive('purchaseBtn',
        function (ENV, $q, $sce, AuthService, UserProfileService, $location, purchaseService, $filter, PurchaseStateEnum, $log, $translatePartialLoader, znkAnalyticsSrv) {
            return {
                templateUrl:  'components/purchase/templates/purchaseBtn.template.html',
                restrict: 'E',
                scope: {
                    purchaseState: '='
                },
                link: function (scope) {
                    $translatePartialLoader.addPart('purchase');

                    scope.vm = {};

                    scope.vm.translate = $filter('translate');

                    scope.vm.saveAnalytics = function () {
                        znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderStarted' });
                    };

                    scope.$watch('purchaseState', function (newPurchaseState) {
                        if (angular.isUndefined(newPurchaseState)) {
                            return;
                        }

                        if (newPurchaseState === PurchaseStateEnum.NONE.enum) {
                            buildForm();
                        }

                        if (newPurchaseState === PurchaseStateEnum.PRO.enum) {
                            purchaseService.getUpgradeData().then(function (resp) {
                                /**
                                 * TODO: currently the createdTime doesn't exist in this object, need to add to firebase
                                 */
                                scope.vm.upgradeDate = $filter('date')(resp.creationTime, 'mediumDate');
                            });
                        }
                    });

                    function buildForm() {
                        $q.all([UserProfileService.getProfile(), purchaseService.getProduct()]).then(function (results) {
                            var userEmail = results[0].email;
                            //var userId = AuthService.getAuth().uid;
                            var userId;
                            var productId = results[1].id;

                            if (userEmail && userId) {
                                scope.vm.userEmail = userEmail;
                                scope.vm.hostedButtonId = ENV.purchasePaypalParams.hostedButtonId;
                                scope.vm.custom = userId + '#' + productId + '#' + ENV.fbDataEndPoint + '#' + ENV.firebaseAppScopeName;  // userId#productId#dataEndPoint#appName
                                scope.vm.returnUrlSuccess = buildReturnUrl('purchaseSuccess', '1');
                                scope.vm.returnUrlFailed = buildReturnUrl('purchaseSuccess', '0');
                                scope.vm.formAction = trustSrc(ENV.purchasePaypalParams.formAction);
                                scope.vm.btnImgSrc = trustSrc(ENV.purchasePaypalParams.btnImgSrc);
                                scope.vm.pixelGifSrc = trustSrc(ENV.purchasePaypalParams.pixelGifSrc);
                                scope.vm.showForm = true;
                            } else {
                                /**
                                 * if case of failure
                                 * TODO: Add atatus notification
                                 */
                                $log.error('Invalid user attributes: userId or userEmail are not defined, cannot build purchase form');
                                scope.vm.showPurchaseError = function () {
                                    purchaseService.hidePurchaseDialog().then(function () {
                                        purchaseService.showPurchaseError();
                                    });
                                };
                            }
                        });
                    }

                    function buildReturnUrl(param, val) {
                        return $location.absUrl().split('?')[0] + addUrlParam($location.search(), param, val);
                    }

                    // http://stackoverflow.com/questions/21292114/external-resource-not-being-loaded-by-angularjs
                    // in order to use src and action attributes that link to external url's,
                    // you should whitelist them
                    function trustSrc(src) {
                        return $sce.trustAsResourceUrl(src);
                    }

                    function addUrlParam(searchObj, key, val) {
                        var search = '';
                        if (!angular.equals(searchObj, {})) {
                            search = '?';
                            // parse the search attribute as a string
                            angular.forEach(searchObj, function (v, k) {
                                search += k + '=' + v;
                            });
                        }

                        var newParam = key + '=' + val,
                            urlParams = '?' + newParam;
                        if (search) {
                            urlParams = search.replace(new RegExp('[\?&]' + key + '[^&]*'), '$1' + newParam);
                            if (urlParams === search) {
                                urlParams += '&' + newParam;
                            }
                        }
                        return urlParams;
                    }
                }

            };
        }
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('PurchaseStateEnum',['EnumSrv',
        function(EnumSrv) {

            var PurchaseStateEnum = new EnumSrv.BaseEnum([
                ['PENDING', 'pending', 'pending'],
                ['PRO', 'pro', 'pro'],
                ['NONE', 'none', 'none']
            ]);

            return PurchaseStateEnum;
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        function ($q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window, PopUpSrv, znkAnalyticsSrv) {
            'ngInject';

            var self = this;

            var studentStorageProm = InfraConfigSrv.getStudentStorage();

            var pendingPurchaseDefer;

            var purchaseData = null;

            self.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    return StudentStorageSrv.get(productDataPath);
                });
            };

            self.getUpgradeData = function () {
                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var PURCHASE_PATH = StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                    return StudentStorageSrv.get(PURCHASE_PATH);
                });
            };

            self.hasProVersion = function () {
                var hasProVersion = !!purchaseData;
                return $q.when(hasProVersion);
            };

            self.purchaseDataExists = function () {
                //var isPurchased;
                //var authData = AuthService.getAuth();
                //if (authData) {
                //    var currentUID = authData.uid;
                //    var purchaseFullPath = StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                //    purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                //    return StudentStorageSrv.get(purchaseFullPath).then(function (purchaseObj) {
                //        isPurchased = (angular.equals(purchaseObj, {})) ? false : true;
                //        return isPurchased;
                //    });
                //}
                //return $q.reject();
            };

            self.checkPendingStatus = function () {
                var isPending;
                return $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;

                    return StudentStorageSrv.get(pendingPurchasesPath).then(function (pendingObj) {
                        isPending = (angular.equals(pendingObj, {})) ? false : true;
                        if (isPending) {
                            pendingPurchaseDefer = $q.defer();
                        }
                        return isPending;
                    });
                });
            };

            self.setPendingPurchase = function () {
                pendingPurchaseDefer = $q.defer();
                return $q.all([self.getProduct(), self.purchaseDataExists(), studentStorageProm]).then(function (res) {
                    var product = res[0];
                    var isPurchased = res[1];
                    var StudentStorageSrv = res[2];
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;

                    if (!isPurchased) {
                        var pendingPurchaseVal = {
                            id: product.id,
                            purchaseTime: StudentStorageSrv.variables.currTimeStamp
                        };
                        StudentStorageSrv.set(pendingPurchasesPath, pendingPurchaseVal);
                    } else {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'purchaseOrderCompleted', props: product
                        });
                        if ($window.fbq) {
                            $window.fbq('track', 'Purchase', {
                                value: product.price,
                                currency: 'USD'
                            });
                        }
                    }
                }).catch(function (err) {
                    $log.error('setPendingPurchase promise failed', err);
                    pendingPurchaseDefer.reject(err);
                });
            };

            self.removePendingPurchase = function () {
                if (pendingPurchaseDefer) {
                    pendingPurchaseDefer.resolve();
                }
                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;
                    return StudentStorageSrv.set(pendingPurchasesPath, null);
                });
            };
            //
            //self.listenToPurchaseStatus = function () {
            //    var authData = AuthService.getAuth();
            //    if (authData) {
            //        var currentUID = authData.uid;
            //        var purchaseFullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
            //        purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
            //        var ref = new Firebase(purchaseFullPath);
            //        ref.on('value', function (dataSnapshot) {
            //            var dataSnapshotVal = dataSnapshot.val();
            //
            //            //if (angular.isDefined(dataSnapshotVal)) {
            //            //    if ($state.current.name && $state.current.name !== '') {
            //            //        $state.reload();
            //            //    }
            //            //}
            //
            //            purchaseData = dataSnapshotVal;
            //
            //            StudentStorageSrv.cleanPathCache(PURCHASE_PATH);
            //            if (purchaseData) {
            //                self.removePendingPurchase();
            //            }
            //        });
            //    }
            //};

            self.showPurchaseDialog = function () {
                //a.eventTrack({
                //    eventName: 'purchaseModalOpened'
                //});
                return $mdDialog.show({
                    controller: 'PurchaseDialogController',
                    templateUrl: 'components/purchase/templates/purchasePopup.template.html',
                    disableParentScroll: false,
                    clickOutsideToClose: true,
                    fullscreen: false,
                    controllerAs: 'vm'
                });
            };

            self.hidePurchaseDialog = function () {
                return $mdDialog.hide();
            };

            self.showPurchaseError = function () {
                var popUpTitle = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_TITLE');
                var popUpContent = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_CONTENT');
                PopUpSrv.error(popUpTitle, popUpContent);
            };

            self.getPendingPurchase = function () {
                return pendingPurchaseDefer && pendingPurchaseDefer.promise;
            };

            self.setProductDataOnce = function () {
                var path = 'iap/desktop/allContent';
                var productData = {
                    alias: 'allContent',
                    id: 'com.zinkerz.act.allcontent',
                    type: 'non consumable',
                    price: '39.99',
                    previousPrice: '44.99'
                };

                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    StudentStorageSrv.set(path, productData).then(function (resp) {
                        $log.info(resp);
                    }).catch(function (err) {
                        $log.info(err);
                    });
                });
            };

            /**
             * @param mode:
             *  1 - completed first workout
             *  2 - completed all free content
             */
            self.openPurchaseNudge = function (mode, num) {
                var toastTemplate =
                    '<md-toast class="purchase-nudge" ng-class="{first: vm.mode === 1, all: vm.mode === 2}" translate-namespace="PURCHASE_POPUP">' +
                    '<div class="md-toast-text" flex>' +
                    '<div class="close-toast cursor-pointer" ng-click="vm.closeToast()"><svg-icon name="close-popup"></svg-icon></div>' +
                    '<span translate="{{vm.nudgeMessage}}" translate-values="{num: {{vm.num}} }"></span> ' +
                    '<span class="open-dialog" ng-click="vm.showPurchaseDialog()"><span translate="{{vm.nudgeAction}}"></span></span>' +
                    '</div>' +
                    '</md-toast>';

                $mdToast.show({
                    template: toastTemplate,
                    position: 'top',
                    hideDelay: false,
                    controller: function () {
                        self.closeToast = function () {
                            $mdToast.hide();
                        };

                        self.showPurchaseDialog = function () {
                            self.showPurchaseDialog();
                        };

                        if (mode === 1) { // completed first workout
                            self.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_FIRST_WORKOUT';
                            self.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_FIRST_WORKOUT';
                        } else if (mode === 2) { // completed all free content
                            self.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_ALL_FREE_CONTENT';
                            self.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_ALL_FREE_CONTENT';
                        }
                        self.mode = mode;
                        self.num = num;
                    },
                    controllerAs: 'vm'
                });
            };
        }
    );
})(angular);


angular.module('znk.infra-web-app.purchase').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/purchase/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/close-popup.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "    class=\"close-popup\">\n" +
    "    <style>\n" +
    "\n" +
    "        .close-popup .st0{fill:none;}\n" +
    "        .close-popup .st1{fill:none;stroke:$bgColor3;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/previous-icon.svg",
    "<svg class=\"previous-icon\" x=\"0px\" y=\"0px\" viewBox=\"-406.9 425.5 190.9 175.7\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <circle cx=\"-402.8\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"513\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"479.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"479.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"462.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"463.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"446.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"479.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"547\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"446.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"429.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"463.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"496.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"479.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"530.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"563.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"546.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"597.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"529.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"512.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"513.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-1-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    class=\"purchase-popup-bullet-1-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-1-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "	C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"26.5\" x2=\"96\" y2=\"26.5\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"44.7\" x2=\"70.5\" y2=\"44.7\"/>\n" +
    "<line class=\"st0\" x1=\"48.5\" y1=\"62.9\" x2=\"96\" y2=\"62.9\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"81.1\" x2=\"96\" y2=\"81.1\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"99.3\" x2=\"59.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"72.2\" y1=\"99.3\" x2=\"94.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"22\" y1=\"117.5\" x2=\"95.5\" y2=\"117.5\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-2-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 124 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-2-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-2-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M77.7,139H16.8c-4.5,0-8.3-3.7-8.3-8.3V10.3c0-4.5,3.7-8.3,8.3-8.3h60.9c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C85.9,135.3,82.2,139,77.7,139z\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"21.2\" x2=\"17\" y2=\"21.2\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"40.9\" x2=\"17\" y2=\"40.9\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"60.6\" x2=\"17\" y2=\"60.6\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"80.4\" x2=\"17\" y2=\"80.4\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"100.1\" x2=\"17\" y2=\"100.1\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"119.8\" x2=\"17\" y2=\"119.8\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M122,2v116l-7.3,21l-8.7-20.1V24.5V7.2c0,0,1-5.2,6.6-5.2S122,2,122,2z\"/>\n" +
    "		<line class=\"st2\" x1=\"106\" y1=\"21.7\" x2=\"122\" y2=\"21.7\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-3-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-3-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-3-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st1\" d=\"M39.6,54.6c4.4-5.7,11.7-9.2,19.7-8.2c9.7,1.2,17.4,9.1,18.4,18.7c1.2,11-5.9,20.6-15.9,23.1\n" +
    "			c-3.1,0.8-5.3,3.7-5.3,6.9v8.6\"/>\n" +
    "		<circle cx=\"56.5\" cy=\"116.7\" r=\"2.8\"/>\n" +
    "	</g>\n" +
    "	<line class=\"st2\" x1=\"32.7\" y1=\"34.2\" x2=\"25.7\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"84.8\" y1=\"34.2\" x2=\"91.8\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"59.3\" y1=\"29.5\" x2=\"59.3\" y2=\"18.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-4-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 208.1 203\" class=\"purchase-popup-bullet-4-icon\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .purchase-popup-bullet-4-icon .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h74c0,0-8.8,65.7-14.7,82.9c-5.3,15.6-13,32.6-36.7,43.2c-12.3,5.5-10.3,21.7-10.3,31.5\n" +
    "		c0,11.2,5.4,16.7,13.3,20.4c3.7,1.7,8.3,3.2,14.3,4v15h-40\"/>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h-74c0,0,8.8,65.7,14.7,82.9c5.3,15.6,13,32.6,36.7,43.2c12.3,5.5,10.3,21.7,10.3,31.5\n" +
    "		c0,11.2-5.4,16.7-13.3,20.4c-3.7,1.7-8.3,3.2-14.3,4v15h40\"/>\n" +
    "    </g>\n" +
    "    <path class=\"st1\" d=\"M176.8,20.4c0,0,71.3-1.5-12.2,67.5\"/>\n" +
    "    <path class=\"st1\" d=\"M31.3,20.4c0,0-71.3-1.5,12.2,67.5\"/>\n" +
    "    <polygon class=\"st1\" points=\"102.6,22 113.1,43.4 136.6,46.8 119.6,63.4 123.6,86.9 102.6,75.8 81.5,86.9 85.5,63.4 68.5,46.8\n" +
    "	92,43.4 \"/>\n" +
    "    <line class=\"st2\" x1=\"66.6\" y1=\"193.9\" x2=\"143.6\" y2=\"193.9\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-5-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 148.7 174.7\"\n" +
    "    style=\"enable-background:new 0 0 148.7 174.7;\"\n" +
    "    class=\"purchase-popup-bullet-5-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-5-icon .st0{fill:none;stroke:#231F20;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-5-icon .st1{fill:none;stroke:#231F20;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M93.4,171.7H12.6c-5.3,0-9.6-4.3-9.6-9.6V81.3c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,167.4,98.7,171.7,93.4,171.7z\"/>\n" +
    "	<path class=\"st0\" d=\"M78.7,71.7V39.9C78.7,19.6,93.8,3,112.2,3h0c18.4,0,33.5,16.6,33.5,36.9v31.9\"/>\n" +
    "	<path class=\"st1\" d=\"M53.2,101c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,106.1,47.1,101,53.2,101\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/raccoon-logo.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 237 158\"\n" +
    "    class=\"raccoon-logo-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .raccoon-logo-svg .circle{fill:#000001;}\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"circle\" cx=\"175\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M118.5,155.9c10.2,0,18.5-8.3,18.5-18.5c0-10.2-8.3-18.5-18.5-18.5c-10.2,0-18.5,8.3-18.5,18.5\n" +
    "		C100,147.6,108.3,155.9,118.5,155.9z\"/>\n" +
    "        <path class=\"circle\" d=\"M172.4,67.5c-15.8-9.7-34.3-15.3-53.9-15.3c-19.6,0-38.2,5.5-53.9,15.3\n" +
    "		c13,1.3,23.1,12.3,23.1,25.6c0,1.8-0.2,3.5-0.5,5.1c9.3-5.2,20-8.1,31.3-8.1c11.3,0,22,2.9,31.4,8.1c-0.3-1.7-0.5-3.4-0.5-5.1\n" +
    "		C149.3,79.8,159.5,68.8,172.4,67.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M36.3,93.5c-8,10.8-14,23.4-17.4,37.2c-1.2,4.9-0.4,10,2.3,14.3c2.6,4.3,6.8,7.3,11.7,8.5\n" +
    "		c1.5,0.4,3,0.5,4.5,0.5c8.8,0,16.3-6,18.4-14.5c1.8-7.7,5-14.7,9.2-20.9c-1,0.1-2,0.2-3,0.2C47.9,118.8,36.5,107.5,36.3,93.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M232.2,92.5c0.6-6.7,6.5-78-4.5-88.4c-9.5-9.1-60.3,16-77.5,24.9\n" +
    "		C185.3,37.8,215,60.9,232.2,92.5z\"/>\n" +
    "        <circle class=\"circle\" cx=\"62\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M204.1,153.6c10.2-2.4,16.4-12.7,14-22.8c-3.3-13.8-9.3-26.4-17.4-37.2\n" +
    "		c-0.2,14-11.6,25.3-25.7,25.3c-1,0-2-0.1-3-0.2c4.2,6.2,7.4,13.3,9.2,21c2,8.6,9.6,14.5,18.4,14.5\n" +
    "		C201.1,154.1,202.6,153.9,204.1,153.6\"/>\n" +
    "        <path class=\"circle\" d=\"M86.7,29C69.5,20.1,18.8-5,9.2,4.1c-11,10.4-5.1,81.5-4.5,88.4C22,60.8,51.7,37.8,86.7,29z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchaseBtn.template.html",
    "<ng-switch on=\"purchaseState\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "\n" +
    "    <div ng-switch-when=\"pending\">\n" +
    "\n" +
    "        <div class=\"upgraded flex-container\" >\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"pending\">\n" +
    "                    <md-progress-circular md-mode=\"indeterminate\" md-diameter=\"45\"></md-progress-circular>\n" +
    "                    <span class=\"text\" translate=\".UPGRADE_PENDING\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"pro\">\n" +
    "\n" +
    "        <div class=\"upgraded flex-container\">\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"icon-wrapper completed\">\n" +
    "                    <svg-icon name=\"purchase-check-mark\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span class=\"text\" translate=\".UPGRADED_ON\" translate-values=\"{upgradeDate: vm.upgradeDate}\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"none\">\n" +
    "\n" +
    "        <ng-switch on=\"vm.showForm\">\n" +
    "            <div ng-switch-when=\"true\">\n" +
    "                <form\n" +
    "                    action=\"{{::vm.formAction}}\"\n" +
    "                    method=\"post\"\n" +
    "                    target=\"_top\">\n" +
    "                    <input type=\"hidden\" name=\"cmd\" value=\"_s-xclick\">\n" +
    "                    <input type=\"hidden\" name=\"hosted_button_id\" ng-value=\"::vm.hostedButtonId\">\n" +
    "                    <input type=\"hidden\" name=\"custom\" ng-value=\"::vm.custom\">\n" +
    "                    <input type=\"hidden\" name=\"return\" ng-value=\"::vm.returnUrlSuccess\">\n" +
    "                    <input type=\"hidden\" name=\"cancel_return\" ng-value=\"::vm.returnUrlFailed\">\n" +
    "                    <input type=\"hidden\" name=\"landing_page\" value=\"billing\">\n" +
    "                    <input type=\"hidden\" name=\"email\" ng-value=\"::vm.userEmail\">\n" +
    "                    <div class=\"upgrade-btn-wrapper\">\n" +
    "                        <button class=\"md-button success drop-shadow inline-block\"\n" +
    "                                ng-click=\"vm.saveAnalytics()\"\n" +
    "                                translate=\".UPGRADE_NOW\"\n" +
    "                                name=\"submit\">\n" +
    "                        </button>\n" +
    "                    </div>\n" +
    "                    <input type=\"image\" src=\"{{vm.btnImgSrc}}\" border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\">\n" +
    "                    <img border=\"0\" ng-src=\"{{::vm.pixelGifSrc}}\" width=\"1\" height=\"1\" alt=\"{{vm.translate('PURCHASE_POPUP.PAYPAL_IMG_ALT')}}\" >\n" +
    "                </form>\n" +
    "            </div>\n" +
    "            <div ng-switch-default>\n" +
    "                <button ng-click=\"vm.showPurchaseError()\"\n" +
    "                        class=\"md-button success drop-shadow\"\n" +
    "                        translate=\".UPGRADE_NOW\"\n" +
    "                        name=\"submit\">\n" +
    "                </button>\n" +
    "            </div>\n" +
    "\n" +
    "        </ng-switch>\n" +
    "\n" +
    "    </div>\n" +
    "</ng-switch>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchasePopup.template.html",
    "<md-dialog class=\"purchase-popup base-border-radius\" aria-label=\"Get Zinkerz\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "    <div class=\"purchase-popup-container\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"raccoon\">\n" +
    "                <svg-icon name=\"purchase-raccoon-logo-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"close-popup-wrap\">\n" +
    "                <svg-icon name=\"purchase-close-popup\" ng-click=\"vm.close()\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <h2>\n" +
    "                    <span translate=\".GET_ZINKERZ\"></span>\n" +
    "                    <span class=\"pill pro\" translate=\".PRO\"></span>\n" +
    "                </h2>\n" +
    "                <p translate=\".DESCRIPTION\"></p>\n" +
    "                <div class=\"features-box base-border-radius\">\n" +
    "                    <ul>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-1-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET1\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-2-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET2\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-3-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET3\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-4-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET4\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-5-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET5\"></span>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "                <div class=\"price ng-hide\" ng-show=\"vm.purchaseState === vm.purchaseStateEnum.NONE.enum\">\n" +
    "                    <del>{{'$' + vm.productPreviousPrice}}</del>\n" +
    "                    <b>{{'$' + vm.productPrice}}</b>\n" +
    "                    <span translate=\".SAVE\" translate-values='{ percent: vm.productDiscountPercentage}'></span>\n" +
    "                </div>\n" +
    "                <div class=\"action\">\n" +
    "                    <purchase-btn purchase-state=\"vm.purchaseState\"></purchase-btn>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.uiTheme', [
        'ngMaterial'
    ]);
})(angular);

angular.module('znk.infra-web-app.uiTheme').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'ngMaterial',
        'ngTagsInput'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'user-goals-plus-icon': 'components/userGoals/svg/plus-icon.svg',
                'user-goals-dropdown-arrow-icon': 'components/userGoals/svg/dropdown-arrow.svg',
                'user-goals-arrow-icon': 'components/userGoals/svg/arrow-icon.svg',
                'user-goals-info-icon': 'components/userGoals/svg/info-icon.svg',
                'user-goals-v-icon': 'components/userGoals/svg/v-icon.svg',
                'user-goals-search-icon': 'components/userGoals/svg/search-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals').filter('cutString', function cutStringFilter() {
        return function (str, length, onlyFullWords) {
            length = +length;
            if (!str || length <= 0) {
                return '';
            }
            if (isNaN(length) || str.length < length) {
                return str;
            }
            var words = str.split(' ');
            var newStr = '';
            if (onlyFullWords) {
                for (var i = 0; i < words.length; i++) {
                    if (newStr.length + words[i].length <= length) {
                        newStr = newStr + words[i] + ' ';
                    } else {
                        break;
                    }
                }
            } else {
                newStr = str.substr(0, length);
            }

            return newStr + '...';
        };
    });
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoals').directive('goalSelect', function GoalSelectDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/userGoals/templates/goalSelect.template.html',
            require: 'ngModel',
            scope: {
                minScore: '=',
                maxScore: '=',
                updateGoalNum: '='
            },
            link: function link(scope, element, attrs, ngModelCtrl) {
                scope.updateGoal = function (isPlus) {
                    scope.target += (isPlus) ? scope.updateGoalNum : -Math.abs(scope.updateGoalNum);
                    if (scope.target < scope.minScore) {
                        scope.target = scope.minScore;
                    } else if (scope.target > scope.maxScore) {
                        scope.target = scope.maxScore;
                    }

                    if (angular.isFunction(scope.onChange)) {
                        scope.onChange();
                    }
                    ngModelCtrl.$setViewValue(scope.target);
                };

                ngModelCtrl.$render = function () {
                    scope.target = ngModelCtrl.$viewValue;
                };
            }
        };

        return directive;
    });

})(angular);

/**
 *  attrs:
 *      events:
 *          onSave
 * */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoals').directive('schoolSelect', ['UserSchoolsService', '$translate', 'UtilitySrv', '$timeout', '$q', '$translatePartialLoader',
        function SchoolSelectDirective(UserSchoolsService, $translate, UtilitySrv, $timeout, $q, $translatePartialLoader) {
            'ngInject';

            var schoolList = [];

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoals/templates/schoolSelect.template.html',
                scope: {
                    events: '=?',
                    getSelectedSchools: '&?'
                },
                link: function link(scope, element, attrs) {
                    $translatePartialLoader.addPart('userGoals');

                    var MIN_LENGTH_AUTO_COMPLETE = 3;
                    var MAX_SCHOOLS_SELECT = 3;
                    var userSchools;

                    function disableSearchOption() {
                        if (scope.d.userSchools.length >= MAX_SCHOOLS_SELECT) {
                            element.find('input').attr('disabled', true);
                        } else {
                            element.find('input').removeAttr('disabled');
                        }
                    }

                    function _getTagsInputModelCtrl() {
                        var tagsInputElement = element.find('tags-input');
                        if (tagsInputElement) {
                            var tagsInputElementData = tagsInputElement.data();
                            if (tagsInputElementData.$ngModelController) {
                                scope.d.tagsInputNgModelCtrl = tagsInputElementData.$ngModelController;
                            }
                        }
                    }

                    scope.d = {
                        minLengthAutoComplete: MIN_LENGTH_AUTO_COMPLETE,
                        loadOnEmpty: false,
                        actions: {}
                    };

                    if (!scope.events) {
                        scope.events = {};
                    }
                    var eventsDefault = {
                        onSave: angular.noop
                    };
                    UtilitySrv.object.extendWithoutOverride(scope.events, eventsDefault);

                    //  added in order to provide custom selected schools
                    var getSelectedSchoolsProm;
                    if (attrs.getSelectedSchools) {
                        getSelectedSchoolsProm = $q.when(scope.getSelectedSchools());
                    } else {
                        getSelectedSchoolsProm = UserSchoolsService.getDreamSchools();
                    }
                    getSelectedSchoolsProm.then(function (_userSchools) {
                        userSchools = _userSchools;
                        scope.d.userSchools = angular.copy(userSchools);
                        $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                            scope.d.placeholder = scope.d.userSchools.length ? ' ' : val;
                        });
                        disableSearchOption();
                    });

                    UserSchoolsService.getAppSchoolsList().then(function (schools) {
                        schoolList = schools.data;
                    });

                    scope.d.onTagAdding = function ($tag) {
                        if (!$tag.id) {
                            return false;
                        }
                        $tag.text = $tag.text.replace(/([-])/g, ' ');
                        scope.d.placeholder = ' ';
                        return scope.d.userSchools.length < MAX_SCHOOLS_SELECT;
                    };

                    scope.d.onTagAdded = function () {
                        disableSearchOption();
                        return true;
                    };

                    scope.d.onTagRemoved = function () {
                        if (!scope.d.userSchools.length) {
                            $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                                scope.d.placeholder =  val;
                            });
                        }
                        disableSearchOption();
                        return true;
                    };

                    scope.d.querySchools = function ($query) {
                        if ($query.length < 3) {
                            return $q.when([]);
                        }
                        var resultsArr = schoolList.filter(function (school) {
                            return school.text.toLowerCase().indexOf($query.toLowerCase()) > -1;
                        });
                        if (!resultsArr.length) {
                            resultsArr = $translate('SCHOOL_SELECT.NO_RESULTS').then(function(val) {
                                return [{
                                    text: val
                                }];
                            });

                        }
                        return $q.when(resultsArr);
                    };

                    scope.d.save = function () {
                        if (!scope.d.tagsInputNgModelCtrl) {
                            _getTagsInputModelCtrl();
                        }
                        scope.d.tagsInputNgModelCtrl.$setPristine();

                        scope.events.onSave(scope.d.userSchools);
                    };

                    $timeout(function () {
                        _getTagsInputModelCtrl();
                    });
                }
            };

            return directive;
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoals').directive('userGoals',['UserGoalsService', '$timeout', 'UserSchoolsService', '$q', '$translatePartialLoader',
        function UserGoalsDirective(UserGoalsService, $timeout, UserSchoolsService, $q, $translatePartialLoader) {

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoals/templates/userGoals.template.html',
                scope: {
                    onSave: '&?',
                    setting: '='
                },
                link: function link(scope) {
                    $translatePartialLoader.addPart('userGoals');
                    var userGoalRef;
                    scope.goalsSettingsFromSrv = UserGoalsService.getGoalsSettings();
                    var defaultTitle = scope.saveTitle = scope.setting.saveBtn.title || '.SAVE';

                    var initTotalScore = 0;
                    angular.forEach(scope.goalsSettingsFromSrv.subjects, function() {
                        initTotalScore += scope.goalsSettingsFromSrv.defaultSubjectScore;
                    });
                    scope.totalScore = initTotalScore;

                    UserGoalsService.getGoals().then(function (userGoals) {
                        userGoalRef = userGoals;
                        scope.userGoals = angular.copy(userGoals);
                    });

                    var getDreamSchoolsProm = UserSchoolsService.getDreamSchools().then(function (userSchools) {
                        scope.userSchools = angular.copy(userSchools);
                    });
                    scope.getSelectedSchools = function () {
                        return getDreamSchoolsProm.then(function () {
                            return scope.userSchools;
                        });
                    };

                    scope.showSchools = function () {
                        scope.showSchoolEdit = !scope.showSchoolEdit;
                    };

                    scope.calcTotal = function () {
                        var goals = scope.userGoals;
                        var newTotalScore = 0;
                        angular.forEach(goals, function(goal, key) {
                            if (angular.isNumber(goal) && key !== 'totalScore') {
                                newTotalScore += goal;
                            }
                        });
                        goals.totalScore = scope.totalScore = newTotalScore;
                        return goals.totalScore;
                    };

                    scope.saveChanges = function () {
                        var saveUserSchoolsProm = UserSchoolsService.setDreamSchools(scope.userSchools);

                        angular.extend(userGoalRef, scope.userGoals);
                        var saveUserGoalsProm = UserGoalsService.setGoals(userGoalRef);

                        $q.all([
                            saveUserSchoolsProm,
                            saveUserGoalsProm
                        ]).then(function () {
                            if (angular.isFunction(scope.onSave)) {
                                scope.onSave();
                            }

                            if (scope.setting.saveBtn.afterSaveTitle) {
                                scope.saveTitle = scope.setting.saveBtn.afterSaveTitle;
                                scope.showVIcon = true;
                                $timeout(function () {
                                    scope.saveTitle = defaultTitle;
                                    scope.showVIcon = false;
                                }, 3000);
                            }
                        });
                    };

                    scope.schoolSelectEvents = {
                        onSave: function (newUserDreamSchools) {
                            scope.showSchoolEdit = false;
                            scope.userSchools = newUserDreamSchools;

                            UserGoalsService.calcCompositeScore(newUserDreamSchools).then(function (newUserGoals) {
                                scope.userGoals = newUserGoals;
                            });
                        }
                    };
                }
            };

            return directive;
        }]);
})(angular);

'use strict';

angular.module('znk.infra-web-app.userGoals').provider('UserGoalsService', [function() {

        this.$get = ['InfraConfigSrv', 'StorageSrv', '$q', function (InfraConfigSrv, StorageSrv, $q) {
            var self = this;
            var goalsPath = StorageSrv.variables.appUserSpacePath + '/goals';
            var defaultSubjectScore = self.settings.defaultSubjectScore;
            var subjects = self.settings.subjects;

            var userGoalsServiceObj = {};

            userGoalsServiceObj.getGoals = function () {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.get(goalsPath).then(function (userGoals) {
                        if (angular.equals(userGoals, {})) {
                            userGoals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.setGoals = function (newGoals) {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    if (arguments.length && angular.isDefined(newGoals)) {
                        return studentStorage.set(goalsPath, newGoals);
                    }
                    return studentStorage.get(goalsPath).then(function (userGoals) {
                        if (!userGoals.goals) {
                            userGoals.goals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.calcCompositeScore = function (userSchools, save) {
                // The calculation for composite score in ACT:
                // 1. For each school in US, we have min & max score
                // 2. Calc the average score for each school and set it for each subject goal

                return userGoalsServiceObj.getGoals().then(function (userGoals) {
                    var minSchoolScore = self.settings.minSchoolScore,
                        maxSchoolScore = self.settings.maxSchoolScore,
                        avgScores = [];

                    angular.forEach(userSchools, function (school) {
                        var school25th = isNaN(school.total25th) ? minSchoolScore : school.total25th;
                        var school75th = isNaN(school.total75th) ? maxSchoolScore : school.total75th;
                        avgScores.push((school25th * 0.25) + (school75th * 0.75));
                    });

                    var avgSchoolsScore;
                    if (avgScores.length) {
                        avgSchoolsScore = avgScores.reduce(function (a, b) {
                            return a + b;
                        });
                        avgSchoolsScore = Math.round(avgSchoolsScore / avgScores.length);
                    } else {
                        avgSchoolsScore = defaultSubjectScore;
                    }

                    userGoals = {
                        isCompleted: false
                    };

                    angular.forEach(subjects, function(subject) {
                        userGoals[subject.name] = avgSchoolsScore || defaultSubjectScore;
                    });

                    userGoals.compositeScore = averageSubjectsGoal(userGoals);
                    return save ? userGoalsServiceObj.setGoals(userGoals) : $q.when(userGoals);
                });
            };

            userGoalsServiceObj.getGoalsSettings = function() {
                 return self.settings;
            };

            function _defaultUserGoals() {
                var defaultUserGoals = {
                    isCompleted: false,
                    totalScore: defaultSubjectScore * subjects.length
                };
                angular.forEach(subjects, function(subject) {
                    defaultUserGoals[subject.name] = defaultSubjectScore;
                });
                return defaultUserGoals;
            }

            function averageSubjectsGoal(goalsObj) {
                var goalsSum = 0;
                var goalsLength = 0;
                angular.forEach(goalsObj, function(goal) {
                    if (angular.isNumber(goal)) {
                        goalsSum += goal;
                        goalsLength += 1;
                    }
                });
                return Math.round(goalsSum / goalsLength);
            }

            return userGoalsServiceObj;
        }];
}]);

'use strict';

angular.module('znk.infra-web-app.userGoals').service('UserSchoolsService', ['InfraConfigSrv', 'StorageSrv', 'ENV', '$http', 'UserGoalsService', '$q',
    function(InfraConfigSrv, StorageSrv, ENV, $http, UserGoalsService, $q) {
        var schoolsPath = StorageSrv.variables.appUserSpacePath + '/dreamSchools';

        this.getAppSchoolsList = function () {
            return $http.get(ENV.dreamSchoolJsonUrl, {
                timeout: ENV.promiseTimeOut,
                cache: true
            });
        };

        function _getUserSchoolsData() {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                var defaultValues = {
                    selectedSchools: []
                };
                return studentStorage.get(schoolsPath, defaultValues);
            });
        }

        function _setUserSchoolsData(userSchools) {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                 return studentStorage.set(schoolsPath, userSchools);
            });
        }

        this.getDreamSchools = function () {
            return _getUserSchoolsData().then(function (userSchools) {
                return userSchools.selectedSchools;
            });
        };

        this.setDreamSchools = function (newSchools, updateUserGoals) {
            return _getUserSchoolsData().then(function (userSchools) {
                if (!angular.isArray(newSchools) || !newSchools.length) {
                    newSchools = [];
                }

                if (userSchools.selectedSchools !== newSchools) {
                    userSchools.selectedSchools.splice(0);
                    angular.extend(userSchools.selectedSchools, newSchools);
                }

                var saveUserGoalProm = $q.when();
                if (updateUserGoals) {
                    saveUserGoalProm = UserGoalsService.calcCompositeScore(newSchools, true);
                }

                return $q.all([
                    _setUserSchoolsData(userSchools),
                    saveUserGoalProm
                ]).then(function (res) {
                    return res[0];
                });
            });
        };
}]);


angular.module('znk.infra-web-app.userGoals').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/userGoals/svg/arrow-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-468.2 482.4 96 89.8\" class=\"arrow-icon-wrapper\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .arrow-icon-wrapper .st0{fill:#109BAC;}\n" +
    "        .arrow-icon-wrapper .st1{fill:none;stroke:#fff;stroke-width:5.1237;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "    <path class=\"st0\" d=\"M-417.2,572.2h-6.2c-24.7,0-44.9-20.2-44.9-44.9v0c0-24.7,20.2-44.9,44.9-44.9h6.2c24.7,0,44.9,20.2,44.9,44.9\n" +
    "    v0C-372.2,552-392.5,572.2-417.2,572.2z\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-442.8\" y1=\"527.3\" x2=\"-401.4\" y2=\"527.3\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"514.4\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"540.2\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoals/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoals/svg/info-icon.svg",
    "<svg\n" +
    "    version=\"1.1\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-497 499 28 28\"\n" +
    "    class=\"info-icon\">\n" +
    "<style type=\"text/css\">\n" +
    "	.info-icon .st0{fill:none;stroke:#0A9BAD; stroke-width:2;}\n" +
    "	.info-icon .st2{fill:#0A9BAD;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<circle class=\"st0\" cx=\"-483\" cy=\"513\" r=\"13.5\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M-485.9,509.2h3.9v8.1h3v1.2h-7.6v-1.2h3v-6.9h-2.4V509.2z M-483.5,505.6h1.5v1.9h-1.5V505.6z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoals/svg/plus-icon.svg",
    "<svg class=\"plus-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 16 16\"\n" +
    "    style=\"enable-background:new 0 0 16 16;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.plus-svg .st0, .plus-svg .st1 {\n" +
    "        fill: none;\n" +
    "        stroke: #0a9bad;\n" +
    "        stroke-width: 2;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<line class=\"st0\" x1=\"8\" y1=\"1\" x2=\"8\" y2=\"15\"/>\n" +
    "<line class=\"st1\" x1=\"1\" y1=\"8\" x2=\"15\" y2=\"8\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoals/svg/search-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-314.8 416.5 97.5 99.1\" class=\"search-icon-wrapper\">\n" +
    "<style type=\"text/css\">\n" +
    "	.search-icon-wrapper .st0{fill:none;stroke:#231F20;stroke-width:5;stroke-miterlimit:10;}\n" +
    "	.search-icon-wrapper .st1{fill:none;stroke:#231F20;stroke-width:5;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<circle class=\"st0\" cx=\"-279.1\" cy=\"452.3\" r=\"33.2\"/>\n" +
    "<line class=\"st1\" x1=\"-255.3\" y1=\"477.6\" x2=\"-219.8\" y2=\"513.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoals/svg/v-icon.svg",
    "<svg class=\"v-icon-wrapper\" x=\"0px\" y=\"0px\" viewBox=\"0 0 334.5 228.7\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .v-icon-wrapper .st0{\n" +
    "            fill:#ffffff;\n" +
    "            stroke:#ffffff;\n" +
    "            stroke-width:26;\n" +
    "            stroke-linecap:round;\n" +
    "            stroke-linejoin:round;\n" +
    "            stroke-miterlimit:10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"13\" y1=\"109.9\" x2=\"118.8\" y2=\"215.7\"/>\n" +
    "	<line class=\"st0\" x1=\"118.8\" y1=\"215.7\" x2=\"321.5\" y2=\"13\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoals/templates/goalSelect.template.html",
    "<div class=\"action-btn minus\" ng-click=\"updateGoal(false)\" ng-show=\"target > minScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "<div class=\"goal\">{{target}}</div>\n" +
    "<div class=\"action-btn plus\" ng-click=\"updateGoal(true)\" ng-show=\"target < maxScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/userGoals/templates/schoolSelect.template.html",
    "<div class=\"school-selector\" translate-namespace=\"SCHOOL_SELECT\">\n" +
    "    <div class=\"selector\">\n" +
    "        <div class=\"tag-input-wrap\">\n" +
    "            <div class=\"search-icon-container\">\n" +
    "                <svg-icon name=\"user-goals-search-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <tags-input ng-model=\"d.userSchools\"\n" +
    "                        text=\"d.text\"\n" +
    "                        key-property=\"id\"\n" +
    "                        placeholder=\"{{d.placeholder}}\"\n" +
    "                        allow-leftover-text=\"true\"\n" +
    "                        add-from-autocomplete-only=\"true\"\n" +
    "                        on-tag-adding=\"d.onTagAdding($tag)\"\n" +
    "                        on-tag-added=\"d.onTagAdded()\"\n" +
    "                        on-tag-removed=\"d.onTagRemoved()\"\n" +
    "                        max-tags=\"3\"\n" +
    "                        template=\"tag-input-template\">\n" +
    "                <auto-complete source=\"d.querySchools($query)\"\n" +
    "                               debounce-delay=\"100\"\n" +
    "                               display-property=\"text\"\n" +
    "                               max-results-to-show=\"9999\"\n" +
    "                               highlight-matched-text=\"true\"\n" +
    "                               min-length=\"{{d.minLengthAutoComplete}}\"\n" +
    "                               load-on-focus=\"true\"\n" +
    "                               template=\"auto-complete-template\">\n" +
    "                </auto-complete>\n" +
    "            </tags-input>\n" +
    "            <button class=\"select-btn go-btn\"\n" +
    "                    ng-click=\"d.save()\"\n" +
    "                    title=\"{{::'SCHOOL_SELECT.SELECT_TO_CONTINUE' | translate}}\"\n" +
    "                    ng-disabled=\"d.tagsInputNgModelCtrl.$pristine\">\n" +
    "                <svg-icon name=\"user-goals-arrow-icon\"\n" +
    "                          class=\"arrow-icon\">\n" +
    "                </svg-icon>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<script type=\"text/ng-template\" id=\"auto-complete-template\">\n" +
    "    <div ng-show=\"$index==0\" class=\"list-title\">\n" +
    "        <div class=\"list-left-panel\" translate=\".SCHOOLS\"></div>\n" +
    "        <div class=\"list-right-panel\" translate=\".REQUIRED_SCORE\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"left-panel\">\n" +
    "        {{::data.text}}\n" +
    "        <span class=\"location\">{{::data.city}}, {{::data.state}}</span>\n" +
    "    </div>\n" +
    "    <div class=\"right-panel\">\n" +
    "        {{::data.total25th}}{{data.total75th == 'N/A' ? '' : '-' + data.total75th}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "<script type=\"text/ng-template\" id=\"tag-input-template\">\n" +
    "    <div class=\"tag-wrap\">\n" +
    "        <span title=\"{{data.text}}\">{{data.text | cutString: 15}}</span>\n" +
    "        <a class=\"remove-button\" ng-click=\"$removeTag()\">&#10006;</a>\n" +
    "    </div>\n" +
    "</script>\n" +
    "");
  $templateCache.put("components/userGoals/templates/userGoals.template.html",
    "<section translate-namespace=\"USER_GOALS\">\n" +
    "    <div class=\"goals-schools-wrapper\" ng-if=\"setting.showSchools || goalsSettingsFromSrv.showSchools\">\n" +
    "        <div class=\"title-wrap\">\n" +
    "            <div class=\"edit-title\" translate=\".DREAM_SCHOOLS\"></div>\n" +
    "            <div class=\"edit-link\" ng-click=\"showSchools()\" ng-class=\"{'active' : showSchoolEdit}\">\n" +
    "                <span translate=\".EDIT\" class=\"edit\"></span>\n" +
    "                <span translate=\".CANCEL\" class=\"cancel\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"selected-schools-container\" ng-switch=\"userSchools.length\">\n" +
    "            <div ng-switch-when=\"0\"\n" +
    "                 class=\"no-school-selected\"\n" +
    "                 translate=\".I_DONT_KNOW\"></div>\n" +
    "            <div ng-switch-default class=\"selected-schools\">\n" +
    "                <div ng-repeat=\"school in userSchools\" class=\"school\">{{school.text}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"subject-wrap\">\n" +
    "        <div class=\"blur-wrap\"></div>\n" +
    "        <div class=\"goals-title\" ng-show=\"setting.recommendedGoalsTitle\">\n" +
    "            <div class=\"recommended-title\" translate=\".RECOMMENDED_GOALS\"></div>\n" +
    "            <div class=\"info-wrap\">\n" +
    "                <md-tooltip md-visible=\"vm.showTooltip\" md-direction=\"top\" class=\"goals-info md-whiteframe-2dp\">\n" +
    "                    <div translate=\".GOALS_INFO\" class=\"top-text\"></div>\n" +
    "                </md-tooltip>\n" +
    "                <svg-icon class=\"info-icon\" name=\"user-goals-info-icon\" ng-mouseover=\"vm.showTooltip=true\" ng-mouseleave=\"vm.showTooltip=false\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"subject-goal-wrap\">\n" +
    "            <div class=\"subjects-goal noselect\">\n" +
    "                <div class=\"subject\" ng-repeat=\"subject in goalsSettingsFromSrv.subjects\">\n" +
    "                    <div class=\"icon-wrapper svg-wrapper\" ng-class=\"subject.name+'-bg'\">\n" +
    "                        <svg-icon name=\"{{subject.svgIcon}}\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <span class=\"subject-title\" translate=\".{{subject.name | uppercase}}\"></span>\n" +
    "                    <goal-select\n" +
    "                        min-score=\"goalsSettingsFromSrv.minGoalsScore\"\n" +
    "                        max-score=\"goalsSettingsFromSrv.maxGoalsScore\"\n" +
    "                        update-goal-num=\"goalsSettingsFromSrv.updateGoalNum\"\n" +
    "                        ng-model=\"userGoals[subject.name]\"\n" +
    "                        ng-change=\"calcTotal()\">\n" +
    "                    </goal-select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"composite-wrap\">\n" +
    "            <div class=\"composite-score\">\n" +
    "                <div class=\"score-title\" translate=\".TOTAL_SCORE\"></div>\n" +
    "                <div class=\"score\">{{totalScore}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"save-btn-wrap\">\n" +
    "        <md-button autofocus tabindex=\"1\"\n" +
    "                   class=\"md-sm primary inline-block\"\n" +
    "                   ng-click=\"saveChanges()\"\n" +
    "                   ng-class=\"setting.saveBtn.wrapperClassName\">\n" +
    "            <svg-icon name=\"user-goals-v-icon\" class=\"v-icon\" ng-show=\"showVIcon\"></svg-icon>\n" +
    "            <span translate=\"{{saveTitle}}\"></span>\n" +
    "            <svg-icon name=\"user-goals-dropdown-arrow-icon\" class=\"dropdown-arrow-icon\" ng-show=\"setting.saveBtn.showSaveIcon\"></svg-icon>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "    <div class=\"school-selector-wrap animate-if\"\n" +
    "         ng-if=\"showSchoolEdit\">\n" +
    "        <school-select events=\"schoolSelectEvents\"\n" +
    "                       get-selected-schools=\"getSelectedSchools()\">\n" +
    "        </school-select>\n" +
    "    </div>\n" +
    "</section>\n" +
    "\n" +
    "\n" +
    "");
}]);

/**
 * usage instructions:
 *      workout progress:
 *      - define <%= subjectName %>-bg class for all subjects(background color and  for workouts-progress item) for example
 *              .reading-bg{
 *                  background: red;
 *              }
 *      - define <%= subjectName %>-bg:after style for border color for example
 *              workouts-progress .items-container .item-container .item.selected.reading-bg:after {
                    border-color: red;
                }
 *
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra.scroll',
        'znk.infra.general'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('workoutsRoadmap', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: function data(ExerciseStatusEnum, WorkoutsSrv, /*WorkoutsDiagnosticFlow,*/ $q) {
                            'ngInject';

                            // var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([workoutsProgressProm, /*isDiagnosticCompletedProm, */]).then(function (res) {
                                var workoutsProgress = res[0];
                                var isDiagnosticCompleted = !!res[1];

                                return {
                                    diagnostic: {
                                        status: isDiagnosticCompleted ? ExerciseStatusEnum.COMPLETED.enum : ExerciseStatusEnum.ACTIVE.enum,
                                        workoutOrder: 0
                                    },
                                    workoutsProgress: workoutsProgress
                                };
                            });
                        }
                    },
                    controller: 'WorkoutsRoadMapController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('workoutsRoadmap.diagnostic.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticIntroController',
                    controllerAs: 'vm'
                })
            /*  .state('app.workouts.roadmap.diagnostic.preSummary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapBasePreSummary.template.html',
             controller: 'WorkoutsRoadMapBasePreSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.diagnostic.summary', {
             resolve: {
             diagnosticData: function (WorkoutsDiagnosticFlow) {
             'ngInject';
             return WorkoutsDiagnosticFlow.getDiagnostic().then(function (result) {
             return {
             userStats: result.userStats,
             compositeScore: result.compositeScore
             };
             });
             }
             },
             templateUrl: 'app/workouts/templates/workoutsRoadmapDiagnosticSummary.template.html',
             controller: 'WorkoutsRoadMapDiagnosticSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout', {
             url: '/workout?workout',
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkout.template.html',
             controller: 'WorkoutsRoadMapWorkoutController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.intro', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutIntro.template.html',
             controller: 'WorkoutsRoadMapWorkoutIntroController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.inProgress', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutInProgress.template.html',
             controller: 'WorkoutsRoadMapWorkoutInProgressController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.preSummary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapBasePreSummary.template.html',
             controller: 'WorkoutsRoadMapBasePreSummaryController',
             controllerAs: 'vm'
             })
             .state('app.workouts.roadmap.workout.summary', {
             templateUrl: 'app/workouts/templates/workoutsRoadmapWorkoutSummary.template.html',
             controller: 'WorkoutsRoadMapWorkoutSummaryController',
             controllerAs: 'vm'
             })*/;
        }]);
})(angular);

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapController',
        function (data, $state, $scope, ExerciseStatusEnum, $location, $translatePartialLoader) {
            'ngInject';

            $translatePartialLoader.addPart('workoutsRoadmap');

            var vm = this;
            var activeWorkout;

            vm.workoutsProgress = data.workoutsProgress;
            vm.diagnostic = data.diagnostic;

            var search = $location.search();
            var DIAGNOSTIC_STATE = 'workoutsRoadmap.diagnostic';
            var WORKOUT_STATE = 'app.workouts.roadmap.workout';

            function getActiveWorkout() {
                var i = 0;
                for (; i < vm.workoutsProgress.length; i++) {
                    if (vm.workoutsProgress[i].status !== ExerciseStatusEnum.COMPLETED.enum) {
                        if (angular.isDefined(vm.workoutsProgress[i].subjectId)) {
                            return vm.workoutsProgress[i];
                        }
                        return data.diagnostic;
                    }
                }
                return vm.workoutsProgress[i - 1];
            }

            function _isFirstWorkoutStarted() {
                var firstWorkout = vm.workoutsProgress[0];
                return data.diagnostic.status !== ExerciseStatusEnum.COMPLETED.enum ||
                    angular.isUndefined(firstWorkout.subjectId);
            }

            function _setActiveWorkout() {
                activeWorkout = getActiveWorkout();
                vm.activeWorkoutOrder = +activeWorkout.workoutOrder;
            }

            _setActiveWorkout();


            switch ($state.current.name) {
                case DIAGNOSTIC_STATE:
                    vm.selectedItem = vm.diagnostic;
                    break;
                case WORKOUT_STATE:
                    var workoutOrder = +search.workout;
                    if (isNaN(workoutOrder) || workoutOrder < 0 || workoutOrder > vm.workoutsProgress.length) {
                        vm.selectedItem = activeWorkout;
                    } else {
                        vm.selectedItem = vm.workoutsProgress[workoutOrder - 1];
                    }
                    break;
                default:
                    if (_isFirstWorkoutStarted()) {
                        vm.selectedItem = vm.diagnostic;
                    } else {
                        vm.selectedItem = activeWorkout;
                    }
            }

            data.exercise = vm.selectedItem;

            data.roadmapCtrlActions = {};
            data.roadmapCtrlActions.setCurrWorkout = function (_workoutOrder) {
                if (!_workoutOrder) {
                    vm.selectedItem = vm.diagnostic;
                } else {
                    vm.selectedItem = vm.workoutsProgress[_workoutOrder - 1];
                }
                _setActiveWorkout();
            };
            data.roadmapCtrlActions.freezeWorkoutProgressComponent = function (freeze) {
                vm.freezeWorkoutProgressComponent = freeze;
            };

            var LEFT_ANIMATION = 'left-animation';
            var RIGHT_ANIMATION = 'right-animation';
            $scope.$watch('vm.selectedItem', function (newItem, oldItem) {
                if (angular.isUndefined(newItem)) {
                    return;
                }

                if (newItem !== oldItem) {
                    if (newItem.workoutOrder > oldItem.workoutOrder) {
                        vm.workoutSwitchAnimation = LEFT_ANIMATION;
                    } else {
                        vm.workoutSwitchAnimation = RIGHT_ANIMATION;
                    }
                }

                data.exercise = newItem;

                var currentStateName = $state.current.name;
                if (newItem.workoutOrder === 0) {
                    if (currentStateName !== DIAGNOSTIC_STATE) {
                        $state.go(DIAGNOSTIC_STATE);
                    }
                } else {
                    search = $location.search();
                    // the current state can be "app.workouts.roadmap.workout.intro"
                    // while the direct link is "app.workouts.roadmap.workout?workout=20"  so no need to navigate...
                    if (currentStateName.indexOf(WORKOUT_STATE) === -1 || +search.workout !== +newItem.workoutOrder) {
                        //$state.go('app.workouts.roadmap.workout', {
                        //     workout: newItem.workoutOrder
                        // });
                    }
                }
            });
        }
    );
})();

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticController',
        function ($state, ExerciseStatusEnum, data, $timeout) {
            'ngInject';
            //  fixing page not rendered in the first app entrance issue
            $timeout(function () {
                switch (data.diagnostic.status) {
                    case ExerciseStatusEnum.COMPLETED.enum:
                        var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
                        if (isFirstWorkoutStarted) {
                            $state.go('.summary');
                        } else {
                            $state.go('.preSummary');
                        }
                        break;
                    default:
                        $state.go('.intro');
                }
            });
        });
})();

// export class WorkoutsRoadMapDiagnosticController {
//     constructor($state, ExerciseStatusEnum, data, $timeout) {
//         'ngInject';
//         //  fixing page not rendered in the first app entrance issue
//         $timeout(function () {
//             switch (data.diagnostic.status) {
//                 case ExerciseStatusEnum.COMPLETED.enum:
//                     var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
//                     if (isFirstWorkoutStarted) {
//                         $state.go('.summary');
//                     } else {
//                         $state.go('.preSummary');
//                     }
//                     break;
//                 default:
//                     $state.go('.intro');
//             }
//         });
//     }
// }

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        function (/*WorkoutsDiagnosticFlow*/) {
            'ngInject';

            var vm = this;

            vm.state = 'workouts roadmap diagnostic intro';

            // WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {todo
            //     vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
            // });
            vm.buttonTitle = 'START';
        });
})();

// export class WorkoutsRoadMapDiagnosticIntroController {
//     constructor(WorkoutsDiagnosticFlow) {
//         'ngInject';
//
//         var vm = this;
//
//         vm.state = 'workouts roadmap diagnostic intro';
//
//         WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {
//             vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
//         });
//     }
// }

"use strict";
(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg',
                    'workouts-progress-check-mark-icon': 'components/workoutsRoadmap/svg/check-mark-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ])
        .directive('workoutsProgress',
            function workoutsProgressDirective($timeout, ExerciseStatusEnum, $log) {
                'ngInject';

                var config = {
                    focusAnimateDuration: 500,
                    focuseAnimationTimingFunction: 'ease-in-out',
                    mouseLeaveBeforeFocusDelay: 2000
                };

                var directive = {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html',
                    restrict: 'E',
                    require: 'ngModel',
                    scope: {
                        workoutsGetter: '&workouts',
                        diagnosticGetter: '&diagnostic',
                        activeWorkoutOrder: '@activeWorkoutOrder'
                    },
                    compile: function compile() {
                        return {
                            pre: function pre(scope) {
                                scope.vm = {};

                                var workouts = scope.workoutsGetter() || [];

                                scope.vm.workouts = workouts;
                                scope.vm.diagnostic = angular.copy(scope.diagnosticGetter());
                                //  added in order to treat the diagnostic as a workout what simplifies the code
                                scope.vm.diagnostic.workoutOrder = 0;
                            },
                            post: function post(scope, element, attrs, ngModelCtrl) {
                                var domElement = element[0];
                                var focusOnSelectedWorkoutTimeoutProm;

                                function mouseEnterEventListener() {
                                    if (focusOnSelectedWorkoutTimeoutProm) {
                                        $timeout.cancel(focusOnSelectedWorkoutTimeoutProm);
                                        focusOnSelectedWorkoutTimeoutProm = null;
                                    }
                                }

                                domElement.addEventListener('mouseenter', mouseEnterEventListener);

                                function mouseLeaveEventListener() {
                                    focusOnSelectedWorkoutTimeoutProm = $timeout(function () {
                                        scope.vm.focusOnSelectedWorkout();
                                    }, config.mouseLeaveBeforeFocusDelay, false);
                                }

                                domElement.addEventListener('mouseleave', mouseLeaveEventListener);

                                function _setProgressLineWidth(activeWorkoutOrder) {
                                    var itemsContainerDomeElement = domElement.querySelectorAll('.item-container');
                                    if (itemsContainerDomeElement.length) {
                                        var activeWorkoutDomElement = itemsContainerDomeElement[activeWorkoutOrder];
                                        if (activeWorkoutDomElement) {
                                            var LEFT_OFFSET = 40;
                                            var progressLineDomElement = domElement.querySelector('.dotted-line.progress');
                                            progressLineDomElement.style.width = LEFT_OFFSET + activeWorkoutDomElement.offsetLeft + 'px';
                                        }
                                    }
                                }

                                scope.vm.focusOnSelectedWorkout = function () {
                                    var parentElement = element.parent();
                                    var parentDomElement = parentElement[0];
                                    if (!parentDomElement) {
                                        return;
                                    }
                                    var containerWidth = parentDomElement.offsetWidth;
                                    var containerCenter = containerWidth / 2;

                                    var selectedWorkoutDomElement = domElement.querySelectorAll('.item-container')[scope.vm.selectedWorkout];
                                    if (!selectedWorkoutDomElement) {
                                        return;
                                    }
                                    var toCenterAlignment = selectedWorkoutDomElement.offsetWidth / 2;
                                    var scrollLeft = selectedWorkoutDomElement.offsetLeft + toCenterAlignment;// align to center
                                    var offset = containerCenter - scrollLeft;
                                    scope.vm.scrollActions.animate(offset, config.focusAnimateDuration, config.focuseAnimationTimingFunction);
                                };

                                function _selectWorkout(itemOrder, skipSetViewValue) {
                                    itemOrder = +itemOrder;
                                    if (isNaN(itemOrder)) {
                                        $log.error('workoutsProgress.directive:vm.selectWorkout: itemOrder is not a number');
                                        return;
                                    }
                                    var items = [scope.vm.diagnostic].concat(scope.vm.workouts);
                                    scope.vm.selectedWorkout = itemOrder;
                                    scope.vm.focusOnSelectedWorkout();
                                    var selectedItem = items[itemOrder];
                                    if (!skipSetViewValue) {
                                        ngModelCtrl.$setViewValue(selectedItem);
                                    }
                                }

                                scope.vm.workoutClick = function (itemOrder) {
                                    if (attrs.disabled) {
                                        return;
                                    }
                                    _selectWorkout(itemOrder);
                                };

                                ngModelCtrl.$render = function () {
                                    if (ngModelCtrl.$viewValue && angular.isDefined(ngModelCtrl.$viewValue.workoutOrder)) {
                                        $timeout(function () {
                                            _selectWorkout(ngModelCtrl.$viewValue.workoutOrder, true);
                                            _setProgressLineWidth(scope.activeWorkoutOrder);
                                        }, 0, false);
                                    }
                                };

                                scope.$on('$destroy', function () {
                                    domElement.removeEventListener('mouseleave', mouseLeaveEventListener);
                                    domElement.removeEventListener('mouseenter', mouseEnterEventListener);
                                });

                                attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
                                    if (angular.isDefined(newActiveWorkoutOrder)) {
                                        _setProgressLineWidth(newActiveWorkoutOrder);
                                    }
                                });
                            }
                        };
                    }
                };

                return directive;
            }
        );
})();

// export function workoutsProgressDirective($timeout, ExerciseStatusEnum, $log) {
//     'ngInject';
//
//     var config = {
//         focusAnimateDuration: 500,
//         focuseAnimationTimingFunction: 'ease-in-out',
//         mouseLeaveBeforeFocusDelay: 2000
//     };
//
//     var directive = {
//         templateUrl: 'app/workouts/components/workoutProgress/workoutProgressDirective.template.html',
//         restrict: 'E',
//         require: 'ngModel',
//         scope: {
//             workoutsGetter: '&workouts',
//             diagnosticGetter: '&diagnostic',
//             activeWorkoutOrder: '@activeWorkoutOrder'
//         },
//         compile: function compile() {
//             return {
//                 pre: function pre(scope) {
//                     scope.vm = {};
//
//                     var workouts = scope.workoutsGetter() || [];
//
//                     scope.vm.workouts = workouts;
//                     scope.vm.diagnostic = angular.copy(scope.diagnosticGetter());
//                     //  added in order to treat the diagnostic as a workout what simplifies the code
//                     scope.vm.diagnostic.workoutOrder = 0;
//                 },
//                 post: function post(scope, element, attrs, ngModelCtrl) {
//                     var domElement = element[0];
//                     var focusOnSelectedWorkoutTimeoutProm;
//
//                     function mouseEnterEventListener() {
//                         if (focusOnSelectedWorkoutTimeoutProm) {
//                             $timeout.cancel(focusOnSelectedWorkoutTimeoutProm);
//                             focusOnSelectedWorkoutTimeoutProm = null;
//                         }
//                     }
//
//                     domElement.addEventListener('mouseenter', mouseEnterEventListener);
//
//                     function mouseLeaveEventListener() {
//                         focusOnSelectedWorkoutTimeoutProm = $timeout(function () {
//                             scope.vm.focusOnSelectedWorkout();
//                         }, config.mouseLeaveBeforeFocusDelay, false);
//                     }
//
//                     domElement.addEventListener('mouseleave', mouseLeaveEventListener);
//
//                     function _setProgressLineWidth(activeWorkoutOrder) {
//                         var itemsContainerDomeElement = domElement.querySelectorAll('.item-container');
//                         if (itemsContainerDomeElement.length) {
//                             var activeWorkoutDomElement = itemsContainerDomeElement[activeWorkoutOrder];
//                             if (activeWorkoutDomElement) {
//                                 var LEFT_OFFSET = 40;
//                                 var progressLineDomElement = domElement.querySelector('.dotted-line.progress');
//                                 progressLineDomElement.style.width = LEFT_OFFSET + activeWorkoutDomElement.offsetLeft + 'px';
//                             }
//                         }
//                     }
//
//                     scope.vm.focusOnSelectedWorkout = function () {
//                         var parentElement = element.parent();
//                         var parentDomElement = parentElement[0];
//                         if (!parentDomElement) {
//                             return;
//                         }
//                         var containerWidth = parentDomElement.offsetWidth;
//                         var containerCenter = containerWidth / 2;
//
//                         var selectedWorkoutDomElement = domElement.querySelectorAll('.item-container')[scope.vm.selectedWorkout];
//                         if (!selectedWorkoutDomElement) {
//                             return;
//                         }
//                         var toCenterAlignment = selectedWorkoutDomElement.offsetWidth / 2;
//                         var scrollLeft = selectedWorkoutDomElement.offsetLeft + toCenterAlignment;// align to center
//                         var offset = containerCenter - scrollLeft;
//                         scope.vm.scrollActions.animate(offset, config.focusAnimateDuration, config.focuseAnimationTimingFunction);
//                     };
//
//                     function _selectWorkout(itemOrder, skipSetViewValue) {
//                         itemOrder = +itemOrder;
//                         if (isNaN(itemOrder)) {
//                             $log.error('workoutsProgress.directive:vm.selectWorkout: itemOrder is not a number');
//                             return;
//                         }
//                         var items = [scope.vm.diagnostic].concat(scope.vm.workouts);
//                         scope.vm.selectedWorkout = itemOrder;
//                         scope.vm.focusOnSelectedWorkout();
//                         var selectedItem = items[itemOrder];
//                         if (!skipSetViewValue) {
//                             ngModelCtrl.$setViewValue(selectedItem);
//                         }
//                     }
//
//                     scope.vm.workoutClick = function (itemOrder) {
//                         if (attrs.disabled) {
//                             return;
//                         }
//                         _selectWorkout(itemOrder);
//                     };
//
//                     ngModelCtrl.$render = function () {
//                         if (ngModelCtrl.$viewValue && angular.isDefined(ngModelCtrl.$viewValue.workoutOrder)) {
//                             $timeout(function () {
//                                 _selectWorkout(ngModelCtrl.$viewValue.workoutOrder, true);
//                                 _setProgressLineWidth(scope.activeWorkoutOrder);
//                             }, 0, false);
//                         }
//                     };
//
//                     scope.$on('$destroy', function () {
//                         domElement.removeEventListener('mouseleave', mouseLeaveEventListener);
//                         domElement.removeEventListener('mouseenter', mouseEnterEventListener);
//                     });
//
//                     attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
//                         if (angular.isDefined(newActiveWorkoutOrder)) {
//                             _setProgressLineWidth(newActiveWorkoutOrder);
//                         }
//                     });
//                 }
//             };
//         }
//     };
//
//     return directive;
// }

angular.module('znk.infra-web-app.workoutsRoadmap').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html",
    "<znk-scroll actions=\"vm.scrollActions\" scroll-on-mouse-wheel=\"true\">\n" +
    "    <div class=\"items-container\">\n" +
    "        <div class=\"dotted-lines-container\">\n" +
    "            <div class=\"dotted-line progress\"></div>\n" +
    "            <div class=\"dotted-line future\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container diagnostic\">\n" +
    "            <div class=\"item\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === vm.diagnostic.workoutOrder\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(vm.diagnostic.workoutOrder)\">\n" +
    "                <ng-switch on=\"vm.diagnostic.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\"\n" +
    "                              name=\"workouts-progress-check-mark-icon\"\n" +
    "                              ng-switch-when=\"2\">\n" +
    "                    </svg-icon>\n" +
    "                    <svg-icon class=\"flag-icon\"\n" +
    "                              name=\"workouts-progress-flag\"\n" +
    "                              ng-switch-default>\n" +
    "                    </svg-icon>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container\"\n" +
    "             ng-repeat=\"workout in vm.workouts\">\n" +
    "            <div class=\"item\"\n" +
    "                 subject-id-to-attr-drv=\"workout.subjectId\"\n" +
    "                 suffix=\"bg\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === workout.workoutOrder,\n" +
    "                    pristine: workout.subjectId === undefined\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(workout.workoutOrder)\">\n" +
    "                <ng-switch on=\"workout.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\" name=\"workouts-progress-check-mark-icon\" ng-switch-when=\"2\"></svg-icon>\n" +
    "                    <span ng-switch-default>\n" +
    "                        {{::workout.workoutOrder}}\n" +
    "                    </span>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "    </div>\n" +
    "</znk-scroll>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/flag-icon.svg",
    "<svg x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-145 277 60 60\"\n" +
    "	 class=\"flag-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .flag-svg .st0 {\n" +
    "            fill: #ffffff;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g id=\"kUxrE9.tif\">\n" +
    "	<g>\n" +
    "		<path class=\"st0\" id=\"XMLID_93_\" d=\"M-140.1,287c0.6-1.1,1.7-1.7,2.9-1.4c1.3,0.3,2,1.1,2.3,2.3c1.1,4,2.1,8,3.2,12c2.4,9.3,4.9,18.5,7.3,27.8\n" +
    "			c0.1,0.3,0.2,0.6,0.2,0.9c0.3,1.7-0.6,3-2.1,3.3c-1.4,0.3-2.8-0.5-3.3-2.1c-1-3.6-2-7.3-2.9-10.9c-2.5-9.5-5-19-7.6-28.6\n" +
    "			C-140.1,290-140.8,288.3-140.1,287z\"/>\n" +
    "		<path class=\"st0\" id=\"XMLID_92_\" d=\"M-89.6,289.1c-1,6.8-2.9,13-10,16c-3.2,1.4-6.5,1.6-9.9,0.9c-2-0.4-4-0.7-6-0.6c-4.2,0.3-7.1,2.7-9,6.4\n" +
    "			c-0.3,0.5-0.5,1.1-0.9,2c-0.3-1-0.5-1.7-0.8-2.5c-2-7-3.9-14.1-5.9-21.2c-0.3-1-0.1-1.7,0.5-2.4c4.5-6,11-7.4,17.5-3.6\n" +
    "			c3.4,2,6.7,4.2,10.2,6.1c1.9,1,3.9,1.9,5.9,2.4c3.2,0.9,5.9,0,7.9-2.6C-90,289.7-89.8,289.4-89.6,289.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmap.template.html",
    "<div class=\"app-workouts\">\n" +
    "    <div class=\"workouts-container base-border-radius base-box-shadow\">\n" +
    "        <workouts-progress workouts=\"vm.workoutsProgress\"\n" +
    "                           ng-disabled=\"vm.freezeWorkoutProgressComponent\"\n" +
    "                           diagnostic=\"vm.diagnostic\"\n" +
    "                           active-workout-order=\"{{vm.activeWorkoutOrder}}\"\n" +
    "                           ng-model=\"vm.selectedItem\">\n" +
    "        </workouts-progress>\n" +
    "        <div class=\"workout-container\"\n" +
    "             ng-class=\"vm.workoutSwitchAnimation\">\n" +
    "            <ui-view class=\"intro-ui-view\"></ui-view>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <estimated-score-widget></estimated-score-widget>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html",
    "<div translate-namespace=\"WORKOUTS_ROADMAP_DIAGNOSTIC_INTRO\">\n" +
    "    <div class=\"diagnostic-workout-pane base-border-radius\">\n" +
    "        <div class=\"diagnostic-workout-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "        <diagnostic-intro></diagnostic-intro>\n" +
    "        <md-button  class=\"md-primary znk\"\n" +
    "                    autofocus\n" +
    "                    tabindex=\"1\"\n" +
    "                    ui-sref=\"app.workouts.diagnostic({ skipIntro: true })\"\n" +
    "                    aria-label=\"{{::vm.buttonTitle}}\"\n" +
    "                    md-no-ink>{{::vm.buttonTitle | translate}}\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        ['ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra-web-app.purchase',
            'znk.infra.user',
            'znk.infra-web-app.invitation'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'znkHeader-raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
        function ($scope, $translatePartialLoader, $mdDialog, $window, purchaseService, znkHeaderSrv,
                  UserProfileService, $injector, PurchaseStateEnum) {
            'ngInject';
            $translatePartialLoader.addPart('znkHeader');

            var self = this;
            self.expandIcon = 'expand_more';
            self.additionalItems = znkHeaderSrv.getAdditionalItems();

            self.invokeOnClickHandler = function(onClickHandler){
                $injector.invoke(onClickHandler);
            };

            this.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };

            UserProfileService.getProfile().then(function (profile) {
                self.userProfile = {
                    username: profile.nickname,
                    email: profile.email
                };
            });

            this.znkOpenModal = function () {
                this.expandIcon = 'expand_less';
                //OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                //    self.isOnBoardingCompleted = isCompleted;
                //});
            };

            function _checkIfHasProVersion() {
                purchaseService.hasProVersion().then(function (hasProVersion) {
                    self.purchaseState = (hasProVersion) ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                    self.subscriptionStatus = (hasProVersion) ? '.PROFILE_STATUS_PRO' : '.PROFILE_STATUS_BASIC';
                });
            }

            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                self.subscriptionStatus = '.PROFILE_STATUS_PENDING';
                pendingPurchaseProm.then(function () {
                    _checkIfHasProVersion();
                });
            } else {
                _checkIfHasProVersion();
            }

            $scope.$on('$mdMenuClose', function () {
                self.expandIcon = 'expand_more';
            });

        });
})(angular);



(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').directive('znkHeader', [

        function () {
            return {
                    scope: {},
                    restrict: 'E',
                    templateUrl: 'components/znkHeader/templates/znkHeader.template.html',
                    controller: 'znkHeaderCtrl',
                    controllerAs: 'vm'
            };
        }
    ]);
})(angular);


/**
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
 *                                    objects) with the properties: text and onClickHandler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').provider('znkHeaderSrv',

        function () {
            var additionalHeaderItems = [];

            this.addAdditionalItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalHeaderItems.push(additionalItems);
                } else {
                    additionalHeaderItems = additionalItems;
                }
            };

            this.$get = [function () {
                return {
                    getAdditionalItems: function () {
                        return additionalHeaderItems;
                    }
                };
            }];

        }
    );
})(angular);


/**
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
 *                                    objects) with the properties: text and onClickHandler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').provider('znkHeaderSrv',

        function () {
            var additionalHeaderItems = [];

            this.addAdditionalItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalHeaderItems.push(additionalItems);
                } else {
                    additionalHeaderItems = additionalItems;
                }
            };

            this.$get = [function () {
                return {
                    getAdditionalItems: function () {
                        return additionalHeaderItems;
                    }
                };
            }];

        }
    );
})(angular);


angular.module('znk.infra-web-app.znkHeader').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkHeader/svg/raccoon-logo.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 237 158\"\n" +
    "    class=\"raccoon-logo-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .raccoon-logo-svg .circle{fill:#000001;}\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"circle\" cx=\"175\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M118.5,155.9c10.2,0,18.5-8.3,18.5-18.5c0-10.2-8.3-18.5-18.5-18.5c-10.2,0-18.5,8.3-18.5,18.5\n" +
    "		C100,147.6,108.3,155.9,118.5,155.9z\"/>\n" +
    "        <path class=\"circle\" d=\"M172.4,67.5c-15.8-9.7-34.3-15.3-53.9-15.3c-19.6,0-38.2,5.5-53.9,15.3\n" +
    "		c13,1.3,23.1,12.3,23.1,25.6c0,1.8-0.2,3.5-0.5,5.1c9.3-5.2,20-8.1,31.3-8.1c11.3,0,22,2.9,31.4,8.1c-0.3-1.7-0.5-3.4-0.5-5.1\n" +
    "		C149.3,79.8,159.5,68.8,172.4,67.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M36.3,93.5c-8,10.8-14,23.4-17.4,37.2c-1.2,4.9-0.4,10,2.3,14.3c2.6,4.3,6.8,7.3,11.7,8.5\n" +
    "		c1.5,0.4,3,0.5,4.5,0.5c8.8,0,16.3-6,18.4-14.5c1.8-7.7,5-14.7,9.2-20.9c-1,0.1-2,0.2-3,0.2C47.9,118.8,36.5,107.5,36.3,93.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M232.2,92.5c0.6-6.7,6.5-78-4.5-88.4c-9.5-9.1-60.3,16-77.5,24.9\n" +
    "		C185.3,37.8,215,60.9,232.2,92.5z\"/>\n" +
    "        <circle class=\"circle\" cx=\"62\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M204.1,153.6c10.2-2.4,16.4-12.7,14-22.8c-3.3-13.8-9.3-26.4-17.4-37.2\n" +
    "		c-0.2,14-11.6,25.3-25.7,25.3c-1,0-2-0.1-3-0.2c4.2,6.2,7.4,13.3,9.2,21c2,8.6,9.6,14.5,18.4,14.5\n" +
    "		C201.1,154.1,202.6,153.9,204.1,153.6\"/>\n" +
    "        <path class=\"circle\" d=\"M86.7,29C69.5,20.1,18.8-5,9.2,4.1c-11,10.4-5.1,81.5-4.5,88.4C22,60.8,51.7,37.8,86.7,29z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkHeader/templates/znkHeader.template.html",
    "<div class=\"app-header\" translate-namespace=\"ZNK_HEADER\">\n" +
    "    <div class=\"main-content-header\" layout=\"row\" layout-align=\"start start\">\n" +
    "        <svg-icon class=\"raccoon-logo-icon\"\n" +
    "                  name=\"znkHeader-raccoon-logo-icon\"\n" +
    "                  ui-sref=\"app.workouts.roadmap\"\n" +
    "                  ui-sref-opts=\"{reload: true}\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"app-states-list\">\n" +
    "            <md-list flex=\"grow\" layout=\"row\" layout-align=\"start center\">\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".WORKOUTS\"></span>\n" +
    "                    <a ui-sref=\"app.workouts.roadmap\"\n" +
    "                       ui-sref-opts=\"{reload: true}\"\n" +
    "                       class=\"link-full-item\">\n" +
    "                    </a>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".TESTS\"></span>\n" +
    "                    <a ui-sref=\"app.tests.roadmap\" class=\"link-full-item\"></a>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".TUTORIALS\"></span>\n" +
    "                    <a ui-sref=\"app.tutorials.roadmap\" class=\"link-full-item\"></a>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                    <span class=\"title\" translate=\".PERFORMANCE\"></span>\n" +
    "                    <a ui-sref=\"app.performance\" class=\"link-full-item\"></a>\n" +
    "                </md-list-item>\n" +
    "\n" +
    "                <div ng-repeat=\"headerItem in vm.additionalItems\" ng-click=\"vm.invokeOnClickHandler(headerItem.onClickHandler)\">\n" +
    "                    <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                        <span class=\"title\">{{headerItem.text}}</span>\n" +
    "                    </md-list-item>\n" +
    "                </div>\n" +
    "            </md-list>\n" +
    "\n" +
    "\n" +
    "\n" +
    "        </div>\n" +
    "        <div class=\"app-user-area\" layout=\"row\" layout-align=\"center center\">\n" +
    "            <invitation-manager></invitation-manager>\n" +
    "            <div class=\"profile-status\" ng-click=\"vm.showPurchaseDialog()\">\n" +
    "                <div class=\"pending-purchase-icon-wrapper\" ng-if=\"vm.purchaseState === 'pending'\">\n" +
    "                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "            </div>\n" +
    "            <md-menu md-offset=\"-61 68\">\n" +
    "                <md-button ng-click=\"$mdOpenMenu($event); vm.znkOpenModal();\"\n" +
    "                           class=\"md-icon-button profile-open-modal-btn\"\n" +
    "                           aria-label=\"Open sample menu\">\n" +
    "                    <div>{{::vm.userProfile.username}}</div>\n" +
    "                    <md-icon class=\"material-icons\">{{vm.expandIcon}}</md-icon>\n" +
    "                </md-button>\n" +
    "                <md-menu-content class=\"md-menu-content-znk-header\">\n" +
    "                    <md-list>\n" +
    "                        <md-list-item class=\"header-modal-item header-modal-item-profile\">\n" +
    "                            <span class=\"username\">{{::vm.userProfile.username}}</span>\n" +
    "                            <span class=\"email\">{{::vm.userProfile.email}}</span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple class=\"header-modal-item header-modal-item-uppercase links purchase-status\">\n" +
    "                            <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "                            <span class=\"link-full-item\" ng-click=\"vm.showPurchaseDialog()\"></span>\n" +
    "                            <ng-switch on=\"vm.purchaseState\">\n" +
    "                                <div ng-switch-when=\"pending\" class=\"pending-purchase-icon-wrapper\">\n" +
    "                                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                                </div>\n" +
    "                                <div ng-switch-when=\"pro\" class=\"check-mark-wrapper\">\n" +
    "                                    <svg-icon name=\"check-mark\"></svg-icon>\n" +
    "                                </div>\n" +
    "                            </ng-switch>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <span ng-disabled=\"!vm.isOnBoardingCompleted\"\n" +
    "                                  ng-click=\"vm.showGoalsEdit()\"\n" +
    "                                  translate=\".PROFILE_GOALS\"></span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <span ng-click=\"vm.showChangePassword()\" translate=\".PROFILE_CHANGE_PASSWORD\"></span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <a ui-sref=\"app.faq\">\n" +
    "                                <span translate=\".WHAT_IS_THE_ACT_TEST\"></span>\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <a ng-href=\"http://zinkerz.com/contact/\" target=\"_blank\">\n" +
    "                                <span translate=\".PROFILE_SUPPORT\"></span>\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <div class=\"divider\"></div>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase logout\">\n" +
    "                            <span ng-click=\"vm.logout()\" translate=\".PROFILE_LOGOUT\"></span>\n" +
    "                        </md-list-item>\n" +
    "                    </md-list>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
