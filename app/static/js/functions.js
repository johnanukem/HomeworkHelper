/* time / dates */

// format time as str
var getStrTimeFromSeconds = function(secs) {
  var hours = Math.floor(secs / 3600);
  secs -= hours * 3600;
  var minutes = Math.floor(secs / 60);
  secs -= minutes * 60;

  var pm = false;
  if (hours == 0 && minutes) { // midnight
    hours = 12;
  } else if (hours > 12) { // pm
    pm = true;
    hours -= 12;
  }

  minutes = (minutes < 10) ? ('0'+minutes.toString()) : minutes.toString();
  return `${hours}:${minutes} ${pm ? ('PM') : ('AM')}`;
};

// define modulo for negative numbers
var mod = function(n, m) {
    var remain = n % m;
    return Math.floor(remain >= 0 ? remain : remain + m);
};

// number of days in month
function daysInMonth(month, year) { return new Date(year, month+1, 0).getDate(); }

// weekday of first day in month
function firstDay(month, year) { return new Date(year, month, 1).getDay(); }

// get month name from index
function getMonthName(month) {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ][month];
}
// get day name from index
function getDayName(day) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ][day];
}

// get delta from TODAY
function getStrDeltaFromToday(date) {
  var today = new Date();
  var delta = Math.floor((today - date) / 1000); // seconds
  if (0 < delta && delta < 86400) { // today
    return 'Today';
  } else if (delta > 0) { // past
    return `${Math.floor(delta/86400)} days ago`;
  } else if (delta < 0) { // future
    return `${Math.ceil(-delta/86400)} days ahead`;
  }
}

// add meta-data tags
function addDateInfo(element, date) {
  element.dataset.month = getMonthName(date.getMonth());
  element.dataset.monthNum = date.getMonth();
  element.dataset.day = getDayName(date.getDay());
  element.dataset.date = date.getDate();
  element.dataset.year = date.getFullYear();
}
function addCourseInfo(element, course) {
    element.dataset.teacherId = course.teacherId;
    element.dataset.teacherName = course.teacherName;
    element.dataset.courseId = course.courseId;
    element.dataset.name = course.courseName;
    element.dataset.location = course.location;
    element.dataset.startTimeSeconds = course.startTime;
    element.dataset.endTimeSeconds = course.endTime;

    element.dataset.startTime = getStrTimeFromSeconds(course.startTime);
    element.dataset.endTime = getStrTimeFromSeconds(course.endTime);
}

// from create-course modal
function parseCourseInfo() { // TODO
  return {
    userId: getUserId(),
    courseName: 'COMS4107',
    location: 'Building A',
    startDate: {
      day: 9,
      month: 0,
      year: 2018
    },
    endDate: {
      day: 8,
      month: 4,
      year: 2018
    },
    startTime: {
      hours: 12,
      minutes: 10,
      seconds: 0,
    },
    endTime: {
      hours: 2,
      minutes: 00,
      seconds: 0,
    },
    daysOfWeek: [2, 4],
    teacherId: 31
  };
}

function generateMonthDays(month, year, today, currMonth, currYear) {
  var element;
  var fragment = document.createDocumentFragment();
  var days = daysInMonth(month, year)

  var daysInView = 5 * 7; // rows x days in week
  var daysCounted = 0;

  var daysPrev = [];
  for (var i=firstDay(month, year); i > 0; i--) { // add prev month days to view
    var date = new Date(year, month,  -1 * daysCounted);

    element = document.createElement('li');
    element.className = 'prev-month date animated';
    element.innerText = date.getDate();
    addDateInfo(element, date);

    // add listeners
    addDateEventListeners(element);

    daysPrev.push(element);
    daysCounted++;
  }
  daysPrev.reverse(); // correct backwards
  daysPrev.forEach(function(element) {
    fragment.appendChild(element);
  });

  for (var i=1; i <= days; i++) { // add current month days to view
    var date = new Date(year, month, i);

    element = document.createElement('li');
    element.className = 'curr-month date animated';
    // today?
    if (i == today && currMonth == month && currYear == year) {
      element.id = 'today';
      element.className += ' active';
    }
    element.innerText = i;
    addDateInfo(element, date);

    // add listeners
    addDateEventListeners(element);

    fragment.appendChild(element);
    daysCounted++;
  }

  var daysLeft = daysInView - daysCounted;
  for (var i=1; i <= daysLeft; i++ ) { // add next month days to view
    var date = new Date(year, month+1, i);

    element = document.createElement('li');
    element.className = 'next-month date animated';
    element.innerText = i;
    addDateInfo(element, date);

    // add listeners
    addDateEventListeners(element);

    fragment.appendChild(element);
    daysCounted++;
  }

  return fragment; // document fragment
}


