export class ExerciseHeaderUtil {
    constructor(SubjectEnum, subjectId) {
        this.SubjectEnum = SubjectEnum;
        this.subjectId = subjectId;
    }
    getSubjectName() {
        var subjectName = void(0);
        switch (this.subjectId) {
            case this.SubjectEnum.ENGLISH.enum:
                subjectName = 'English';
                break;
            case this.SubjectEnum.READING.enum:
                subjectName = 'Reading';
                break;
            case this.SubjectEnum.MATH.enum:
                subjectName = 'Math';
                break;
            case this.SubjectEnum.SCIENCE.enum:
                subjectName = 'Science';
                break;
            case this.SubjectEnum.WRITING.enum:
                subjectName = 'Writing';
                break;
            default:
                subjectName = 'Default';
        }
        return subjectName;
    }
}
