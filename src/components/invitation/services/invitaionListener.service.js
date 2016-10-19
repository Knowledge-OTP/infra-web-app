'use strict';

angular.module('znk.infra-web-app.invitation').service('InvitationListenerService',
    function (ENV, InfraConfigSrv, AuthService, $timeout, $q, StorageSrv) {
        'ngInject';

        var NEW_INVITATION_PATH, SENT_INVITATION_PATH, MY_TEACHER_PATH;

        var self = this;
        self.receivedInvitations = {};
        self.pendingConformations = {};
        self.declinedInvitations = {};
        self.myTeacher = {};


        var pathsProm = $q.when().then(function () {
            var STUDENT_INVITATION_PATH = StorageSrv.variables.appUserSpacePath + '/invitations';
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
