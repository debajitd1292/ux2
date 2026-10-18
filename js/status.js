function updateHeaderDate() {
    const dateElem = document.getElementById("todayDate");
    const weekdayElem = document.getElementById("todayWeekday");
    if (!dateElem) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][now.getMonth()];

    dateElem.textContent = `${day}-${month}-${now.getFullYear()}`;

    if (weekdayElem) {
        weekdayElem.textContent = now.toLocaleDateString("en-US", { weekday: "long" });
    }

    // Keep the app's existing holiday/Sunday/2nd & 4th Saturday logic.
    dateElem.classList.toggle("special-date", isSpecialDay());
    updateTodayHolidayNames();
}


function getCurrentShiftInfo() {

    let now = new Date();

    let hours = now.getHours();

    let currentDate = formatDate(now);

    // previous date
    let prev = new Date(now);
    prev.setDate(prev.getDate() - 1);
    let prevDate = formatDate(prev);

    // A Shift: 06:00–14:00
    if(hours >= 6 && hours < 14){
        return { shift: "A", date: currentDate };
    }

    // B Shift: 14:00–22:00
    if(hours >= 14 && hours < 22){
        return { shift: "B", date: currentDate };
    }

    // C Shift split logic
    if(hours >= 22){
        // same day C
        return { shift: "C", date: currentDate };
    }

    if(hours < 6){
        // 🔴 IMPORTANT: after midnight → previous date C shift
        return { shift: "C", date: prevDate };
    }

    return null;
}
