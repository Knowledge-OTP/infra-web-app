(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.purchase'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'evaluator-star': 'components/evaluator/svg/star.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

/**
 * evaluateQuestionResult
 *   questionResultGetter - get question result
 *   exerciseTypeGetter - exercise type
 *   evaluatorDataGetter - evaluator data (optional)
 *   like: {
 *        questionResultGetter: {
 *           index: 1,
 *           userAnswer: 'text'
 *        },
 *        evaluatorDataGetter: {
 *           score: 2.5
 *        },
 *        exerciseTypeGetter: 2
 *   }
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').component('evaluateQuestionResult', {
            bindings: {
                questionResultGetter: '&questionResult',
                exerciseTypeGetter: '&exerciseType',
                evaluatorDataGetter: '&?evaluatorData'
            },
            templateUrl: 'components/evaluator/templates/evaluateQuestionResult.template.html',
            controllerAs: 'vm',
            controller: ["$translatePartialLoader", "ZnkEvaluateResultSrv", function ($translatePartialLoader, ZnkEvaluateResultSrv) {
                'ngInject';

                $translatePartialLoader.addPart('evaluator');

                var vm = this;

                var questionResult = vm.questionResultGetter();
                var exerciseType = vm.exerciseTypeGetter();
                var evaluatorData = vm.evaluatorDataGetter ? vm.evaluatorDataGetter() : {};

                var evaluateQuestionResultStates = {
                    completed: 1,
                    skipped: 2,
                    evaluated: 3
                };

                vm.evaluateQuestionResultStates = evaluateQuestionResultStates;
                vm.index = questionResult.index;

                vm.type = exerciseType;

                ZnkEvaluateResultSrv.getEvaluateTypes().then(function (types) {
                    vm.aliasName = types[exerciseType].aliasName;
                });

                // set state of component
                if (evaluatorData.score) {
                    vm.activeState = evaluateQuestionResultStates.evaluated;
                    vm.points = evaluatorData.score;
                } else if (questionResult.userAnswer && questionResult.userAnswer !== true) {
                    vm.activeState = evaluateQuestionResultStates.completed;
                } else {
                    vm.activeState = evaluateQuestionResultStates.skipped;
                }
            }]
        }
    );
})(angular);

/**
 * evaluateQuestionReviewStates
 *  ng-model: gets an object with activeState:Number(from EvaluatorStatesEnum)
 *  and for evaluated state add points and type props for evaluate-result drv like:
 *  {
        activeState: EvaluatorStatesEnum.EVALUATED.enum,
        points: 2.5,
        type: 2
    }
 */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').component('evaluateQuestionReviewStates', {
            require: {
                parent: '?^ngModel'
            },
            templateUrl: 'components/evaluator/templates/evaluateQuestionReviewStates.template.html',
            controllerAs: 'vm',
            controller: ["$translatePartialLoader", "ZnkEvaluateResultSrv", function ($translatePartialLoader, ZnkEvaluateResultSrv) {
                var vm = this;

                $translatePartialLoader.addPart('evaluator');

                vm.$onInit = function() {
                    var ngModelCtrl = vm.parent;

                    if (ngModelCtrl) {

                        ngModelCtrl.$render = function() {
                            vm.stateData = ngModelCtrl.$modelValue;
                        };

                        ZnkEvaluateResultSrv.getEvaluateTypes().then(function (types) {
                             vm.evaluateTypes = types;
                        });
                    }
                };

            }]
        }
    );
})(angular);

