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
                    'znkHeader-check-mark-icon': 'components/znkHeader/svg/check-mark-icon.svg',
                    'znkHeader-app-name-logo': 'components/assets/svg/znk-app-name-logo.svg'
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
                addDefaultNavItem('ZNK_HEADER.TUTORIALS', 'app.tutorials');
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
    "        <div class=\"znkHeader-app-logo-wrap\">\n" +
    "            <svg-icon class=\"{{'ZNK_HEADER.APP_LOGO' | translate}}\"\n" +
    "                      name=\"{{'ZNK_HEADER.APP_LOGO' | translate}}\"\n" +
    "                      ui-sref=\"app.workouts.roadmap\"\n" +
    "                      ui-sref-opts=\"{reload: true}\">\n" +
    "            </svg-icon>\n" +
    "        </div>\n" +
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
  $templateCache.put("components/znkHeader/svg/znk-app-name-logo.svg",
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n" +
    "<svg version=\"1.1\" id=\"TOEFL\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-169 364 273 65\" style=\"enable-background:new -169 364 273 65;\" xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.st0{enable-background:new    ;}\n" +
    "	.st1{fill:#FF931E;}\n" +
    "	.st2{fill:#A1A1A1;}\n" +
    "	.st3{fill:none;enable-background:new    ;}\n" +
    "	.st4{fill:#000001;}\n" +
    "</style>\n" +
    "<g class=\"st0\">\n" +
    "	<path class=\"st1\" d=\"M-41.1,376.6v27.2h-5.6v-27.2h-10v-5h25.7v5H-41.1z\"/>\n" +
    "	<path class=\"st1\" d=\"M1.8,399.4c-3.3,3.2-7.5,4.8-12.4,4.8c-4.9,0-9.1-1.6-12.4-4.8c-3.3-3.2-5-7.1-5-11.9s1.7-8.7,5-11.9\n" +
    "		c3.3-3.2,7.5-4.8,12.4-4.8c4.9,0,9.1,1.6,12.4,4.8c3.3,3.2,5,7.1,5,11.9S5.1,396.2,1.8,399.4z M-2.3,379.3c-2.3-2.3-5-3.4-8.3-3.4\n" +
    "		c-3.3,0-6.1,1.1-8.3,3.4c-2.3,2.3-3.4,5-3.4,8.3c0,3.2,1.1,6,3.4,8.3c2.3,2.3,5,3.4,8.3,3.4c3.3,0,6.1-1.1,8.3-3.4\n" +
    "		c2.3-2.3,3.4-5,3.4-8.3C1.1,384.3,0,381.5-2.3,379.3z\"/>\n" +
    "	<path class=\"st1\" d=\"M37.1,371.7v5.1H19.5v8.5h15.9v4.8H19.5v8.6h18.2v5.1H13.9v-32.2H37.1z\"/>\n" +
    "	<path class=\"st1\" d=\"M50.4,376.7v8.8h14.7v5H50.4v13.3h-5.6v-32.2h22.1l0,5.1H50.4z\"/>\n" +
    "	<path class=\"st1\" d=\"M73.5,403.9v-32.2h5.6v27h15.1v5.2H73.5z\"/>\n" +
    "</g>\n" +
    "<path class=\"st1\" d=\"M97.4,365c3.4-0.2,6.4,2.4,6.6,5.9s-2.4,6.4-5.9,6.6c-0.2,0-0.5,0-0.7,0c-3.4,0.2-6.4-2.4-6.7-5.8\n" +
    "	c-0.2-3.4,2.4-6.4,5.8-6.7C96.8,365,97.1,365,97.4,365L97.4,365z M97.3,366.3c-2.7,0-4.9,2.3-4.9,5c0,2.7,2.3,4.9,5,4.9\n" +
    "	c2.7,0,4.9-2.1,4.9-4.8c0-0.1,0-0.1,0-0.2c0-2.7-2.1-5-4.8-5C97.4,366.3,97.4,366.3,97.3,366.3L97.3,366.3L97.3,366.3z M96.3,374.4\n" +
    "	h-1.5v-6.2c0.8-0.1,1.7-0.2,2.5-0.2c0.8-0.1,1.5,0.1,2.2,0.5c0.4,0.3,0.7,0.8,0.7,1.3c-0.1,0.7-0.6,1.3-1.3,1.5v0.1\n" +
    "	c0.6,0.2,1.1,0.8,1.1,1.5c0.1,0.5,0.2,1,0.5,1.5h-1.6c-0.3-0.5-0.4-1-0.5-1.5c-0.1-0.6-0.7-1-1.3-1c0,0,0,0-0.1,0h-0.7L96.3,374.4\n" +
    "	L96.3,374.4z M96.4,371h0.7c0.8,0,1.5-0.3,1.5-0.9c0-0.6-0.4-0.9-1.4-0.9c-0.3,0-0.6,0-0.8,0.1L96.4,371L96.4,371z\"/>\n" +
    "<g class=\"st0\">\n" +
    "	<path class=\"st2\" d=\"M-16,416v1.5h-4.2V429H-22v-11.5h-4.2V416H-16z\"/>\n" +
    "	<path class=\"st2\" d=\"M-6.2,416v1.4h-6.2v4.3h5v1.4h-5v4.4h6.2v1.4h-8v-13H-6.2z\"/>\n" +
    "	<path class=\"st2\" d=\"M3,418.1c-0.1,0.1-0.1,0.2-0.2,0.2c-0.1,0-0.1,0.1-0.2,0.1c-0.1,0-0.2-0.1-0.4-0.2s-0.3-0.2-0.5-0.3\n" +
    "		c-0.2-0.1-0.5-0.2-0.8-0.3s-0.6-0.2-1.1-0.2c-0.4,0-0.7,0.1-1,0.2c-0.3,0.1-0.6,0.2-0.8,0.4c-0.2,0.2-0.4,0.4-0.5,0.6\n" +
    "		c-0.1,0.2-0.2,0.5-0.2,0.8c0,0.4,0.1,0.7,0.3,0.9c0.2,0.2,0.4,0.4,0.7,0.6c0.3,0.2,0.6,0.3,1,0.4c0.4,0.1,0.8,0.3,1.1,0.4\n" +
    "		c0.4,0.1,0.8,0.3,1.1,0.4c0.4,0.2,0.7,0.4,1,0.6c0.3,0.3,0.5,0.6,0.7,0.9c0.2,0.4,0.3,0.8,0.3,1.4c0,0.6-0.1,1.1-0.3,1.6\n" +
    "		c-0.2,0.5-0.5,0.9-0.8,1.3c-0.4,0.4-0.8,0.7-1.4,0.9s-1.2,0.3-1.8,0.3c-0.8,0-1.6-0.2-2.3-0.5c-0.7-0.3-1.3-0.7-1.8-1.2l0.5-0.8\n" +
    "		c0-0.1,0.1-0.1,0.2-0.2c0.1,0,0.1-0.1,0.2-0.1c0.1,0,0.3,0.1,0.4,0.2s0.4,0.3,0.6,0.4s0.5,0.3,0.9,0.4c0.3,0.1,0.8,0.2,1.3,0.2\n" +
    "		c0.4,0,0.8-0.1,1.1-0.2s0.6-0.3,0.8-0.5c0.2-0.2,0.4-0.5,0.5-0.7c0.1-0.3,0.2-0.6,0.2-1c0-0.4-0.1-0.7-0.3-1s-0.4-0.5-0.7-0.6\n" +
    "		c-0.3-0.2-0.6-0.3-1-0.4c-0.4-0.1-0.8-0.2-1.1-0.4c-0.4-0.1-0.8-0.3-1.1-0.4s-0.7-0.4-1-0.6c-0.3-0.3-0.5-0.6-0.7-1\n" +
    "		s-0.3-0.9-0.3-1.4c0-0.5,0.1-0.9,0.3-1.3s0.4-0.8,0.8-1.1s0.8-0.6,1.3-0.8s1.1-0.3,1.7-0.3c0.7,0,1.4,0.1,2,0.3\n" +
    "		c0.6,0.2,1.1,0.6,1.6,1L3,418.1z\"/>\n" +
    "	<path class=\"st2\" d=\"M14.8,416v1.5h-4.2V429H8.8v-11.5H4.6V416H14.8z\"/>\n" +
    "	<path class=\"st2\" d=\"M22,424.2v4.8h-1.7v-13h3.8c0.8,0,1.5,0.1,2.1,0.3c0.6,0.2,1.1,0.5,1.5,0.8s0.7,0.8,0.9,1.3s0.3,1,0.3,1.7\n" +
    "		c0,0.6-0.1,1.2-0.3,1.7c-0.2,0.5-0.5,0.9-0.9,1.3c-0.4,0.4-0.9,0.6-1.5,0.8s-1.3,0.3-2.1,0.3H22z M22,422.8h2.1\n" +
    "		c0.5,0,0.9-0.1,1.3-0.2c0.4-0.1,0.7-0.3,1-0.6c0.3-0.2,0.5-0.5,0.6-0.9c0.1-0.3,0.2-0.7,0.2-1.1c0-0.8-0.3-1.5-0.8-1.9\n" +
    "		c-0.5-0.5-1.3-0.7-2.3-0.7H22V422.8z\"/>\n" +
    "	<path class=\"st2\" d=\"M33.1,423.6v5.4h-1.7v-13H35c0.8,0,1.5,0.1,2.1,0.2c0.6,0.2,1.1,0.4,1.5,0.7c0.4,0.3,0.7,0.7,0.9,1.1\n" +
    "		s0.3,0.9,0.3,1.5c0,0.5-0.1,0.9-0.2,1.3c-0.1,0.4-0.4,0.8-0.6,1.1s-0.6,0.6-1,0.8c-0.4,0.2-0.8,0.4-1.3,0.5\n" +
    "		c0.2,0.1,0.4,0.3,0.6,0.6l3.8,5.1h-1.6c-0.3,0-0.6-0.1-0.7-0.4l-3.4-4.6c-0.1-0.1-0.2-0.2-0.3-0.3c-0.1-0.1-0.3-0.1-0.5-0.1H33.1z\n" +
    "		 M33.1,422.3h1.8c0.5,0,1-0.1,1.4-0.2c0.4-0.1,0.7-0.3,1-0.5c0.3-0.2,0.5-0.5,0.6-0.8s0.2-0.7,0.2-1c0-0.8-0.3-1.4-0.8-1.7\n" +
    "		c-0.5-0.4-1.3-0.6-2.3-0.6h-1.9V422.3z\"/>\n" +
    "	<path class=\"st2\" d=\"M50.8,416v1.4h-6.2v4.3h5v1.4h-5v4.4h6.2v1.4h-8v-13H50.8z\"/>\n" +
    "	<path class=\"st2\" d=\"M55.2,424.2v4.8h-1.7v-13h3.8c0.8,0,1.5,0.1,2.1,0.3c0.6,0.2,1.1,0.5,1.5,0.8s0.7,0.8,0.9,1.3s0.3,1,0.3,1.7\n" +
    "		c0,0.6-0.1,1.2-0.3,1.7c-0.2,0.5-0.5,0.9-0.9,1.3c-0.4,0.4-0.9,0.6-1.5,0.8s-1.3,0.3-2.1,0.3H55.2z M55.2,422.8h2.1\n" +
    "		c0.5,0,0.9-0.1,1.3-0.2c0.4-0.1,0.7-0.3,1-0.6c0.3-0.2,0.5-0.5,0.6-0.9c0.1-0.3,0.2-0.7,0.2-1.1c0-0.8-0.3-1.5-0.8-1.9\n" +
    "		c-0.5-0.5-1.3-0.7-2.3-0.7h-2.1V422.8z\"/>\n" +
    "</g>\n" +
    "<path class=\"st3\" d=\"z\"/>\n" +
    "<circle id=\"XMLID_137_\" class=\"st4\" cx=\"-97.6\" cy=\"403\" r=\"5.7\"/>\n" +
    "<path id=\"XMLID_136_\" class=\"st4\" d=\"M-121,429c4.2,0,7.7-3.4,7.7-7.7c0-4.2-3.4-7.7-7.7-7.7c-4.2,0-7.7,3.4-7.7,7.7\n" +
    "	C-128.7,425.6-125.2,429-121,429z\"/>\n" +
    "<path id=\"XMLID_135_\" class=\"st4\" d=\"M-98.7,392.5c-6.5-4-14.2-6.3-22.3-6.3c-8.1,0-15.8,2.3-22.3,6.3c5.4,0.5,9.6,5.1,9.6,10.6\n" +
    "	c0,0.7-0.1,1.4-0.2,2.1c3.9-2.1,8.3-3.3,13-3.3c4.7,0,9.1,1.2,13,3.3c-0.1-0.7-0.2-1.4-0.2-2.1C-108.3,397.5-104.1,393-98.7,392.5z\"\n" +
    "	/>\n" +
    "<path id=\"XMLID_134_\" class=\"st4\" d=\"M-155,403.2c-3.3,4.5-5.8,9.7-7.2,15.4c-0.5,2-0.2,4.1,0.9,5.9c1.1,1.8,2.8,3,4.8,3.5\n" +
    "	c0.6,0.1,1.2,0.2,1.8,0.2c3.6,0,6.8-2.5,7.6-6c0.8-3.2,2.1-6.1,3.8-8.6c-0.4,0-0.8,0.1-1.2,0.1C-150.2,413.7-154.9,409-155,403.2z\"\n" +
    "	/>\n" +
    "<path id=\"XMLID_132_\" class=\"st4\" d=\"M-74,402.8c0.2-2.8,2.7-32.3-1.9-36.6c-3.9-3.7-24.9,6.6-32,10.3\n" +
    "	C-93.4,380.2-81.1,389.7-74,402.8z\"/>\n" +
    "<circle id=\"XMLID_131_\" class=\"st4\" cx=\"-144.4\" cy=\"403\" r=\"5.7\"/>\n" +
    "<path id=\"XMLID_130_\" class=\"st4\" d=\"M-97.6,413.7c-0.4,0-0.8,0-1.3-0.1c1.7,2.6,3.1,5.5,3.8,8.7c0.8,3.5,4,6,7.6,6\n" +
    "	c0.6,0,1.2-0.1,1.8-0.2c4.2-1,6.8-5.2,5.8-9.4c-1.4-5.7-3.9-10.9-7.2-15.4C-87.1,409-91.8,413.7-97.6,413.7z\"/>\n" +
    "<path id=\"XMLID_129_\" class=\"st4\" d=\"M-134.1,376.6c-7.1-3.7-28.1-14.1-32-10.3c-4.5,4.3-2.1,33.7-1.9,36.6\n" +
    "	C-160.9,389.7-148.6,380.2-134.1,376.6z\"/>\n" +
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
