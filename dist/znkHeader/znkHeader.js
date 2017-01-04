(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        [   'ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'ui.router',
            'znk.infra-web-app.purchase',
            'znk.infra-web-app.onBoarding',
            'znk.infra-web-app.userGoalsSelection',
            'znk.infra-web-app.myProfile',
            'znk.infra.user',
            'znk.infra-web-app.activePanel',
            'znk.infra-web-app.feedback'])
        .config(["SvgIconSrvProvider", function(SvgIconSrvProvider){
                'ngInject';
                var svgMap = {
                    'znkHeader-raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg',
                    'znkHeader-check-mark-icon': 'components/znkHeader/svg/check-mark-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader')
        .component('znkHeader', {
            bindings: {},
            templateUrl:  'components/znkHeader/components/znkHeader/znkHeader.template.html',
            controllerAs: 'vm',
            controller: ["$scope", "$window", "purchaseService", "znkHeaderSrv", "OnBoardingService", "ActivePanelSrv", "MyProfileSrv", "feedbackSrv", "$rootScope", "UserProfileService", "$injector", "PurchaseStateEnum", "userGoalsSelectionService", "AuthService", "ENV", "$timeout", "MyLiveLessons", function ($scope, $window, purchaseService, znkHeaderSrv, OnBoardingService, ActivePanelSrv, MyProfileSrv, feedbackSrv, $rootScope,
                                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV, $timeout,MyLiveLessons) {
                'ngInject';

                var vm = this;
                var pendingPurchaseProm = purchaseService.getPendingPurchase();
                ActivePanelSrv.loadActivePanel();
                vm.expandIcon = 'expand_more';
                vm.additionalItems = znkHeaderSrv.getAdditionalItems();
                vm.showPurchaseDialog = purchaseService.showPurchaseDialog;
                vm.showMyProfile = MyProfileSrv.showMyProfile;
                vm.showMyLiveLessonsSchedule = MyLiveLessons.liveLessonsScheduleModal;
                vm.showFeedbackDialog = feedbackSrv.showFeedbackDialog;
                vm.purchaseData = {};
                vm.purchaseState = pendingPurchaseProm ? PurchaseStateEnum.PENDING.enum : PurchaseStateEnum.NONE.enum;
                vm.subscriptionStatus = pendingPurchaseProm ? '.PROFILE_STATUS_PENDING' : '.PROFILE_STATUS_BASIC';

                $scope.$on('profile-updated', function(event, args) {
                    vm.userProfile = {
                        username: args.profile.nickname,
                        email: args.profile.email
                    };
                });

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
                    $rootScope.$broadcast('auth:beforeLogout');
                    AuthService.logout();
                    $window.location.replace(ENV.redirectLogout);
                };

                $scope.$on('$mdMenuClose', function () {
                    vm.expandIcon = 'expand_more';
                });
            }]
        });
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
            var additionalNavMenuItems = [];

            this.addAdditionalNavMenuItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalNavMenuItems.push(additionalItems);
                } else {
                    additionalNavMenuItems = additionalItems;
                }
            };

            this.$get = function () {
                'ngInject';
                var navItemsArray = [];

                function addDefaultNavItem(_text, _goToState, _stateOpt) {

                    var navItem = {
                        text: _text,
                        goToState: _goToState,
                        stateOpt: _stateOpt
                    };

                    navItemsArray.push(navItem);
                }

                addDefaultNavItem('ZNK_HEADER.WORKOUTS', 'app.workouts.roadmap', { reload: true });
                addDefaultNavItem('ZNK_HEADER.TESTS', 'app.tests.roadmap');
                // addDefaultNavItem('ZNK_HEADER.TUTORIALS', 'app.tutorials.roadmap');
                addDefaultNavItem('ZNK_HEADER.PERFORMANCE', 'app.performance');
                addDefaultNavItem('ZNK_HEADER.ETUTORING', 'app.eTutoring');

                return {
                    getAdditionalItems: function () {
                        return navItemsArray.concat(additionalNavMenuItems);  // return array of default nav items with additional nav items
                    }
                };
            };

        }
    );
})(angular);


