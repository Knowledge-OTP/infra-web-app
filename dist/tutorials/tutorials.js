(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.tutorials', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.enum',
        'znk.infra.config',
        'znk.infra.general',
        'znk.infra.svgIcon',
        'ui.router',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.completeExercise',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.loadingAnimation',
        'znk.infra.exerciseResult',
        'znk.infra.contentAvail',
        'znk.infra.contentGetters',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.subjectsOrder'

    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
        var svgMap = {
            'locked-icon': 'components/tutorials/svg/subject-locked-icon.svg',
            'tutorials-check-mark-icon': 'components/tutorials/svg/tutorials-check-mark-icon.svg'
        };
            SvgIconSrvProvider.registerSvgSources(svgMap);

        }
    ]);
})(angular);

'use strict';
angular.module('znk.infra-web-app.tutorials').component('tutorialList', {
    templateUrl: 'components/tutorials/components/tutorialList/tutorialList.template.html',
    require: {
        ngModelCtrl: 'ngModel'
    },
    bindings: {
        tutorials: '<'
    },
    controllerAs: 'vm',
    controller: ["SubjectEnum", "DiagnosticSrv", "ExerciseStatusEnum", function (SubjectEnum, DiagnosticSrv, ExerciseStatusEnum) {
        var vm = this;
        vm.subjectsMap = SubjectEnum.getEnumMap();
        vm.isDiagnosticComplete = true;
        DiagnosticSrv.getDiagnosticStatus().then(function (diagnosticStatus) {
            vm.isDiagnosticComplete = diagnosticStatus === ExerciseStatusEnum.COMPLETED.enum;
        });
        vm.tutorialsArrs = vm.tutorials;

        vm.$onInit = function () {
            vm.ngModelCtrl.$render = function () {
                vm.activeSubject = vm.ngModelCtrl.$modelValue;
            };
        };
    }]
});

'use strict';
angular.module('znk.infra-web-app.tutorials').component('tutorialListItem', {
    templateUrl: 'components/tutorials/components/tutorialListItem/tutorialListItem.template.html',
    require: {
        ngModelCtrl: '^ngModel'
    },
    bindings: {
        tutorial: "<"
    },
    controllerAs: 'vm',
    controller: ["SubjectEnum", "DiagnosticSrv", "ExerciseStatusEnum", "purchaseService", "$state", function (SubjectEnum, DiagnosticSrv, ExerciseStatusEnum, purchaseService, $state) {
        var vm = this;
        vm.subjectsMap = SubjectEnum.getEnumMap();

        DiagnosticSrv.getDiagnosticStatus().then(function (diagnosticStatus) {
            var isDiagnosticComplete = diagnosticStatus === ExerciseStatusEnum.COMPLETED.enum;
            vm.tutorialClick = function (tutorialId) {
                if (!isDiagnosticComplete) { return; }
                if (vm.tutorial.isAvail) {
                    $state.go('app.tutorial', {
                        exerciseId: tutorialId
                    });
                } else {
                    purchaseService.showPurchaseDialog();
                }
            };
        });

        vm.$onInit = function () {
            vm.ngModelCtrl.$render = function () {
                vm.activeSubject = vm.ngModelCtrl.$viewValue;
            };
        };
    }]
});

