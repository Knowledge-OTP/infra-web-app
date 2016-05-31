/**
 * karly@zinkerz.com
 * usage instructions:
 *      1) workout progress:
 *          - define <%= subjectName %>-bg class for all subjects(background color and  for workouts-progress item) for example
 *              .reading-bg{
 *                  background: red;
 *              }
 *          - define <%= subjectName %>-bg:after style for border color for example
 *              workouts-progress .items-container .item-container .item.selected.reading-bg:after {
 *                   border-color: red;
 *              }
 *
 *      2) WorkoutsRoadmapSrv:
 *          setNewWorkoutGeneratorGetter: provide a function which return a new workout generator function. subjectsToIgnore
 *              will be passed as parameter.
 *              i.e:
 *                  function(WorkoutPersonalization){
 *                      'ngInject';
 *
 *                      return function(subjectToIgnore){
 *                          return WorkoutPersonalizationService.getExercisesByTimeForNewWorkout(subjectToIgnoreForNextDaily);
 *                      }
 *                  }
 *              the return value should be a map of exrcise time to exercise meta data i.e:
 *              {
 *                 "5" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 150,
 *                   "exerciseTypeId" : 1,
 *                   "subjectId" : 0
 *                 },
 *                 "10" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 109,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 },
 *                 "15" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 221,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 }
 *               }
 *
 *
 *      3) workoutsRoadmap.diagnostic.summary
 *          this state must set i.e
 *              $stateProvider.state('workoutsRoadmap.diagnostic.summary', {
 *                   template: '<div>Diagnostic </div>',
 *                   controller: 'WorkoutsRoadMapBaseSummaryController',
 *                   controllerAs: 'vm'
 *               })
 *      3) workoutsRoadmap.workout.inProgress
 *          this state must set i.e
 *              $stateProvider.state('workoutsRoadmap.workout.inProgress', {
 *                  template: '<div>Workout in progress</div>',
 *                  controller: function(){}
 *             })
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
        'znk.infra.general',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.diagnostic'
    ]);
})(angular);
