(function (angular) {
    'use strict';
    
    angular.module('demo').service('ENV',
        function () {
            this.firebaseAppScopeName = "sat_app";
        }
    );
})(angular);
