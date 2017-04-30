(function(){
    angular.module('demo').config(function(UserGoalsServiceProvider) {

            UserGoalsServiceProvider.settings = {
                defaultSubjectScore: 600,
                minSchoolScore: 400,
                maxSchoolScore: 1600,
                minGoalsScore: 200,
                maxGoalsScore: 800,
                updateGoalNum: 10,
                subjects: [
                    { name: 'math', svgIcon: 'math-section-icon' },
                    { name: 'verbal', svgIcon: 'verbal-icon' }
                ]
            };

            UserGoalsServiceProvider.setCalcScoreFn(function (UserGoalsService, $q) {
                var self = this;
                return function(userSchools, save) {
                    return UserGoalsService.getGoals().then(function (userGoals) {
                        var minSchoolScore = 200,
                            maxSchoolScore = 800,
                            defaultSubjectScore = 600,
                            avgScores = [],
                            subjects = self.settings.subjects;

                        angular.forEach(userSchools, function (school) {
                            var school25th = isNaN(school.total25th) ? minSchoolScore : school.total25th;
                            var school75th = isNaN(school.total75th) ? maxSchoolScore : school.total75th;
                            avgScores.push((school25th * 0.25) + (school75th * 0.75));
                        });

                        var avgSchoolsScore;
                        if (avgScores.length) {
                            avgSchoolsScore = avgScores.reduce(function (a, b) {
                                return a + b;
                            });
                            avgSchoolsScore = Math.round(avgSchoolsScore / avgScores.length);
                        } else {
                            avgSchoolsScore = defaultSubjectScore;
                        }

                        userGoals = {
                            isCompleted: false
                        };

                        angular.forEach(subjects, function(subject) {
                            userGoals[subject.name] = avgSchoolsScore || defaultSubjectScore;
                        });

                        userGoals.compositeScore = UserGoalsService.averageSubjectsGoal(userGoals);
                        return save ? UserGoalsService.setGoals(userGoals) : $q.when(userGoals);
                    });
                };
            });
        }
    )
})(angular);
