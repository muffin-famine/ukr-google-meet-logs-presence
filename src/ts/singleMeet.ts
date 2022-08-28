import {GoogleMeetEntry} from "./googleMeetEntry";

export class SingleMeet {
    start: Date;
    end: Date;
    durationSeconds: number;
    entries: GoogleMeetEntry[];

    constructor(entries: GoogleMeetEntry[]) {
        let minStart = new Date();
        let maxEnd = new Date(0);
        for (const entry of entries) {
            if (entry.firstSeen.getTime() < minStart.getTime()) {
                minStart = entry.firstSeen;
            }
            if (entry.lastSeen.getTime() > maxEnd.getTime()) {
                maxEnd = entry.lastSeen;
            }
        }
        this.start = minStart;
        this.end = maxEnd;
        this.durationSeconds = (this.end.getTime() - this.start.getTime()) / 1000;
        this.entries = entries;
    }
}