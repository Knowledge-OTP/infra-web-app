(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader')
        .component('znkHeader', {
            bindings: {},
            templateUrl:  'components/znkHeader/components/znkHeader/znkHeader.template.html',
            controllerAs: 'vm',
            controller: function ($scope, $window, purchaseService, znkHeaderSrv, OnBoardingService, MyProfileSrv, feedbackSrv,
                                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV, $timeout) {
                'ngInject';

                var vm = this;
                var pendingPurchaseProm = purchaseService.getPendingPurchase();
                vm.expandIcon = 'expand_more';
                vm.additionalItems = znkHeaderSrv.getAdditionalItems();
                vm.showPurchaseDialog = purchaseService.showPurchaseDialog;
                vm.showMyProfile = MyProfileSrv.showMyProfile;
                vm.showFeedbackDialog = feedbackSrv.showFeedbackDialog;
                vm.purchaseData = {};
                vm.purchaseState = pendingPurchaseProm ? PurchaseStateEnum.PENDING.enum : PurchaseStateEnum.NONE.enum;
                vm.subscriptionStatus = pendingPurchaseProm ? '.PROFILE_STATUS_PENDING' : '.PROFILE_STATUS_BASIC';

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    vm.purchaseData = purchaseData;
                });

                $scope.$watch(function () {
                    return vm.purchaseData;
                }, function (newPurchaseState) {
                    $timeout(function () {
                        var hasProVersion = !(angular.equals(newPurchaseState, {}));
                        if (hasProVersion) {
                            vm.purchaseState = PurchaseStateEnum.PRO.enum;
                            vm.subscriptionStatus = '.PROFILE_STATUS_PRO';
                        }
                    });
                }, true);

                OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                    vm.isOnBoardingCompleted = isCompleted;
                });

                vm.invokeOnClickHandler = function(onClickHandler){
                    $injector.invoke(onClickHandler);
                };

                vm.showGoalsEdit = function () {
                    userGoalsSelectionService.openEditGoalsDialog({
                        clickOutsideToCloseFlag: true
                    });
                };

                UserProfileService.getProfile().then(function (profile) {
                    vm.userProfile = {
                        username: profile.nickname,
                        email: profile.email
                    };
                });

                vm.znkOpenModal = function () {
                    vm.expandIcon = 'expand_less';
                };

                vm.logout = function () {
                    AuthService.logout();
                    $window.location.replace(ENV.redirectLogout);
                };

                $scope.$on('$mdMenuClose', function () {
                    vm.expandIcon = 'expand_more';
                });
            }
        });
})(angular);
