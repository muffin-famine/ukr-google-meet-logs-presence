import {StudentsLogs} from "./studentsLogs";
import {SingleMeet} from "./singleMeet";

export class CombinedLogs {

    meets: SingleMeet[] = [];
    studentsLogs: StudentsLogs = {};

    constructor() {
    }

    addStudents(meet: SingleMeet): void {
        this.meets.push(meet);
        this.meets = this.meets.sort((a, b) => {
            return a.start.getTime() - b.start.getTime()
        });
        for (const entry of meet.entries) {
            let fullName = entry.fullName;
            if (!this.studentsLogs[fullName]) {
                this.studentsLogs[fullName] = [];
            }
            this.studentsLogs[fullName].push(entry);
        }
    }

    findTeacherCandidates(): string[] {
        let teacherCandidates: string[] = this.meets[0].entries.map(e => e.fullName);
        for (const meet of this.meets) {
            teacherCandidates = teacherCandidates.filter(value => meet.entries.map(e => e.fullName).indexOf(value) !== -1);
        }
        return teacherCandidates;
    }

    autoSelectTeacher(candidates: string[]): string {
        let maxCandidate = candidates[0];
        let maxTime = 0;
        for (const candidate of candidates) {
            let candidateTime = 0;
            for (const meet of this.meets) {
                candidateTime += meet.entries.find(e => e.fullName === candidate)?.timeInCallSeconds ?? 0;
            }
            if (maxTime < candidateTime) {
                maxTime = candidateTime;
                maxCandidate = candidate;
            }
        }
        this.setTeacher(maxCandidate);
        return maxCandidate;
    }

    setTeacher(teacher: string) {
        this.meets.forEach(m => m.setTeacher(teacher));
    }

}