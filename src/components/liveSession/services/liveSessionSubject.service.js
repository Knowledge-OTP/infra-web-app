(function (angular) {
    'use strict';


    angular.module('znk.infra-web-app.liveSession').provider('LiveSessionSubjectSrv', function (LiveSessionSubjectConst) {
        let topics = [LiveSessionSubjectConst.MATH, LiveSessionSubjectConst.ENGLISH];

        this.setLiveSessionTopics = (_topics) => {
            if (angular.isArray(_topics) && _topics.length) {
                topics = _topics;
            }
        };

        this.$get = (UtilitySrv, MyZinkerzTopicMapEnum) => {
            'ngInject';

            let LiveSessionSubjectSrv = {};

            LiveSessionSubjectSrv.getLiveSessionTopics = () => {
                return topics.map(function (topicId) {
                    let topicName = UtilitySrv.object.getKeyByValue(LiveSessionSubjectConst, topicId).toLowerCase();
                    return {
                        id: topicId,
                        name: topicName,
                        iconName: 'liveSession-' + topicName + '-icon'
                    };
                });
            };

            LiveSessionSubjectSrv.getSessionSubject = (lesson) => {
                console.log('_getSessionSubject Lesson : ', lesson);
                if (lesson.sessionSubject) {
                    return lesson.sessionSubject.id;
                } else {
                    let topicIdNum = MyZinkerzTopicMapEnum[lesson.topicId.toUpperCase()].enum;
                    if (angular.isDefined(topicIdNum)) {
                        return topicIdNum;
                    } else {
                        throw new Error('Error: getSessionSubject: subjectId/topicId is undefined!');
                    }
                }
            };

            return LiveSessionSubjectSrv;
        };
    });
})(angular);
