(function (angular) {
    'use strict';

    angular.module('demo').service('ENV',
        function () {
            this.firebaseAppScopeName = "sat_app";
            this.mediaEndPoint = "//dfz02hjbsqn5e.cloudfront.net/";
        }
    );
})(angular);
