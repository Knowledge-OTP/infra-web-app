(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader')
        .component('znkHeader', {
            bindings: {},
            templateUrl: 'components/znkHeader/components/znkHeader/znkHeader.template.html',
            controllerAs: 'vm',
            controller: function ($scope, $window, purchaseService, znkHeaderSrv, OnBoardingService, ActivePanelSrv, MyProfileSrv, feedbackSrv, $rootScope,
                                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV, $timeout, MyLiveLessons, NavigationService) {
                'ngInject';

                var vm = this;
                var pendingPurchaseProm = purchaseService.getPendingPurchase();
                ActivePanelSrv.loadActivePanel();
                vm.expandIcon = 'expand_more';
                vm.showheaderlinks = false;
                vm.logoRedirect = false;
                vm.additionalItems = znkHeaderSrv.getAdditionalItems();
                vm.showPurchaseDialog = purchaseService.showPurchaseDialog;
                vm.showMyProfile = MyProfileSrv.showMyProfile;
                vm.showMyLiveLessonsSchedule = MyLiveLessons.liveLessonsScheduleModal;
                vm.showFeedbackDialog = feedbackSrv.showFeedbackDialog;
                vm.purchaseData = {};
                vm.purchaseState = pendingPurchaseProm ? PurchaseStateEnum.PENDING.enum : PurchaseStateEnum.NONE.enum;
                vm.subscriptionStatus = pendingPurchaseProm ? '.PROFILE_STATUS_PENDING' : '.PROFILE_STATUS_BASIC';
                vm.myZinkerzUrl = ENV.myZinkerz;
                vm.showReviewCreditBtn = false;
                const isTeacherApp = (ENV.appContext.toLowerCase()) === 'dashboard';
                const globalVariablesProm = znkHeaderSrv.getGlobalVariables();

                vm.goToMyZinkerz = function (route) {
                    NavigationService.navigateToMyZinkerz(route);
                };

                $scope.$on('profile-updated', function (event, args) {
                    vm.userProfile = {
                        username: args.profile.nickname,
                        email: args.profile.email
                    };
                });

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    vm.purchaseData = purchaseData;
                });
                OnBoardingService.getMarketingToefl().then(function (marketingObj) {
                    vm.showheaderlinks = !(marketingObj && marketingObj.status && marketingObj.status !== 7);
                    vm.logoRedirect = !(marketingObj && marketingObj.status && marketingObj.status !== 7);
                });
                $scope.$watch(function () {
                    return vm.purchaseData;
                }, function (newPurchaseState) {
                    $timeout(function () {
                        var hasProVersion = !(angular.equals(newPurchaseState, {}));
                        if (hasProVersion) {
                            vm.purchaseState = PurchaseStateEnum.PRO.enum;
                            vm.subscriptionStatus = '.PROFILE_STATUS_PRO';
                            if (!isTeacherApp) {
                                // If we have the current service ID with an amount for initial review credits under the
                                // globalVariable.manualReviewInitProCredits, then it means the current app is an app
                                // that uses review credits, so we need to show this component.
                                globalVariablesProm.then(globalVariables => {
                                    vm.showReviewCreditBtn = Object.keys(globalVariables.manualReviewInitProCredits).includes(ENV.serviceId);
                                });
                            }
                        }
                    });
                }, true);

                OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                    vm.isOnBoardingCompleted = isCompleted;
                });

                vm.invokeOnClickHandler = function (onClickHandler) {
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
                    $rootScope.$broadcast('auth:beforeLogout');
                    AuthService.logout();
                    $window.location.replace(ENV.redirectLogout);
                };

                $scope.$on('$mdMenuClose', function () {
                    vm.expandIcon = 'expand_more';
                });
            }
        });
})(angular);
