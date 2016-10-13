(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
        function ($scope, $window, purchaseService, znkHeaderSrv, OnBoardingService, SettingsSrv, $timeout,
                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV, feedbackSrv) {
            'ngInject';

            var self = this;
            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            self.expandIcon = 'expand_more';
            self.additionalItems = znkHeaderSrv.getAdditionalItems();
            self.purchaseData = {};

            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                self.subscriptionStatus = '.PROFILE_STATUS_PENDING';
            } else {
                self.purchaseState = PurchaseStateEnum.NONE.enum;
                self.subscriptionStatus = '.PROFILE_STATUS_BASIC';

            }

            purchaseService.getPurchaseData().then(function (purchaseData) {
                self.purchaseData = purchaseData;
            });

            $scope.$watch(function () {
                return self.purchaseData;
            }, function (newPurchaseState) {
                $timeout(function () {
                    var hasProVersion = !(angular.equals(newPurchaseState, {}));
                    self.purchaseState = (hasProVersion) ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                    self.subscriptionStatus = (hasProVersion) ? '.PROFILE_STATUS_PRO' : '.PROFILE_STATUS_BASIC';
                });
            }, true);


            OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                self.isOnBoardingCompleted = isCompleted;
            });

            self.invokeOnClickHandler = function(onClickHandler){
                $injector.invoke(onClickHandler);
            };

            this.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };

            this.showChangePassword = function() {
                SettingsSrv.showChangePassword();
            };

            this.showGoalsEdit = function () {
                userGoalsSelectionService.openEditGoalsDialog({
                    clickOutsideToCloseFlag: true
                });
            };

            UserProfileService.getProfile().then(function (profile) {
                self.userProfile = {
                    username: profile.nickname,
                    email: profile.email
                };
            });

            self.showFeedbackDialog = function () {
                feedbackSrv.showFeedbackDialog();
            };

            this.znkOpenModal = function () {
                self.expandIcon = 'expand_less';
            };

            this.logout = function () {
                AuthService.logout();
                $window.location.replace(ENV.redirectLogout);
            };


            $scope.$on('$mdMenuClose', function () {
                self.expandIcon = 'expand_more';
            });

        });
})(angular);

