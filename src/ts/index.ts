import * as Papa from "papaparse";
import {ParseResult} from "papaparse";
import {GoogleMeetCsvEntry} from "./googleMeetCsvEntry";
import {GoogleMeetEntry} from "./googleMeetEntry";
import {CombinedLogs} from "./combinedLogs";
import {SingleMeet} from "./singleMeet";

function init() {
    document.getElementById("fileSelector").addEventListener("change", function (changeEvent) {
        analyzeFiles(this.files);
    });
}

function analyzeText(csv: string): ParseResult<GoogleMeetCsvEntry> {
    let lines = csv.split(/\r?\n/g);
    lines = lines.splice(4, lines.length); // remove first 4 lines
    lines = lines.filter(n => n); // remove empty lines
    const newCsv = lines.join("\r\n");
    return Papa.parse(newCsv, {
        header: true
    });
}

async function analyzeFiles(files: FileList) {
    let csvs = await readFiles(files);
    let allData: GoogleMeetCsvEntry[] = [];
    let combinedLogs: CombinedLogs = new CombinedLogs();
    for (const csv of csvs) {
        let parsedCsv = analyzeText(csv);
        if (parsedCsv.errors.length > 0) {
            alert("Found errors: " + parsedCsv.errors.join("\r\n"));
            return;
        }
        let entries: GoogleMeetEntry[] = parsedCsv.data.map(csvEntry => new GoogleMeetEntry(csvEntry));
        combinedLogs.addStudents(new SingleMeet(entries));
        allData = allData.concat(parsedCsv.data);
    }
    let text = '';
    for (let studentName in combinedLogs.studentsLogs) {
        text += "<div class='container my-2'>"
        text += "<div class='row'><div class='col-md-12'><h5>" + studentName + "</h5></div></div>";
        for (const meet of combinedLogs.meets) {
            const meetEntry = combinedLogs.studentsLogs[studentName].find(s => meet.entries.indexOf(s) !== -1);
            if (meetEntry) {
                let percentage = Math.floor(meetEntry.timeInCallSeconds * 100 / meet.durationSeconds);
                text += "<div class='row'><div class='col-md-3'>" + formatDate(meet.start) + "</div><div class='col-md-1'>✅</div><div class='col-md-2'>" + percentage + "%</div></div>";
            } else {
                text += "<div class='row'><div class='col-md-3'>" + formatDate(meet.start) + "</div><div class='col-md-1'>❌</div></div>";
            }
        }
        text += "</div>";
    }
    if (text) {
        displayGeneratedInfo(text);
    }
}

function formatDate(date: Date) {
    let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString("uk-UA", options);
}

async function readFiles(files: FileList): Promise<string[]> {
    return new Promise(async (resolve) => {
        const texts: string[] = [];
        let counter = 0;
        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            reader.addEventListener('load', (event) => {
                texts.push(event.target?.result as string);
                counter++;
            });
            reader.readAsText(files[i]);
        }
        while (counter != files.length) {
            await sleep(100);
            resolve(texts);
        }
    });
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function displayGeneratedInfo(text: string) {
    document.getElementById("results").classList = "visible";
    document.getElementById("results").innerHTML = text;
}

window.onload = () => {
    init();
}