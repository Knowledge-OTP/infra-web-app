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
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra.scroll',
        'znk.infra.general'
    ]);
})(angular);