angular.module('znk.infra-web-app.znkHeader').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkHeader/components/znkHeader/znkHeader.template.html",
    "<div class=\"app-header\" translate-namespace=\"ZNK_HEADER\">\n" +
    "    <div class=\"main-content-header\" layout=\"row\" layout-align=\"start start\">\n" +
    "        <svg-icon class=\"raccoon-logo-icon\"\n" +
    "                  name=\"znkHeader-raccoon-logo-icon\"\n" +
    "                  ui-sref=\"app.workouts.roadmap\"\n" +
    "                  ui-sref-opts=\"{reload: true}\">\n" +
    "        </svg-icon>\n" +
    "\n" +
    "        <div class=\"app-states-list\">\n" +
    "            <md-list flex=\"grow\" layout=\"row\" layout-align=\"start center\">\n" +
    "                <div ng-repeat=\"headerItem in vm.additionalItems\">\n" +
    "                    <md-list-item md-ink-ripple\n" +
    "                                  ui-sref-active=\"active\">\n" +
    "                        <span class=\"title\" translate=\"{{headerItem.text}}\"></span>\n" +
    "                        <a ui-sref=\"{{headerItem.goToState}}\"\n" +
    "                           ui-sref-opts=\"{{headerItem.stateOpt}}\"\n" +
    "                           class=\"link-full-item\">\n" +
    "                        </a>\n" +
    "                    </md-list-item>\n" +
    "                </div>\n" +
    "            </md-list>\n" +
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
    "                    <div>{{vm.userProfile.username}}</div>\n" +
    "                    <md-icon class=\"material-icons\">{{vm.expandIcon}}</md-icon>\n" +
    "                </md-button>\n" +
    "                <md-menu-content class=\"md-menu-content-znk-header\">\n" +
    "                    <md-list>\n" +
    "                        <md-list-item class=\"header-modal-item header-modal-item-profile\">\n" +
    "                            <span class=\"username\">{{vm.userProfile.username}}</span>\n" +
    "                            <span class=\"email\">{{vm.userProfile.email}}</span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                                      class=\"header-modal-item header-modal-item-uppercase links purchase-status\">\n" +
    "                            <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "                            <span class=\"link-full-item\" ng-click=\"vm.showPurchaseDialog()\"></span>\n" +
    "                            <ng-switch on=\"vm.purchaseState\">\n" +
    "                                <div ng-switch-when=\"pending\" class=\"pending-purchase-icon-wrapper\">\n" +
    "                                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                                </div>\n" +
    "                                <div ng-switch-when=\"pro\" class=\"check-mark-wrapper\">\n" +
    "                                    <svg-icon name=\"znkHeader-check-mark-icon\"></svg-icon>\n" +
    "                                </div>\n" +
    "                            </ng-switch>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            ng-class=\"{'no-live-lessons': vm.noLiveLessons}\"\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <span\n" +
    "                                ng-click=\"vm.showMyLiveLessonsSchedule()\"\n" +
    "                                translate=\".MY_LIVE_LESSONS\"></span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                                      ng-disabled=\"!vm.isOnBoardingCompleted\"\n" +
    "                                      disable-click-drv\n" +
    "                                      ng-click=\"vm.showGoalsEdit()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                                 translate=\".PROFILE_GOALS\"></div>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                                      ng-click=\"vm.showMyProfile()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                                 translate=\".MY_PROFILE\"></div>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple>\n" +
    "                            <a ui-sref=\"app.faq\"\n" +
    "                               class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                               translate=\".WHAT_IS_THE_THIS_TEST\">\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                                      ng-click=\"vm.showFeedbackDialog()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                                 translate=\".PROFILE_SUPPORT\"></div>\n" +
    "                        </md-list-item>\n" +
    "                        <div class=\"divider\"></div>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                                      ng-click=\"vm.logout()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase logout\"\n" +
    "                                 translate=\".PROFILE_LOGOUT\"></div>\n" +
    "                        </md-list-item>\n" +
    "                    </md-list>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkHeader/svg/check-mark-icon.svg",
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
  $templateCache.put("components/znkHeader/svg/pending-purchase-clock-icon.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 183 183\"\n" +
    "    style=\"enable-background:new 0 0 183 183;\" xml:space=\"preserve\"\n" +
    "    class=\"pending-purchase-clock-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.pending-purchase-clock-svg .st0{fill:none;stroke:#231F20;stroke-width:10.5417;stroke-miterlimit:10;}\n" +
    "	.pending-purchase-clock-svg .st1{fill:none;stroke:#231F20;stroke-width:12.3467;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "	.pending-purchase-clock-svg .st2{fill:none;stroke:#231F20;stroke-width:11.8313;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<circle class=\"st0\" cx=\"91.5\" cy=\"91.5\" r=\"86.2\"/>\n" +
    "<line class=\"st1\" x1=\"92.1\" y1=\"96\" x2=\"92.1\" y2=\"35.5\"/>\n" +
    "<line class=\"st2\" x1=\"92.1\" y1=\"96\" x2=\"131.4\" y2=\"96\"/>\n" +
    "</svg>\n" +
    "");
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
  $templateCache.put("components/znkHeader/svg/znk-header-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"znkHeader-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .znkHeader-check-mark-svg .st0 {\n" +
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
