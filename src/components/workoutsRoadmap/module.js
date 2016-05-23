/**
 * usage instructions:
 *      workout progress:
 *      - define <%= subjectName %>-bg class for all subjects(background color and  for workouts-progress item) for example
 *              .reading-bg{ 
 *                  background: red;
 *              }
 *      - define <%= subjectName %>-bg:after style for border color for example
 *              workouts-progress .items-container .item-container .item.selected.reading-bg:after {
                    border-color: red;
                }
 *
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'ui.router',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'ngAnimate',
        'znk.infra.scroll',
        'znk.infra.general'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);
