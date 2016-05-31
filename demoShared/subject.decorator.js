(function (angular) {
    'use strict';

    angular.module('demo').decorator('SubjectEnum',function($delegate){
        var relevantSubjects = ['MATH', 'VERBAL', 'ESSAY'];
        angular.forEach($delegate, function (value, key) {
            if (relevantSubjects.indexOf(key) === -1) {
                delete $delegate[key];
            }
        });
        return $delegate;
    });
})(angular);