'use strict';
angular.module('znk.infra-web-app.tutorials').component('tutorialPane', {
    templateUrl: 'components/tutorials/components/tutorialPane/tutorialPane.template.html',
    require: {
        ngModelCtrl: '^ngModel'
    },
    controllerAs: 'vm',
    controller: ["$translatePartialLoader", "TutorialsSrv", "$q", "SubjectEnum", function ($translatePartialLoader, TutorialsSrv, $q, SubjectEnum) {
        var vm = this;
        $translatePartialLoader.addPart('tutorials');
        var subjectOrderProm = TutorialsSrv.getSubjectOrder();
        vm.subjectsMap = SubjectEnum.getEnumMap();
        
        vm.$onInit = function () {
            $q.all([
                subjectOrderProm
            ]).then(function (res) {
                vm.subjecstOrder = res[0];
                if (!vm.activeSubject) {
                    vm.activeSubject = vm.subjecstOrder[0];
                    vm.ngModelCtrl.$setViewValue(+vm.subjecstOrder[0]);
                }
            });

            vm.changeActiveSubject = function (subjectId) {
                vm.ngModelCtrl.$setViewValue(+subjectId);
                vm.activeSubject = vm.ngModelCtrl.$viewValue;
            };
        };
    }]
});

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.tutorials', {
                    url: '/tipsAndTricks',
                    templateUrl: 'components/tutorials/templates/tutorialsRoadmap.template.html',
                    controller: 'TutorialsRoadmapController',
                    controllerAs: 'vm',
                    resolve: {
                        tutorials: ["TutorialsSrv", function tutorials(TutorialsSrv) {
                            return TutorialsSrv.getAllTutorials().then(function (tutorialsArrs) {
                                return tutorialsArrs;
                            });
                        }]
                    }
                })
            .state('app.tutorial', {
                url: '/tipsAndTricks/tutorial/:exerciseId',
                templateUrl: 'components/tutorials/templates/tutorialWorkout.template.html',
                controller: 'TutorialWorkoutController',
                controllerAs: 'vm',
                resolve: {
                    exerciseData: ["TutorialsSrv", "$stateParams", "$state", "ExerciseTypeEnum", "ExerciseParentEnum", function (TutorialsSrv, $stateParams, $state, ExerciseTypeEnum, ExerciseParentEnum) {
                        var tutorialId = +$stateParams.exerciseId;
                        return TutorialsSrv.getTutorial(tutorialId).then(function () {
                            return {
                                exerciseId: tutorialId,
                                exerciseTypeId: ExerciseTypeEnum.TUTORIAL.enum,
                                exerciseParentTypeId: ExerciseParentEnum.TUTORIAL.enum,
                                exitAction: function () {
                                    $state.go('app.tutorials');
                                }
                            };
                        });
                    }]
                }
            });
        }
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').controller('TutorialWorkoutController',
        ["exerciseData", function(exerciseData) {
            'ngInject';
            this.completeExerciseDetails = {
            exerciseId: exerciseData.exerciseId,
            exerciseTypeId: exerciseData.exerciseTypeId,
            exerciseParentTypeId: exerciseData.exerciseParentTypeId
        };

        this.completeExerciseSettings = {
            exitAction: exerciseData.exitAction
        };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').controller('TutorialsRoadmapController',
        ["$translatePartialLoader", "tutorials", function ($translatePartialLoader, tutorials) {
            'ngInject';
            $translatePartialLoader.addPart('tutorials');
            var vm = this;
            vm.tutorials = tutorials;
        }]
    );
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.tutorials').service('TutorialsSrv',
        ["$log", "$injector", "$q", "StorageRevSrv", "ExerciseResultSrv", "ContentAvailSrv", "CategoryService", "ExerciseTypeEnum", "ExerciseStatusEnum", "SubjectsSrv", function ($log, $injector, $q, StorageRevSrv, ExerciseResultSrv, ContentAvailSrv, CategoryService, ExerciseTypeEnum, ExerciseStatusEnum, SubjectsSrv) {
            'ngInject';
        
            this.getSubjectOrder = function () {
                return SubjectsSrv.getSubjectOrder();
            };


            this.getTutorialHeaders = function () {
                return StorageRevSrv.getContent({
                    exerciseId: null,
                    exerciseType: 'tutorialheaders'
                });
            };


            this.getAllTutorials = function () {
                return this.getTutorialHeaders().then(function (tutorialHeaders) {
                    if (!tutorialHeaders) {
                        return $q.reject('No tutorial headers were found');
                    }

                    var allProm = [];

                    angular.forEach(tutorialHeaders, function (tutorialsForSubject) {
                        angular.forEach(tutorialsForSubject, function (tutorial, tutorialId) {
                            tutorialId = +tutorialId;
                            var getExerciseProm = ExerciseResultSrv.getExerciseStatus(ExerciseTypeEnum.TUTORIAL.enum, tutorialId)
                                .then(function (data) {
                                    tutorial.isComplete = data.status === ExerciseStatusEnum.COMPLETED.enum;
                                });
                            allProm.push(getExerciseProm);

                            var isTutorialAvailProm = ContentAvailSrv.isTutorialAvail(tutorialId).then(function (isAvail) {
                                tutorial.isAvail = isAvail;
                            });
                            allProm.push(isTutorialAvailProm);

                            var getParentCategoryProm = CategoryService.getParentCategory(tutorial.categoryId).then(function (generalCategory) {
                                if(generalCategory && generalCategory.name){
                                    tutorial.categoryName = generalCategory.name;
                                }
                            });
                            allProm.push(getParentCategoryProm);
                        });
                    });

                    return $q.all(allProm).then(function () {
                        return tutorialHeaders;
                    });
                });
            };

            this.getTutorial = function (tutorialId) {
                return StorageRevSrv.getContent({
                    exerciseId: tutorialId,
                    exerciseType: 'tutorial'
                });
            };

        }]
    );
})(angular);

