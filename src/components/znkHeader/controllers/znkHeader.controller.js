(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
        function ($scope, $window, purchaseService, znkHeaderSrv, OnBoardingService, SettingsSrv, $timeout,
                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV, feedbackSrv) {
            'ngInject';

            var self = this;
            self.expandIcon = 'expand_more';
            self.additionalItems = znkHeaderSrv.getAdditionalItems();

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

            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                self.subscriptionStatus = '.PROFILE_STATUS_PENDING';
            }

            purchaseService.getPurchaseData().then(function (purchaseData) {
                self.purchaseData = purchaseData;
            });

            $scope.$watch('self.purchaseData', function (newPurchaseState) {
                $timeout(function () {
                    var hasProVersion = !(angular.equals(newPurchaseState, {}));
                    self.purchaseState = (hasProVersion) ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                    self.subscriptionStatus = (hasProVersion) ? '.PROFILE_STATUS_PRO' : '.PROFILE_STATUS_BASIC';
                });
            }, true);


            $scope.$on('$mdMenuClose', function () {
                self.expandIcon = 'expand_more';
            });

        });
})(angular);

