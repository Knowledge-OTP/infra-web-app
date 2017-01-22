
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTooltip')
        .directive('znkTooltip',
            function () {
                'ngInject';
                return {
                link: function(scope, element) {
                    console.log('scope: ', scope);
                    console.log('element: ', element);

                    var divElm = document.createElement('div');
                    divElm.classList.add('arrow');

                    element.appendChild(divElm);
                }
            };
        });
})(angular);
