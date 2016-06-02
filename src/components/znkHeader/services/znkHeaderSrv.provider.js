/**
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
 *                                    objects) with the properties: text and onClickHandler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').provider('znkHeaderSrv',

        function () {
            var additionalHeaderItems = [];

            this.addAdditionalItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalHeaderItems.push(additionalItems);
                } else {
                    additionalHeaderItems = additionalItems;
                }
            };

            this.$get = ['$state', function ($state) {
                var navItemsArray = [];

                function addDefaultNavItem(_text, _onClickHandler){
                    var navItem = {
                        text: _text,
                        onClickHandler: _onClickHandler
                    };
                    navItemsArray.push(navItem);
                }

                function _onClickHandler(stateAsString, stateParams, options){
                    if(angular.isDefined(stateParams) || angular.isDefined(options)){
                        $state.go(stateAsString, stateParams, options);
                    }
                    else {
                        $state.go(stateAsString);
                    }
                }

                addDefaultNavItem('ZNK_HEADER.WORKOUTS', _onClickHandler.bind(null, 'app.workouts.roadmap', {}, {reload:true}));
                addDefaultNavItem('ZNK_HEADER.TESTS', _onClickHandler.bind(null, 'app.tests.roadmap'));
                addDefaultNavItem('ZNK_HEADER.TUTORIALS', _onClickHandler.bind(null, 'app.tutorials.roadmap'));
                addDefaultNavItem('ZNK_HEADER.PERFORMANCE', _onClickHandler.bind(null, 'app.performance'));

                return {
                    getAdditionalItems: function () {
                        return navItemsArray.concat(additionalHeaderItems);  // return array of default nav items with additional nav items
                    }
                };
            }];

        }
    );
})(angular);

