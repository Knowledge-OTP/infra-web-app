(function(){
    'use strict';

    angular.module('znk.infra-web-app.completeExercise',[
        'ngAnimate',
        'pascalprecht.translate',
        'ngMaterial',
        'znk.infra.exerciseUtility',
        'znk.infra.contentGetters',
        'znk.infra.userContext',
        'znk.infra.user',
        'znk.infra.znkModule',
        'znk.infra.general',
        'znk.infra.filters',
        'znk.infra.znkExercise',
        'znk.infra.stats',
        'znk.infra.popUp',
        'znk.infra.screenSharing',
        'znk.infra.eventManager',
        'znk.infra.stats',
        'znk.infra.estimatedScore'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'completeExercise-book-icon': 'components/completeExercise/assets/svg/book-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})();