angular.module('znk.infra-web-app.tutorials').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/tutorials/components/tutorialList/tutorialList.template.html",
    "<div class=\"tutorials-list-pane base-border-radius base-box-shadow\" translate-namespace=\"TUTORIAL_LIST_COMPONENTS\">\n" +
    "    <div class=\"diagnostic-overlay\" ng-if=\"!vm.isDiagnosticComplete\">\n" +
    "        <div class=\"overlay-text\" translate=\".DIAGNOSTIC_OVERLAY\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"tutorials-list-container\" ng-class=\"{blur: !vm.isDiagnosticComplete}\">\n" +
    "        <tutorial-list-item ng-model=\"vm.activeSubject\"\n" +
    "                            tutorial=\"tutorial\"\n" +
    "                            ng-repeat=\"tutorial in vm.tutorialsArrs[vm.activeSubject]\">\n" +
    "        </tutorial-list-item>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/tutorials/components/tutorialListItem/tutorialListItem.template.html",
    "<div class=\"tutorial-item\" ng-click=\"vm.tutorialClick(vm.tutorial.id)\" ng-class=\"[vm.subjectsMap[vm.activeSubject], {'locked': !vm.tutorial.isAvail, 'base-box-shadow': vm.tutorial.isAvail}, {'completed': vm.tutorial.isComplete}]\">\n" +
    "    <svg-icon name=\"locked-icon\" ng-if=\"!vm.tutorial.isAvail\"></svg-icon>\n" +
    "    <svg-icon name=\"tutorials-check-mark-icon\" ng-if=\"vm.tutorial.isComplete\"></svg-icon>\n" +
    "    <div class=\"tutorial-name\">{{vm.tutorial.name}}</div>\n" +
    "    <div class=\"tutorial-category-name\">{{vm.tutorial.categoryName}}</div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/tutorials/components/tutorialPane/tutorialPane.template.html",
    "<div class=\"tutorial-navigation-pane base-border-radius base-box-shadow\" translate-namespace=\"TUTORIAL_PANE_COMPONENTS\">\n" +
    "    <div class=\"pane-title\" translate=\".TITLE\"></div>\n" +
    "    <md-list class=\"subjects-list\" flex=\"grow\" layout=\"column\" layout-align=\"start center\">\n" +
    "        <md-list-item\n" +
    "            md-no-ink\n" +
    "            ng-class=\"[vm.subjectsMap[subject] ,{'active': vm.activeSubject === subject}]\"\n" +
    "            ng-click=\"vm.changeActiveSubject(subject)\"\n" +
    "            class=\"subject-item\"\n" +
    "            ng-repeat=\"subject in vm.subjecstOrder\">\n" +
    "            <svg-icon class=\"icon-wrapper\" ng-class=\"vm.subjectsMap[subject]\" name=\"{{vm.subjectsMap[subject] + '-' + 'icon'}}\"></svg-icon>\n" +
    "            <div class=\"subject-name\" translate=\"SUBJECTS.{{subject}}\"></div>\n" +
    "        </md-list-item>\n" +
    "    </md-list>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/tutorials/svg/subject-locked-icon.svg",
    "<svg\n" +
    "    class=\"subject-locked-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 127.4 180\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .subject-locked-svg {\n" +
    "            width: 100%;\n" +
    "            height: auto;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g>\n" +
    "		<path class=\"st0\" d=\"M57.4,0c4,0,8,0,12,0c1.3,0.4,2.5,0.8,3.8,1.1c20,4.5,34.7,15.3,40.5,35.6c2.1,7.5,2.1,15.8,2.4,23.7\n" +
    "			c0.4,9.1,0.1,18.2,0.1,27.3c4.1,0.5,7.7,1,11.2,1.4c0,30.3,0,60.7,0,91C85,180,42.6,180,0,180c0-30.9,0-61.1,0-91.6\n" +
    "			c3.7-0.2,7.1-0.4,10.7-0.6c0-12.2-0.2-23.8,0-35.5c0.4-21.6,10-37.7,29.7-46.9C45.8,2.9,51.8,1.8,57.4,0z M98.5,87.9\n" +
    "			c0-11.5,0-22.5,0-33.4c0-20.3-9.9-32.2-30-36.1C52,15.2,32.1,26.9,29.8,43c-2,14.7-1.4,29.8-1.9,44.9\n" +
    "			C51.9,87.9,74.9,87.9,98.5,87.9z M71.3,149.8c-0.6-4.1-1.2-7.7-1.6-11.4c-0.5-4-1.3-7.7,2.1-11.5c3.2-3.6,1.7-9.3-2.1-12.4\n" +
    "			c-3.5-2.9-8.9-2.9-12.4,0c-3.8,3.1-5.4,8.9-2.2,12.4c3.5,3.9,2.5,7.8,2,12c-0.4,3.6-1,7.1-1.5,10.9\n" +
    "			C60.9,149.8,65.9,149.8,71.3,149.8z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/tutorials/svg/tutorials-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"tutorials-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .tutorials-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
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
  $templateCache.put("components/tutorials/templates/tutorialWorkout.template.html",
    "<div class=\"complete-exercise-container base-border-radius\">\n" +
    "    <complete-exercise exercise-details=\"vm.completeExerciseDetails\"\n" +
    "                       settings=\"vm.completeExerciseSettings\">\n" +
    "    </complete-exercise>\n" +
    "</div>");
  $templateCache.put("components/tutorials/templates/tutorialsRoadmap.template.html",
    "<div class=\"tutorials-main-container\">\n" +
    "    <tutorial-pane ng-model=\"vm.activeSubject\"></tutorial-pane>\n" +
    "    <tutorial-list ng-model=\"vm.activeSubject\" tutorials=\"vm.tutorials\"></tutorial-list>\n" +
    "</div>\n" +
    "");
}]);
