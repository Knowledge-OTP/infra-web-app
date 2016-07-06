(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
        function ($scope, $translatePartialLoader, $window, purchaseService, znkHeaderSrv, UserGoalsService,
                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV) {
            'ngInject';
            $translatePartialLoader.addPart('znkHeader');

            var self = this;
            self.expandIcon = 'expand_more';
            self.additionalItems = znkHeaderSrv.getAdditionalItems();
            self.enableUserGoalsClick = false;

            UserGoalsService.getGoals().then(function(userGoals) {
                if(userGoals && !angular.equals({}, userGoals)) {
                    self.enableUserGoalsClick = true;
                }
            });

            self.invokeOnClickHandler = function(onClickHandler){
                $injector.invoke(onClickHandler);
            };

            this.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
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

            this.znkOpenModal = function () {
                this.expandIcon = 'expand_less';
                //OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                //    self.isOnBoardingCompleted = isCompleted;
                //});
            };

            this.logout = function () {
                AuthService.logout();
                $window.location.replace(ENV.redirectLogout);
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