function generateCalendar(index=0) {
  /*
    @param index: relative to current month (0) prev < 0 && next > 0
   */
  var now = new Date();
  var today = now.getDate(); // today
  var currMonth = now.getMonth();
  var currYear = now.getFullYear();

  var targetMonth = mod((currMonth + index), 12);
  var targetYear = Math.floor((currMonth + index) / 12) + currYear;

  var root;
  var element;
  var subelement;
  var fragment = document.createDocumentFragment(); // chunk

  // calendar obj
  var width = 300;
  root = document.createElement('div');
  root.className = 'calendar-object inline-block center rounded';

  root.dataset.index = index;
  root.style.width = `${width}px`;

  // position relative to OG calendar
  if (index == 0) root.id = 'current-month';

  fragment.appendChild(root);

  // calendar name
  element = document.createElement('div');
  element.className = 'calendar-month-section';
  element.innerText = getMonthName(targetMonth);

  root.appendChild(element);

  // calendar weekdays
  element = document.createElement('div');
  element.className = 'calendar-weekdays-section';

  subelement = document.createElement('ul');
  subelement.className = 'weekdays flex center';
  subelement.innerHTML = '<li>S</li><li>M</li><li>T</li><li>W</li><li>T</li><li>F</li><li>S</li>';

  element.appendChild(subelement);
  root.appendChild(element);

  // calendar days
  element = document.createElement('div');
  element.className = 'calendar-days-section';

  subelement = document.createElement('ul');
  subelement.className = 'days flex center';
  subelement.appendChild(generateMonthDays( // get appropriate view
    targetMonth,
    targetYear,
    today,
    currMonth,
    currYear,
  ));

  element.appendChild(subelement);
  root.appendChild(element);

  return fragment; // document fragment
}

