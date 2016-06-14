/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExercise').config(
        function ($provide) {
            'ngInject';

            $provide.decorator('questionBuilderDirective',
                function ($delegate, ZnkExerciseUtilitySrv) {
                    'ngInject';

                    var directive = $delegate[0];

                    directive.link.pre = function(scope, element, attrs, ctrls){
                        var questionBuilderCtrl = ctrls[0];
                        var znkExerciseCtrl = ctrls[1];

                        var functionsToBind = ['getViewMode','addQuestionChangeResolver','removeQuestionChangeResolver', 'getCurrentIndex'];
                        ZnkExerciseUtilitySrv.bindFunctions(questionBuilderCtrl, znkExerciseCtrl,functionsToBind);

                        element
                    };

                    return $delegate;
                }
            );
        }
    );
})(angular);

