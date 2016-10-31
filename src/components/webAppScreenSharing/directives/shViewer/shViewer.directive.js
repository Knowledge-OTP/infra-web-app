/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing').component('shViewer', {
        templateUrl: 'components/webAppScreenSharing/directives/shViewer/shViewerDirective.template.html',
        controller: function (CompleteExerciseSrv, ENV, ScreenSharingSrv) {
            'ngInject';

            var $ctrl= this;

            function _shDataChangeHandler(newShData){
                $ctrl.activeScreen = newShData.activeExercise && newShData.activeExercise.activeScreen;
            }

            function _registerToShDataChanges(){
                ScreenSharingSrv.registerToActiveScreenSharingDataChanges(_shDataChangeHandler);
            }

            function _unregisterFromShDataChanges(){
                ScreenSharingSrv.unregisterFromActiveScreenSharingDataChanges(_shDataChangeHandler);
            }

            this.$onInit = function(){
                _registerToShDataChanges();
                this.appContext = ENV.appContext.toUpperCase();

                this.ceSettings = {
                    mode: CompleteExerciseSrv.MODE_STATES.VIEWER
                };
            };

            this.$onDestroy = function(){
                _unregisterFromShDataChanges();
            };

        }
    });
})(angular);

