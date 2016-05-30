(function (angular) {
    'use strict';

    angular.module('demo').decorator('SubjectEnum',function($delegate){
        var relevantSubjectIds = [0,1,2];
        var keys = Object.keys($delegate);
        keys.forEach(function(key){
            var enumData = $delegate[key];
            if(relevantSubjectIds.indexOf(enumData.enum) === -1){
                delete $delegate[key];
            }
        });
        return $delegate;
    });
})(angular);
