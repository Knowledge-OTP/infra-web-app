angular.module('znk.infra-web-app.loadingAnimation', []);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loadingAnimation').service('LoadingSrv',
        ["$document", "$rootScope", "$compile", function ($document, $rootScope, $compile) {
        'ngInject';

            var childScope = $rootScope.$new(true);

            function _appendLoadingElementToBody() {
                var bodyElement = angular.element($document[0].body);
                var loadingElementTemplate = '' +
                    '<md-progress-linear class="loading-container" ' +
                    'md-mode="indeterminate" ' +
                    'ng-if="showLoading">' +
                    '</md-progress-linear>';
                var loadingProgressElement = angular.element(loadingElementTemplate);
                bodyElement.append(loadingProgressElement);
                $compile(loadingProgressElement)(childScope);
            }

            _appendLoadingElementToBody();

            var numOfShowLoadingRequests = 0;
            this.showLoading = function () {
                numOfShowLoadingRequests++;
                childScope.showLoading = true;
            };

            this.hideLoading = function (force) {
                numOfShowLoadingRequests--;

                if (force) {
                    numOfShowLoadingRequests = 0;
                }

                if (numOfShowLoadingRequests === 0) {
                    childScope.showLoading = false;
                }
            };
        }]
    );
})(angular);


angular.module('znk.infra-web-app.loadingAnimation').run(['$templateCache', function($templateCache) {

}]);
