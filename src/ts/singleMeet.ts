import {GoogleMeetEntry} from "./googleMeetEntry";

export class SingleMeet {
    start: Date;
    durationSeconds?: number;
    entries: GoogleMeetEntry[];

    constructor(entries: GoogleMeetEntry[]) {
        let minStart = new Date();
        for (const entry of entries) {
            if (entry.firstSeen.getTime() < minStart.getTime()) {
                minStart = entry.firstSeen;
            }
        }
        this.start = minStart;
        this.entries = entries;
    }

    setTeacher(teacher: string) {
        let teacherEntry = this.entries.find(e => e.fullName === teacher);
        if (teacherEntry) {
            this.start = teacherEntry.firstSeen;
            this.durationSeconds = teacherEntry.timeInCallSeconds;
        }
    }

}