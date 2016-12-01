function startTime() {
    var weekday = new Array(
        "<span class='day1'>S</span><span class='day2'>U</span><span class='day3'>N</span>",
        "<span class='day1'>M</span><span class='day2'>O</span><span class='day3'>N</span>",
        "<span class='day1'>T</span><span class='day2'>U</span><span class='day3'>E</span>",
        "<span class='day1'>W</span><span class='day2'>E</span><span class='day3'>D</span>",
        "<span class='day1'>T</span><span class='day2'>H</span><span class='day3'>U</span>",
        "<span class='day1'>F</span><span class='day2'>R</span><span class='day3'>I</span>",
        "<span class='day1'>S</span><span class='day2'>A</span><span class='day3'>T</span>"
    );
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    var day = today.getDay();
    var am_pm = "AM";
    var greet = "Good Morning, Alipoodle."
    m = checkTime(m);
    s = checkTime(s);
    if(h < 12 || h == 24) {
        greet = "Good Morning, Alipoodle."
    }
    else if(h >= 12 && h < 17) {
        greet = "Good Afternoon, Alipoodle.";
    } 
    else if(h <= 24) {
        greet = "Good Evening, Alipoodle.";
    }
    h = checkTime(h);
    document.getElementById('clock').innerHTML = h + ":" + m + weekday[day];
    document.getElementById('greeting').innerHTML = greet;
    var t = setTimeout(startTime, 500);
}
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