// add select for contenteditable
function selectElementContents(element) {
    var range = document.createRange();
    range.selectNodeContents(element);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

/* EVENT LISTENERS */

// POST to '/api/courses' w/ date
function loadSchedule(err, parentElement, respData) {
  if (err) return console.error('ERROR pulling schedule:', err);

  var courses = respData.courses;
  var planner = document.getElementById('planner');

  var day = parentElement.dataset.day;
  var month = parentElement.dataset.month;
  var monthNum = parseInt(parentElement.dataset.monthNum);
  var date = parseInt(parentElement.dataset.date);
  var year = parseInt(parentElement.dataset.year);

  // change schedule headers
  var scheduleDate = document.getElementById('schedule-date');
  scheduleDate.innerText = `${day}, ${month} ${date} ${year}`;
  var scheduleTime = document.getElementById('schedule-time');
  scheduleTime.innerText = getStrDeltaFromToday(new Date(year, monthNum, date))

  var timeOffset = hour => Math.floor((planner.offsetHeight / 24) * hour);

  var fragment = document.createDocumentFragment();

  if (!courses) {
      var element = document.createElement('h1');
      element.className += 'no-results center absolute'
      element.innerText = 'Empty Schedule!';
      planner.appendChild(element);
  } else {
    courses.forEach(course => {
      // create course div
      var elem = document.createElement('div');

      // NOTE: for now randomly color
      var randomNum = Math.random();
      if (randomNum > .66) {
        elem.style.backgroundColor = '#E45879';
      } else if (randomNum > .33) {
        elem.style.backgroundColor = '#E47D58';
      } else {
        elem.style.backgroundColor = '#2E63BC';
      }

      elem.className = 'course clickable absolute rounded';
      var hours = secs => secs / 3600;
      elem.style.top = timeOffset(course.startTime/3600) + 'px';
      elem.style.height = timeOffset(course.duration/3600) + 'px';

      // add meta-tags
      addCourseInfo(elem, course);
      // add event listeners
      addCourseEventListeners(elem);

      var subelem = document.createElement('h3');
      subelem.className = 'course-title';
      subelem.innerText = course.courseName;
      elem.append(subelem);

     if (parseInt(course.duration) > 3600) { // add course-meta in bubble
        subelem = document.createElement('h4');
        subelem.className = 'course-meta';
        subelem.innerText= `${elem.dataset.startTime} @ ${course.location}`;
        elem.append(subelem);
      }

      fragment.appendChild(elem);
    });
  }

  // add courses to schedule DOM
  planner.appendChild(fragment);
}

// POST to 'api/assignments'
function loadAssignments(err, parentElement, respData) {
  if (err) return console.log('ERROR pulling assignments:', err);
  console.log(respData);
}

// course bubble event listeners
function addCourseEventListeners(element) {
  var targetColor = element.style.backgroundColor;
  // var modal = document.getElementById('detail-modal');
  // $(div.course).onClick
  // element.addEventListener('click', function(event) {
  //     // clear modal
  //     modal.innerHTML = '';
  //
  //     var datatags = Object.assign({}, element.dataset);
  //     Object.keys(datatags).forEach(k => {
  //       modal.innerHTML += `${k}: ${datatags[k]}<br>`;
  //     });
  //
  //     modal.style.borderLeftColor = targetColor;
  //     modal.style.display = 'block';
  // });
}

// date event listeners
function addDateEventListeners(element) {
  // var modal = document.getElementById('detail-modal');

  var commonClassName = 'date';
  var activeClass = 'active';

  // $(li.date).onCLick
  element.addEventListener('click', function(event) {
    // modal.style.display = '';
    // remove active class from others
    Array.from(document.querySelectorAll('.'+commonClassName)).some((date) => {
      if (date.classList.contains(activeClass)) {
        date.classList.remove(activeClass);
        return true;
      }
    });
    // add active class
    element.className += ' active'

    // clear planner
    document.getElementById('planner').innerHTML = '';

    var date = {
      day: element.dataset.date,
      month: element.dataset.monthNum,
      year: element.dataset.year
    };

    // AJAX Request
    // getAssignments(date, element, loadAssignments);
    getDateSchedule(date, element, loadSchedule);
  });
}

// on course title edit listeners
function addCourseTitleEventListeners(element, timeObj) {
  var modal = document.getElementById('create-modal');
  var head = document.getElementById('course-title');
  var start = document.getElementById('start');
  element.addEventListener('keypress', function(e) {
    if (e.key == 'Enter') {
      e.preventDefault();

      var title = element.innerText.charAt(0).toUpperCase() + element.innerText.substr(1);
      element.innerText = title;
      head.innerText = title;
      start.innerText = timeObj.string;
      var div = element.parentElement;
      // show modal
      div.className += ' editing';
      modal.className += ' show';
      modal.style.borderColor = div.style.backgroundColor;
      this.blur();

    }
  });
}


// backlight click event listener
function addBacklightEventListeners() {
  var backlight = document.getElementById('backlight');
  backlight.addEventListener('click', function(e) {
    if (e.target == this) {
      var courses = document.querySelectorAll('.course');
      var modal = document.getElementById('create-modal');

      Array.from(courses).forEach(node => { node.classList.remove('editing') });
      modal.classList.remove('show');
    }
  });
}

// schedule hour event listeners
function addScheduleHourEventListeners() {
  var planner = document.getElementById('planner');
  planner.parentElement.addEventListener('click', function(e) {

    // don't create course when clicking course
    if (!e.target.classList.contains('course') && !e.target.parentElement.classList.contains('course')) {
      // get click pos in scrollable div
      var rect = this.getBoundingClientRect();
      var topPos = e.clientY + this.scrollTop - rect.top;

      // search for conflicts -> schedule placement
      var conflicts = 0;
      Array.from(document.querySelectorAll('.course')).forEach(course => {
        var startPos = parseFloat(course.style.top);
        var endPos = parseFloat(course.style.top) + course.clientHeight;
        if (startPos <= topPos && topPos < endPos)
          conflicts++;
      });

      console.log(conflicts);
      if (conflicts > 2)
        return console.error('TOO MANY SCHEDULE CONFLICTS');

      // convert position into approximate time in seconds (2 decimals) and then round to nearest five minute interval
      var timeSec = Math.round(Math.floor(
        Math.round(topPos/planner.offsetHeight * 100) / 100 * 24 * 3600) / 300) * 300;
      var timeStr = getStrTimeFromSeconds(timeSec);

      var elem = document.createElement('div');
      elem.className = 'course clickable absolute rounded' + (conflicts ? ' conflict-'+conflicts : '');
      elem.style.top = topPos+'px';
      elem.style.height = (planner.offsetHeight/24.0)+'px'; // an hour

      var subelem = document.createElement('h3');
      subelem.className = 'course-title';
      subelem.innerText = 'No Name';
      subelem.contentEditable = true;
      elem.append(subelem);

      // NOTE: for now randomly color
      var randomNum = Math.random();
      if (randomNum > .66) {
        elem.style.backgroundColor = '#E45879';
      } else if (randomNum > .33) {
        elem.style.backgroundColor = '#E47D58';
      } else {
        elem.style.backgroundColor = '#2E63BC';
      }
      planner.appendChild(elem);
      // text
      subelem.focus();
      selectElementContents(subelem);
      addCourseTitleEventListeners(subelem, { string: timeStr, seconds: timeSec });
    }
  });
}

