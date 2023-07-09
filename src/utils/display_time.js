export function parseTime(time) {
    let dateObj = new Date(time);
    let hour = dateObj.getHours();
    let minute = dateObj.getMinutes();

    // Add leading zeros if necessary
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;

    return hour + ":" + minute;
}