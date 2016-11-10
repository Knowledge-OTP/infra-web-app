(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise', [
        'znk.infra.znkExercise',
        'znk.infra.analytics',
        'znk.infra.general',
        'pascalprecht.translate',
        'ngMaterial',
        'ngAnimate',
        'znk.infra.svgIcon'
    ]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').config(
        ["$provide", function ($provide) {
            'ngInject';

            $provide.decorator('questionBuilderDirective',
                ["$delegate", "ZnkExerciseUtilitySrv", function ($delegate, ZnkExerciseUtilitySrv) {
                    'ngInject';// jshint ignore:line

                    var directive = $delegate[0];

                    directive.link.pre = function(scope, element, attrs, ctrls){
                        var questionBuilderCtrl = ctrls[0];
                        var znkExerciseCtrl = ctrls[1];

                        var functionsToBind = ['getViewMode','addQuestionChangeResolver','removeQuestionChangeResolver', 'getCurrentIndex'];
                        ZnkExerciseUtilitySrv.bindFunctions(questionBuilderCtrl, znkExerciseCtrl,functionsToBind);

                        questionBuilderCtrl.bindExerciseEventManager = znkExerciseCtrl.bindExerciseEventManager;

                        element.append('<answer-explanation></answer-explanation>');
                    };

                    return $delegate;
                }]
            );
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'answer-explanation-lamp-icon': 'components/infraWebAppZnkExercise/svg/lamp-icon.svg',
                'answer-explanation-close': 'components/infraWebAppZnkExercise/svg/answer-explanation-close.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }])
        .directive('answerExplanation',
            ["ZnkExerciseViewModeEnum", "znkAnalyticsSrv", "$timeout", function (ZnkExerciseViewModeEnum, znkAnalyticsSrv, $timeout) {
                'ngInject';

                var directive = {
                    scope: {},
                    require: ['^questionBuilder', '^ngModel'],
                    templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html',
                    link: function link(scope, element, attrs, ctrls) {

                        var questionBuilderCtrl = ctrls[0];
                        var ngModelCtrl = ctrls[1];
                        var viewMode = questionBuilderCtrl.getViewMode();
                        var question = questionBuilderCtrl.question;

                        scope.d = {};

                        var init = (function () {
                            var wasInit;

                            return function () {
                                if (wasInit) {
                                    return;
                                }

                                // add timeout to prevent showing visible answer explanation for a
                                // second before it's hidden on slide that is not the current slide
                                // (because the slider shifts from first slide to current)
                                $timeout(function () {
                                    element.addClass('answer-explanation-visible');
                                }, 0, false);

                                var analyticsProps = {
                                    subjectType: question.subjectId,
                                    questionId: question.id
                                };

                                scope.$watch('d.showWrittenSln', function (isVisible) {
                                    if (isVisible || isVisible === false) {
                                        if (isVisible) {
                                            znkAnalyticsSrv.eventTrack({
                                                eventName: 'writtenSolutionClicked',
                                                props: analyticsProps
                                            });
                                            znkAnalyticsSrv.timeTrack({eventName: 'writtenSolutionClosed'});
                                        } else {
                                            znkAnalyticsSrv.eventTrack({
                                                eventName: 'writtenSolutionClosed',
                                                props: analyticsProps
                                            });
                                        }
                                    }
                                });

                                wasInit = true;
                            };
                        })();

                        function viewChangeListener() {
                            if (ngModelCtrl.$viewValue) {           // user already answered
                                init();
                            } else {
                                ngModelCtrl.$viewChangeListeners.push(function () {
                                    init();
                                });
                            }
                        }

                        switch (viewMode) {
                            case ZnkExerciseViewModeEnum.REVIEW.enum:
                                init();
                                break;
                            case ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum:
                                viewChangeListener();
                                break;
                        }

                        function _updateBindExercise() {
                            questionBuilderCtrl.bindExerciseEventManager.update('answerExplanation', { data: scope.d.toggleWrittenSln }, question.id);
                        }

                        scope.d.close = function () {
                            scope.d.toggleWrittenSln = false;
                            _updateBindExercise();
                        };

                        scope.d.toggleAnswer = function () {
                            scope.d.toggleWrittenSln = !scope.d.toggleWrittenSln;
                            _updateBindExercise();
                        };

                        questionBuilderCtrl.bindExerciseEventManager.registerCb('answerExplanation', function (newVal) {
                            scope.d.toggleWrittenSln = newVal.data;
                        }, question.id);
                    }
                };
                return directive;
            }]
        );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').directive('answerExplanationContent',
        ["ENV", "$sce", "znkAnalyticsSrv", function (ENV, $sce, znkAnalyticsSrv) {
            'ngInject';

            return {
                templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanationContent.template.html',
                require: '^questionBuilder',
                restrict: 'E',
                scope: {
                    onClose: '&'
                },
                link: function (scope, element, attrs, questionBuilderCtrl) {
                    var question = questionBuilderCtrl.question;
                    var isPlayFlag = false;
                    var analyticsProps = {
                        subjectType: question.subjectId,
                        questionId: question.id
                    };

                    scope.d = {};

                    var writtenSlnContent = questionBuilderCtrl.question.writtenSln &&
                        questionBuilderCtrl.question.writtenSln.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                    scope.d.writtenSlnContent = writtenSlnContent;

                    scope.d.videoSrc = $sce.trustAsResourceUrl(ENV.mediaEndPoint + ENV.firebaseAppScopeName + '/videos/questions' + '/' + question.id + '.mp4');

                    scope.d.quid = question.quid || question.id;

                    scope.d.onVideoEnded = function () {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'videoClosed',
                            props: analyticsProps
                        });
                    };

                    scope.d.onVideoPlay = function () {
                        if (!isPlayFlag) {
                            isPlayFlag = true;
                            znkAnalyticsSrv.eventTrack({
                                eventName: 'videoClicked',
                                props: analyticsProps
                            });
                            znkAnalyticsSrv.timeTrack({eventName: 'videoClosed'});
                        }
                    };

                    scope.d.close = function () {
                        scope.onClose();
                    };
                }
            };
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.infraWebAppZnkExercise').directive('znkExerciseHeader',
        ["$timeout", "SubjectEnum", function($timeout, SubjectEnum){
        'ngInject';

        return {
            scope: {
                options: '=?',
                onClickedQuit: '&?',
                timerData: '=?',
                subjectId: '=',
                categoryId: '&',
                sideText: '=',
                totalSlideNum: '@',
                exerciseNum: '@',
                iconName: '@',
                iconClickHandler: '&',
                showNoCalcIcon: '&',
                showNoCalcTooltip: '&'
            },
            restrict: 'E',
            require: '?ngModel',
            templateUrl: 'components/infraWebAppZnkExercise/directives/znkExerciseHeader/exerciseHeader.template.html',
            controller: function () {
                // required: subjectId
                if (angular.isUndefined(this.subjectId)) {
                    throw new Error('Error: exerciseHeaderController: subjectId is required!');
                }
                this.subjectId = +this.subjectId;
                this.categoryId = this.categoryId();
                var categoryId = angular.isDefined(this.categoryId) ? this.categoryId : this.subjectId;
                this.subjectName = SubjectEnum.getValByEnum(categoryId);
            },
            bindToController: true,
            controllerAs: 'vm',
            link: function (scope, element, attrs, ngModel) {
                if (ngModel) {
                    ngModel.$render = function () {
                        scope.vm.currentSlideNum = ngModel.$viewValue;
                    };
                }

                if (scope.vm.showNoCalcIcon()) {
                    $timeout(function () {    // timeout fixing md-tooltip visibility issues
                        scope.vm.showToolTip = scope.vm.showNoCalcTooltip();
                    });
                }
            }
        };
    }]);
})(angular);

