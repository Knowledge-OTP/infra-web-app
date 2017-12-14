(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveSession').factory('MyZinkerzTopicMapEnum',
        function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['TOPIC_1', 1, 'topic_1'],
                ['TOPIC_2', 2, 'topic_2'],
                ['TOPIC_3', 3, 'topic_3'],
                ['TOPIC_12', 2, 'topic_2'],
                ['TOPIC_13', 2, 'topic_2']
            ]);
        }
    );
})(angular);

