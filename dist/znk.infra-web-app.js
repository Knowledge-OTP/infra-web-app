(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function(){}
    ]);
})(angular);

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

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ui.router',
        'znk.infra.enum',
        'znk.infra.exerciseUtility'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {};
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('InfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var InfraConfigSrv = {};

                    return InfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function($templateCache) {

}]);

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

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('workoutsRoadmap', {
                    templateUrl: 'app/workouts/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: ["ExerciseStatusEnum", "WorkoutsSrv", "$q", function data(ExerciseStatusEnum, WorkoutsSrv, /*WorkoutsDiagnosticFlow,*/ $q) {
                            'ngInject';

                            // var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([/*isDiagnosticCompletedProm, */workoutsProgressProm]).then(function (res) {
                                var isDiagnosticCompleted = res[0];
                                var workoutsProgress = res[1];

                                return {
                                    // diagnostic: {
                                    //     status: isDiagnosticCompleted ? ExerciseStatusEnum.COMPLETED.enum : ExerciseStatusEnum.ACTIVE.enum,
                                    //     workoutOrder: 0
                                    // },
                                    workoutsProgress: workoutsProgress
                                };
                            });
                        }]
                    },
                    controller: 'WorkoutsRoadMapController',
                    controllerAs: 'vm'
                })
/*                .state('app.workouts.roadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.diagnostic.intro', {
                    templateUrl: 'app/workouts/templates/workoutsRoadmapDiagnosticIntro.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticIntroController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.diagnostic.preSummary', {
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

angular.module('znk.infra-web-app.workoutsRoadmap').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', []);
})(angular);
