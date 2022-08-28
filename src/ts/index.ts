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
    document.getElementById("teacherSelector").addEventListener("change", function (val) {
        // @ts-ignore
        teacherSelected(val.target.value);
    })
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

var combinedLogs: CombinedLogs | undefined;

async function analyzeFiles(files: FileList) {
    combinedLogs = new CombinedLogs();
    document.getElementById("teacherBlock").classList.add("hidden");
    document.getElementById("teacherSelector").innerHTML = '';
    document.getElementById("results").classList.add("hidden");
    document.getElementById("results").innerHTML = '';

    let csvs = await readFiles(files);
    for (const csv of csvs) {
        let parsedCsv = analyzeText(csv);
        if (parsedCsv.errors.length > 0) {
            alert("Found errors: " + parsedCsv.errors.join("\r\n"));
            return;
        }
        let entries: GoogleMeetEntry[] = parsedCsv.data.map(csvEntry => new GoogleMeetEntry(csvEntry));
        combinedLogs.addStudents(new SingleMeet(entries));
    }

    let teacherCandidates = combinedLogs.findTeacherCandidates();
    if (teacherCandidates.length === 0) {
        alert("Не знайдено жодного користувача, який би відвідав усі заняття. Викладач відсутній.");
        combinedLogs = new CombinedLogs();
        document.getElementById("teacherBlock").classList.add("hidden");
        document.getElementById("teacherSelector").innerHTML = '';
        document.getElementById("results").classList.add("hidden");
        document.getElementById("results").innerHTML = '';
        return;
    }

    let autoSelectTeacher = combinedLogs.autoSelectTeacher(teacherCandidates);

    let selectorHtml = '';
    for (const teacherCandidate of teacherCandidates) {
        let sel = teacherCandidate === autoSelectTeacher ? "selected" : '';
        selectorHtml += "<option value='" + teacherCandidate + "'" + sel + ">" + teacherCandidate + "</option>";
    }

    document.getElementById("teacherSelector").innerHTML = selectorHtml;
    document.getElementById("teacherBlock").classList.remove("hidden");

    teacherSelected(autoSelectTeacher);
}

function teacherSelected(selectedTeacher: string) {
    combinedLogs?.setTeacher(selectedTeacher);

    let text = '';
    text += renderPerson(<CombinedLogs>combinedLogs, selectedTeacher, true);
    for (let studentName in combinedLogs?.studentsLogs) {
        if (studentName !== selectedTeacher) {
            text += renderPerson(<CombinedLogs>combinedLogs, studentName, false)
        }
    }
    if (text) {
        displayGeneratedInfo(text);
    }
}

function renderPerson(combinedLogs: CombinedLogs, studentName: string, teacher: boolean) {
    let text = '';
    let teacherClass = teacher ? "teacher" : "";
    text += "<div class='container my-2 " + teacherClass + "'>";
    text += "<div class='row'><div class='col-md-12'><h5>" + studentName + "</h5></div></div>";
    for (const meet of combinedLogs.meets) {
        const meetEntry = combinedLogs.studentsLogs[studentName].find(s => meet.entries.indexOf(s) !== -1);
        // @ts-ignore: Object is possibly 'null'.
        const durationMins = Math.floor(meet.durationSeconds / 60);
        if (meetEntry) {
            const durationStudentMins = Math.floor(meetEntry.timeInCallSeconds / 60);
            // @ts-ignore: Object is possibly 'null'.
            let percentage = Math.floor(meetEntry.timeInCallSeconds * 100 / meet.durationSeconds);
            text += "<div class='row'><div class='col-md-3'>" + formatDate(meet.start) + "</div><div class='col-md-2'>" + durationStudentMins + "/" + durationMins + " хв.</div><div class='col-md-1'>✅</div><div class='col-md-2'>" + percentage + "%</div></div>";
        } else {
            text += "<div class='row'><div class='col-md-3'>" + formatDate(meet.start) + "</div><div class='col-md-2'>" + "0/" + durationMins + " хв.</div><div class='col-md-1'>❌</div></div>";
        }
    }
    text += "</div>";
    return text;
}

function formatDate(date: Date) {
    let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return date.toLocaleString("uk-UA", options);
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