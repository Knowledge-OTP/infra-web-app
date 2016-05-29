
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').controller('invitationApproveModalCtrl',

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
