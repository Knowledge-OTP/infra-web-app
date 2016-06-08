(function (angular) {
    angular.module('demo').run(function ($translatePartialLoader) {
        $translatePartialLoader.addPart('demoLocale');
    });
})(angular);
