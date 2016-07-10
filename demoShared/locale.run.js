(function (angular) {
    angular.module('demo').run(function ($translatePartialLoader, $timeout) {
        $timeout(function(){
            $translatePartialLoader.addPart('demoLocale');
        });
    });
})(angular);
