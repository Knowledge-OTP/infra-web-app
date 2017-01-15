(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.tutorials').service('TutorialsSrv',
        function ($log, $injector, $q, StorageRevSrv, ExerciseResultSrv, ContentAvailSrv, CategoryService, ExerciseTypeEnum, ExerciseStatusEnum, SubjectsSrv) {
            'ngInject';
        
            this.getSubjectOrder = function () {
                return SubjectsSrv.getSubjectOrder();
            };


            this.getTutorialHeaders = function () {
                return StorageRevSrv.getContent({
                    exerciseId: null,
                    exerciseType: 'tutorialheaders'
                });
            };


            this.getAllTutorials = function () {
                return this.getTutorialHeaders().then(function (tutorialHeaders) {
                    if (!tutorialHeaders) {
                        return $q.reject('No tutorial headers were found');
                    }

                    var allProm = [];

                    angular.forEach(tutorialHeaders, function (tutorialsForSubject) {
                        angular.forEach(tutorialsForSubject, function (tutorial, tutorialId) {
                            tutorialId = +tutorialId;
                            var getExerciseProm = ExerciseResultSrv.getExerciseStatus(ExerciseTypeEnum.TUTORIAL.enum, tutorialId)
                                .then(function (data) {
                                    tutorial.isComplete = data.status === ExerciseStatusEnum.COMPLETED.enum;
                                });
                            allProm.push(getExerciseProm);

                            var isTutorialAvailProm = ContentAvailSrv.isTutorialAvail(tutorialId).then(function (isAvail) {
                                tutorial.isAvail = isAvail;
                            });
                            allProm.push(isTutorialAvailProm);

                            var getParentCategoryProm = CategoryService.getParentCategory(tutorial.categoryId).then(function (generalCategory) {
                                tutorial.categoryName = generalCategory.name;
                            });
                            allProm.push(getParentCategoryProm);
                        });
                    });

                    return $q.all(allProm).then(function () {
                        return tutorialHeaders;
                    });
                });
            };

            this.getTutorial = function (tutorialId) {
                return StorageRevSrv.getContent({
                    exerciseId: tutorialId,
                    exerciseType: 'tutorial'
                });
            };

        }
    );
})(angular);
