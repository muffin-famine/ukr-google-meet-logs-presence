import {GoogleMeetCsvEntry} from "./googleMeetCsvEntry";

export class GoogleMeetEntry {
    fullName: string;
    firstSeen: Date;
    timeInCallSeconds: number;
    lastSeen: Date;

    constructor(csv: GoogleMeetCsvEntry) {
        this.fullName = csv["Full Name"];
        this.firstSeen = new Date(Date.parse(csv["First Seen"]));
        this.timeInCallSeconds = new Date('1970-01-01T' + csv["Time in Call"] + 'Z').getTime() / 1000;
        this.lastSeen = new Date(this.firstSeen.getTime() + this.timeInCallSeconds * 1000);
    }
}