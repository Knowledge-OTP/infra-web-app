(function (angular) {
    'use strict';


    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionSubjectSrv', function (LiveSessionSubjectConst) {
        let topics = [LiveSessionSubjectConst.MATH, LiveSessionSubjectConst.ENGLISH];

        this.setLiveSessionTopics = function(_topics) {
            if (angular.isArray(_topics) && _topics.length) {
                topics = _topics;
            }
        };

        this.$get = function (UtilitySrv) {
            'ngInject';

            let LiveSessionSubjectSrv = {};

            function _getLiveSessionTopics() {
                return topics.map(function (topicId) {
                    let topicName = UtilitySrv.object.getKeyByValue(LiveSessionSubjectConst, topicId).toLowerCase();
                    return {
                        id: topicId,
                        name: topicName,
                        iconName: 'liveSession-' + topicName + '-icon'
                    };
                });
            }

            LiveSessionSubjectSrv.getLiveSessionTopics = _getLiveSessionTopics;

            return LiveSessionSubjectSrv;
        };
    });
})(angular);