/**
 * evaluateResult
 *   pointsGetter - get user current points
 *   typeGetter - can be a subjectId or other type of id
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').component('evaluateResult', {
            bindings: {
                pointsGetter: '&points',
                typeGetter: '&type' // can be a subjectId or other type of id
            },
            templateUrl: 'components/evaluator/templates/evaluateResult.template.html',
            controllerAs: 'vm',
            controller: ["$translatePartialLoader", "ZnkEvaluateResultSrv", function ($translatePartialLoader, ZnkEvaluateResultSrv) {
                'ngInject';

                var vm = this;

                $translatePartialLoader.addPart('evaluator');

                var starStatusMap = {
                    empty: 1,
                    half: 2,
                    full: 3
                };

                var points = vm.points = vm.pointsGetter();

                var type =  vm.typeGetter();

                vm.starStatusMap = starStatusMap;

                vm.stars = [];

                function _getStarStatus(curPoints, prevPoints) {
                    var starStatus = starStatusMap.empty;
                    if (points >= curPoints) {
                        starStatus = starStatusMap.full;
                    } else if(
                        curPoints > points &&
                        points > prevPoints) {
                        starStatus = starStatusMap.half;
                    }
                    return starStatus;
                }

                function addStars(evaluateResultByType) {
                    var starsNum = evaluateResultByType.starsNum;
                    var pointsPerStar = evaluateResultByType.pointsPerStar;
                    var curPoints = 0;
                    for (var i = 0, ii = starsNum; i < ii; i++) {
                        curPoints += pointsPerStar;
                        var starStatus = {
                            status: _getStarStatus(curPoints, curPoints - pointsPerStar)
                        };
                        vm.stars.push(starStatus);
                    }
                }

                function addEvaluateText(evaluateResultByType) {
                    var evaluatePointsArr = evaluateResultByType.evaluatePointsArr;
                    var curEvaluatePoint;
                    for (var i = 0, ii = evaluatePointsArr.length; i < ii; i++) {
                        curEvaluatePoint = evaluatePointsArr[i];
                        if (curEvaluatePoint.maxPoints >= points) {
                            vm.evaluateText = curEvaluatePoint.evaluateText;
                            break;
                        }
                    }
                }

                function addStarsAndText(evaluateResultType) {
                    var evaluateResultByType = evaluateResultType[type];
                    addStars(evaluateResultByType);
                    addEvaluateText(evaluateResultByType);
                }

                ZnkEvaluateResultSrv.getEvaluateResultByType().then(function(evaluateResultType) {
                    addStarsAndText(evaluateResultType);
                });
            }]
        }
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').service('EvaluatorStatesEnum', ['EnumSrv',
        function(EnumSrv) {

            var EvaluatorStatesEnum = new EnumSrv.BaseEnum([
                ['NOT_PURCHASE', 1, 'not purchase'],
                ['PENDING', 2, 'pending'],
                ['EVALUATED', 3, 'evaluated']
            ]);

            return EvaluatorStatesEnum;
        }]);
})(angular);

/**
 * EvaluateSrv
 *
 *  setEvaluateResultByType: get an fn function that returns object of types(like subjects) with configuration
 *  like:  {
 *           0: {
                starsNum: 4, // number of stars to display
                pointsPerStar: 1, // points that should calc per star,
                evaluatePointsArr: [ // array of evaluate statuses and each max points
                    {
                        evaluateText: "WEAK",
                        maxPoints: 1
                    },
                    {
                        evaluateText: "LIMITED",
                        maxPoints: 2
                    },
                    {
                        evaluateText: "FAIR",
                        maxPoints: 3
                    },
                    {
                        evaluateText: "GOOD",
                        maxPoints: 4
                    }
                ]
            }
            1: {
               ...
            }
         }
 *
 * setEvaluateTypes: get types meta data like aliasName
 * like: 0: {
 *       aliasName: 'speaking', for class name and etc
 *   },
 *   1: {
 *     ...
 *   }
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').provider('ZnkEvaluateResultSrv',
        function() {

        var _evaluateResultByType;
        var _evaluateTypes;

        this.setEvaluateResultByType = function(evaluateResultByType) {
            _evaluateResultByType = evaluateResultByType;
        };

        this.setEvaluateTypes = function(evaluateTypes) {
            _evaluateTypes = evaluateTypes;
        };

        this.$get = ["$q", "$injector", "$log", function($q, $injector, $log) {
            'ngInject';

            var evaluateSrvApi = {};

            function invokeEvaluateFn(evaluateFn, evaluateFnName) {
                if(!evaluateFn) {
                    var errMsg = 'ZnkEvaluateResultSrv: '+ evaluateFnName +' was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return $q.when($injector.invoke(evaluateFn));
            }

            evaluateSrvApi.getEvaluateResultByType = invokeEvaluateFn.bind(null, _evaluateResultByType, 'evaluateResultByType');

            evaluateSrvApi.getEvaluateTypes = invokeEvaluateFn.bind(null, _evaluateTypes, 'evaluateTypes');

            return evaluateSrvApi;

        }];
    });
})(angular);

angular.module('znk.infra-web-app.evaluator').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/evaluator/svg/star.svg",
    "<svg xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-328 58.7 133.4 127.3\"\n" +
    "     xml:space=\"preserve\"\n" +
    "     class=\"evaluate-star-svg\">\n" +
    ">\n" +
    "<style type=\"text/css\">\n" +
    "	.evaluate-star-svg .st0{fill:#231F20;}\n" +
    "</style>\n" +
    "<path class=\"firstPath st0\" d=\"M-261.3,58.7c-1.3,0-2.6,0.7-3.3,2l-17.8,36.1c-0.5,1.1-1.5,1.8-2.7,2l-39.8,5.8c-3,0.4-4.2,4.1-2,6.2l28.8,28\n" +
    "	c0.8,0.8,1.2,2,1,3.2l-6.8,39.6c-0.5,2.9,2.6,5.2,5.3,3.8l35.6-18.7c0.5-0.3,1.1-0.5,1.7-0.5V58.7z\"/>\n" +
    "<path class=\"secondPath st0\" d=\"M-261.3,58.7c1.3,0,2.6,0.7,3.3,2l17.8,36.1c0.5,1.1,1.5,1.8,2.7,2l39.8,5.8c3,0.4,4.2,4.1,2,6.2l-28.8,28\n" +
    "	c-0.8,0.8-1.2,2-1,3.2l6.8,39.6c0.5,2.9-2.6,5.2-5.3,3.8l-35.6-18.7c-0.5-0.3-1.1-0.5-1.7-0.5V58.7z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/evaluator/templates/evaluateQuestionResult.template.html",
    "<div class=\"evaluate-question-result-wrapper\"\n" +
    "     ng-class=\"{\n" +
    "         'completed': vm.evaluateQuestionResultStates.completed === vm.activeState,\n" +
    "         'skipped': vm.evaluateQuestionResultStates.skipped === vm.activeState,\n" +
    "         'evaluated': vm.evaluateQuestionResultStates.evaluated === vm.activeState\n" +
    "     }\"\n" +
    "     translate-namespace=\"EVALUATE_QUESTION_RESULT_DRV\">\n" +
    "    <div class=\"question-index\"\n" +
    "         ng-class=\"vm.aliasName\">\n" +
    "        {{::vm.index}}\n" +
    "    </div>\n" +
    "     <div class=\"evaluate-question-result-states-switch\"\n" +
    "          ng-switch=\"vm.activeState\">\n" +
    "          <div class=\"evaluate-question-result-text\"\n" +
    "               ng-switch-when=\"1\">\n" +
    "              <div class=\"completed\"\n" +
    "                   translate=\".COMPLETED\">\n" +
    "              </div>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-question-result-text\"\n" +
    "              ng-switch-when=\"2\">\n" +
    "              <div class=\"skipped\"\n" +
    "                   translate=\".SKIPPED\">\n" +
    "              </div>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-question-result-evaluated\"\n" +
    "              ng-switch-when=\"3\">\n" +
    "              <evaluate-result\n" +
    "                  points=\"vm.points\"\n" +
    "                  type=\"vm.type\">\n" +
    "              </evaluate-result>\n" +
    "          </div>\n" +
    "     </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/evaluator/templates/evaluateQuestionReviewStates.template.html",
    "<div class=\"evaluate-review-states-wrapper\"\n" +
    "     ng-class=\"vm.evaluateTypes[vm.stateData.type].aliasName\"\n" +
    "     translate-namespace=\"EVALUATE_REVIEW_STATES_DRV\">\n" +
    "     <div class=\"evaluate-review-states-switch\"\n" +
    "          ng-switch=\"vm.stateData.activeState\">\n" +
    "          <div class=\"evaluate-review-not-purchase\"\n" +
    "               ng-switch-when=\"1\">\n" +
    "              <div class=\"upgrade-text\"\n" +
    "                   translate=\".UPGRADE_TEXT_{{vm.evaluateTypes[vm.stateData.type].aliasName | uppercase}}\">\n" +
    "              </div>\n" +
    "              <button class=\"upgrade-btn\"\n" +
    "                      open-purchase-dialog-on-click\n" +
    "                      translate=\".UPGRADE_BTN\">\n" +
    "              </button>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-review-pending\"\n" +
    "              ng-switch-when=\"2\">\n" +
    "              <div class=\"pending-title\"\n" +
    "                   translate=\".PENDING_TITLE\">\n" +
    "              </div>\n" +
    "              <div class=\"pending-desc\"\n" +
    "                   translate=\".PENDING_DESC\">\n" +
    "              </div>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-review-evaluated\"\n" +
    "              ng-switch-when=\"3\">\n" +
    "              <div class=\"evaluated-answer-title\"\n" +
    "                   translate=\".EVALUATED_ANSWER_TITLE\">\n" +
    "              </div>\n" +
    "              <evaluate-result\n" +
    "                  points=\"vm.stateData.points\"\n" +
    "                  type=\"vm.stateData.type\">\n" +
    "              </evaluate-result>\n" +
    "          </div>\n" +
    "     </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/evaluator/templates/evaluateResult.template.html",
    "<div class=\"evaluate-result-wrapper\"\n" +
    "     translate-namespace=\"EVALUATE_RESULT_DRV\">\n" +
    "    <div class=\"evaluate-status-wrapper\">\n" +
    "        <div class=\"evaluate-text\"\n" +
    "             translate=\".{{vm.evaluateText}}\">\n" +
    "        </div>\n" +
    "        <div\n" +
    "            class=\"evaluate-points\"\n" +
    "            translate=\".POINTS\"\n" +
    "            translate-values=\"{ pts: '{{vm.points}}' }\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"evaluate-stars-wrapper\">\n" +
    "        <svg-icon\n" +
    "            ng-repeat=\"star in vm.stars\"\n" +
    "            ng-class=\"{\n" +
    "              'starEmpty': star.status === vm.starStatusMap.empty,\n" +
    "              'starHalf': star.status === vm.starStatusMap.half,\n" +
    "              'starFull': star.status === vm.starStatusMap.full\n" +
    "            }\"\n" +
    "            name=\"evaluator-star\">\n" +
    "        </svg-icon>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
