let holidays = [];


function loadHolidayData(holidayText){

    if(!holidayText){
        holidays = [];
        return;
    }

    const holidayRows = parseCSV(holidayText);

    holidays = holidayRows
        .slice(1)
        .map(r => {
            return {
                date: r[0]?.trim(),
                type: r[1]?.trim(),
                name: r[2]?.trim()
            };
        })
        .filter(r => r.date);
}


function formatHolidayDate(dateStr){

    let [d,m,y] = dateStr.split("-");
    let day = parseInt(d);

    let suffix = "th";

    if(day === 1 || day === 21 || day === 31)
        suffix = "st";
    else if(day === 2 || day === 22)
        suffix = "nd";
    else if(day === 3 || day === 23)
        suffix = "rd";

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    return day + suffix + " " + months[parseInt(m) - 1];
}


function isSpecialDay(){

    let today = new Date();

    let day = today.getDay(); // 0=Sun, 6=Sat
    let date = today.getDate();


    /* Sunday */

    if(day === 0)
        return true;


    /* 2nd & 4th Saturday */

    if(day === 6){

        let week = Math.ceil(date / 7);

        if(week === 2 || week === 4)
            return true;
    }


    /* GH check */

    let todayStr = formatDate(today);

    let isGH = holidays.some(h =>
        h.date === todayStr &&
        h.type === "GH"
    );


    /* RH check */

    let isRH = holidays.some(h =>
        h.date === todayStr &&
        h.type === "RH"
    );


    if(isGH || isRH)
        return true;


    return false;
}



function updateTodayHolidayNames() {
    const element = document.getElementById("todayHolidayNames");
    if (!element) return;

    const todayKey = formatDate(new Date());
    const todaysHolidays = holidays.filter(h =>
        h.date === todayKey && ["GH", "RH"].includes(String(h.type || "").trim().toUpperCase())
    );

    element.textContent = todaysHolidays
        .map(h => {
            const type = String(h.type || "").trim().toUpperCase();
            const name = String(h.name || "").trim();
            return name ? `${type}: ${name}` : type;
        })
        .join(" • ");
}

function calcHoliday(){

    let today = new Date();

    today.setHours(0,0,0,0);


    let nextGH = null;
    let nextRH = null;


    holidays.forEach(h => {

        if(!h.date)
            return;


        let [d,m,y] = h.date.split("-");


        let hd = new Date(
            parseInt(y),
            parseInt(m) - 1,
            parseInt(d)
        );


        hd.setHours(0,0,0,0);


        // Ignore today and past dates

        if(hd <= today)
            return;


        // Find nearest GH

        if (String(h.type || "").trim().toUpperCase() === "GH") {

            if(!nextGH || hd < nextGH.dateObj){

                nextGH = {
                    ...h,
                    dateObj: hd
                };

            }
        }


        // Find nearest RH

        if (String(h.type || "").trim().toUpperCase() === "RH") {

            if(!nextRH || hd < nextRH.dateObj){

                nextRH = {
                    ...h,
                    dateObj: hd
                };

            }
        }

    });


    const ghElem = document.getElementById("nextGH");
const rhElem = document.getElementById("nextRH");
const ghNameElem = document.getElementById("nextGHName");
const rhNameElem = document.getElementById("nextRHName");

function formatNextHolidayDate(dateStr) {
    if (!dateStr) return "—";

    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;

    const day = parts[0].padStart(2, "0");
    const month = parseInt(parts[1], 10);
    const year = parts[2];

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (month < 1 || month > 12) return dateStr;

    return `${day}-${months[month - 1]}-${year}`;
}

if (ghElem) {
    ghElem.textContent = nextGH
        ? formatNextHolidayDate(nextGH.date)
        : "No upcoming GH";
}

if (rhElem) {
    rhElem.textContent = nextRH
        ? formatNextHolidayDate(nextRH.date)
        : "No upcoming RH";
}

if (ghNameElem) {
    ghNameElem.textContent = nextGH?.name || "";
}

if (rhNameElem) {
    rhNameElem.textContent = nextRH?.name || "";
}

}