angular.module('znk.infra-web-app.infraWebAppZnkExercise').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html",
    "<div class=\"answer-explanation-wrapper\" translate-namespace=\"ANSWER_EXPLANATION\">\n" +
    "    <div class=\"answer-explanation-content-wrapper\"\n" +
    "         ng-if=\"d.toggleWrittenSln\">\n" +
    "        <answer-explanation-content class=\"znk-scrollbar\"\n" +
    "                                    on-close=\"d.close()\">\n" +
    "        </answer-explanation-content>\n" +
    "    </div>\n" +
    "    <div class=\"answer-explanation-header\" ng-click=\"d.toggleAnswer()\">\n" +
    "        <div class=\"answer-explanation-btn\">\n" +
    "            <div class=\"main-content-wrapper\">\n" +
    "                <svg-icon class=\"lamp-icon\" name=\"answer-explanation-lamp-icon\"></svg-icon>\n" +
    "                <span class=\"text\" translate=\".ANSWER_EXPLANATION\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"right-corner corner\"></div>\n" +
    "            <div class=\"left-corner corner\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanationContent.template.html",
    "<div class=\"title\">\n" +
    "    <div translate=\"ANSWER_EXPLANATION.TITLE\"></div>\n" +
    "    <div class=\"answer-explanation-close\">\n" +
    "        <svg-icon name=\"answer-explanation-close\"\n" +
    "                  ng-click=\"d.close()\">\n" +
    "        </svg-icon>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"flex-wrap\">\n" +
    "    <div class=\"video-wrap\">\n" +
    "        <video controls\n" +
    "               video-ctrl-drv\n" +
    "               on-play=\"d.onVideoPlay()\"\n" +
    "               on-ended=\"d.onVideoEnded()\"\n" +
    "               video-error-poster=\"assets/images/raccoon/video-is-not-available-img.png\">\n" +
    "            <source ng-src=\"{{::d.videoSrc}}\" type=\"video/mp4\">\n" +
    "        </video>\n" +
    "        <div class=\"question-quid-text\">{{::d.quid}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"written-solution-wrapper\"\n" +
    "         ng-bind-html=\"d.writtenSlnContent\">\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/directives/znkExerciseHeader/exerciseHeader.template.html",
    "<div class=\"exercise-header subject-repeat\" subject-id-to-attr-drv=\"vm.subjectId\"\n" +
    "     context-attr=\"class\" suffix=\"bg\" translate-namespace=\"CONTAINER_HEADER\">\n" +
    "   <div class=\"pattern\" subject-id-to-attr-drv=\"vm.subjectId\" context-attr=\"class\" prefix=\"subject-background\"></div>\n" +
    "\n" +
    "    <div class=\"left-area\">\n" +
    "        <div class=\"side-text\">\n" +
    "            {{vm.sideText | cutString: 40}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"center-num-slide\"\n" +
    "         ng-if=\"vm.options.showNumSlide\">\n" +
    "        {{vm.currentSlideNum}}/{{::vm.totalSlideNum}}\n" +
    "    </div>\n" +
    "    <div class=\"review-mode\" ng-if=\"vm.options.reviewMode\" ui-sref=\"^.summary\">\n" +
    "        <div class=\"background-opacity\"></div>\n" +
    "        <div class=\"summary-text\" translate=\".SUMMARY\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"right-area\">\n" +
    "        <svg-icon class=\"header-icon\" ng-if=\"vm.iconName\" name=\"{{vm.iconName}}\" ng-click=\"vm.iconClickHandler(); vm.showToolTip = false\"></svg-icon>\n" +
    "\n" +
    "        <div class=\"date-box\" ng-if=\"vm.options.showDate\">\n" +
    "            <timer type=\"1\" ng-model=\"vm.timerData.timeLeft\" play=\"true\" config=\"vm.timerData.config\"></timer>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"quit-back-button\" translate=\".QUIT_BTN_TEXT\" ng-if=\"vm.options.showQuit\" ng-click=\"vm.onClickedQuit()\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/svg/answer-explanation-close.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "     class=\"answer-explanation-close\">\n" +
    "    <style>\n" +
    "        svg.answer-explanation-close {\n" +
    "            width: 14px;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-close line {\n" +
    "            stroke: #161616;\n" +
    "            fill: none;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/svg/lamp-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 51.7 54.3\"\n" +
    "     class=\"answer-explanation-lamp-icon-svg\">\n" +
    "    <style>\n" +
    "        svg.answer-explanation-lamp-icon-svg{\n" +
    "            width: 18px;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-lamp-icon-svg path{\n" +
    "            stroke: white;\n" +
    "            fill: white;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-lamp-icon-svg path.st0{\n" +
    "            fill: transparent;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M19.6,44.7c-0.9-0.1-2.1-0.1-2.1-1.3c0.1-4.5-2.5-8.1-3.9-12.1c-2.5-6.8,0.5-14.5,6.7-17.4\n" +
    "		c5-2.3,9.7-1.7,13.8,1.9c4.5,3.9,5.8,9.1,4.1,14.7c-0.9,3-2.4,5.9-3.4,8.8c-0.4,1-0.5,2.2-0.5,3.3c0,1.5-0.7,2.2-2.2,2.2\n" +
    "		C27.7,44.7,24.1,44.7,19.6,44.7z\"/>\n" +
    "        <path class=\"st1\" d=\"M44.5,44.9c-0.4,1.3-1.4,1.2-2.1,0.5c-1.5-1.4-2.9-2.9-4.3-4.3c-0.4-0.4-0.6-0.9-0.2-1.5\n" +
    "		c0.4-0.5,0.9-0.8,1.4-0.4c1.8,1.6,3.6,3.2,5,5.1C44.5,44.4,44.5,44.7,44.5,44.9z\"/>\n" +
    "        <path class=\"st2\" d=\"M8,7.8c1,0,5.9,4.7,5.9,5.5c0,0.5-0.3,0.8-0.7,1.1c-0.5,0.4-0.9,0.1-1.2-0.2c-1.5-1.5-3.1-3-4.6-4.5\n" +
    "		C7.1,9.3,7,8.8,7.3,8.2C7.5,8,7.9,7.9,8,7.8z\"/>\n" +
    "        <path class=\"st3\"\n" +
    "              d=\"M43.6,8c1.1,0.1,1.3,1.1,0.7,1.7c-1.4,1.7-3,3.3-4.7,4.7c-0.8,0.7-1.6,0.3-1.9-0.7C37.5,13,42.5,8,43.6,8z\"/>\n" +
    "        <path class=\"st4\" d=\"M12.7,38.9c0.5,0,0.9,0.2,1.1,0.7c0.3,0.5,0,0.9-0.3,1.2c-1.5,1.5-3,3-4.5,4.5c-0.4,0.4-0.8,0.4-1.3,0.2\n" +
    "		c-0.5-0.2-0.6-0.7-0.6-1.1C7.2,43.6,11.9,38.9,12.7,38.9z\"/>\n" +
    "        <path class=\"st5\" d=\"M4.5,27.2c-1,0-2.1,0-3.1,0c-0.7,0-1.4-0.1-1.4-1c0-1,0.6-1.3,1.4-1.3c2,0,3.9,0,5.9,0c0.8,0,1.2,0.5,1.3,1.2\n" +
    "		c0,0.8-0.5,1.1-1.3,1.1C6.4,27.2,5.4,27.2,4.5,27.2z\"/>\n" +
    "        <path class=\"st6\" d=\"M47.1,27.2c-0.8,0-1.7,0-2.5,0c-0.8,0-1.6-0.1-1.5-1.2c0-0.7,0.5-1.2,1.3-1.1c2,0,3.9,0,5.9,0\n" +
    "		c0.9,0,1.5,0.4,1.4,1.4c-0.1,0.9-0.8,0.9-1.5,0.9C49.2,27.2,48.1,27.2,47.1,27.2z\"/>\n" +
    "        <path class=\"st7\" d=\"M26.9,4.2c0,1,0,2,0,3.1c0,0.7-0.3,1.3-1.1,1.3c-0.8,0-1.1-0.6-1.1-1.3c0-1.9,0-3.9,0-5.8c0-0.7,0.2-1.3,1-1.4\n" +
    "		c1-0.1,1.3,0.6,1.2,1.4C26.9,2.4,27,3.3,26.9,4.2z\"/>\n" +
    "        <path class=\"st8\" d=\"M17.4,26.3c0-3.2,1.2-5.3,2.9-7.2c0.6-0.6,1.2-1.3,2.1-0.6c1,0.8,0.3,1.4-0.3,2.1c-3.1,3.4-2.9,7-0.9,10.8\n" +
    "		c0.5,0.9,1.5,2.1,0,2.8c-1.3,0.6-1.6-0.9-2.1-1.7C18,30.4,17.2,28.2,17.4,26.3z\"/>\n" +
    "        <path class=\"st9\" d=\"M32,48.8H19.3c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1H32c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C33.1,48.3,32.6,48.8,32,48.8z\"/>\n" +
    "        <path class=\"st9\" d=\"M31,51.6H20.6c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1H31c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C32.1,51.1,31.6,51.6,31,51.6z\"/>\n" +
    "        <path class=\"st9\" d=\"M27.3,54.3H24c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1h3.2c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C28.4,53.8,27.9,54.3,27.3,54.3z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);
