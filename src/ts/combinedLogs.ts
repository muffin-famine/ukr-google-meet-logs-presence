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

}