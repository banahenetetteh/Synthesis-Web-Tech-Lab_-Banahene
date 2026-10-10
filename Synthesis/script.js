/*
  script.js
  Berekuso Cinema booking page
  Tetteh Banahene, Web Technologies
*/


/*  Lesson 8: literals, and checking their types  */

const CINEMA = "Berekuso Cinema";
const GROUP_SIZE = 4;        // this many tickets or more gets the group rate
const GROUP_RATE = 0.10;     // 10% off
const AFTERNOON_SAVING = 10;   // per ticket, before 4pm

console.log("CINEMA is a " + typeof CINEMA);
console.log("GROUP_RATE is a " + typeof GROUP_RATE);


/*  Lesson 10: a constructor function with a prototype method  */

function Film(title, rating, minutes, price) {
  this.title = title;
  this.rating = rating;
  this.minutes = minutes;
  this.price = price;
}

// One copy of this lives on the prototype and is shared by every Film,
// rather than each object carrying its own copy.
Film.prototype.describe = function () {
  return this.title + " - GHS " + this.price;
};

let films = [
  new Film("Inception", "12A, 12 and over with an adult", 148, 60),
  new Film("Frozen", "PG, parental guidance", 102, 50),
  new Film("Fast and Furious", "15, over 15s only", 107, 55)
];


/*  Lesson 10: associative arrays, looked up by name  */

let seatsLeft = {};
seatsLeft["Inception"] = 42;
seatsLeft["Frozen"] = 6;
seatsLeft["Fast and Furious"] = 0;   // sold out

let seatExtra = {};
seatExtra["standard"] = 0;
seatExtra["premium"] = 20;
seatExtra["recliner"] = 45;

let snackPrice = {};
snackPrice["popcorn"] = 25;
snackPrice["drink"] = 15;
snackPrice["combo"] = 60;


/*  Lesson 10: a multidimensional array for the timetable  */
/* each inner array is [day, time, screen, afternoon show?] */

let showtimes = [
  ["Friday", "2:15 pm", "Screen 1", true],
  ["Friday", "6:30 pm", "Screen 1", false],
  ["Saturday", "3:00 pm", "Screen 2", true],
  ["Saturday", "8:00 pm", "Screen 2", false],
  ["Sunday", "5:45 pm", "Screen 4", false]
];


/*  Lesson 10: a class, with method chaining  */

class Booking {

  constructor() {
    this.film = null;
    this.tickets = 1;
    this.snacks = [];
  }

  choose(film) {
    this.film = film;
    return this;      // returning the booking is what lets calls chain
  }

  addSnack(name) {
    this.snacks.push(name);
    return this;
  }

  clearSnacks() {
    this.snacks = [];
    return this;
  }

  snackCost() {
    let sum = 0;
    for (let i = 0; i < this.snacks.length; i++) {
      sum = sum + snackPrice[this.snacks[i]];
    }
    return sum;
  }

}

let booking = new Booking();


/*  Lesson 8: the elements  */

let filmGrid = document.getElementById("film-grid");
let timesBody = document.getElementById("times-body");
let showtimeSelect = document.getElementById("showtime");
let form = document.getElementById("booking-form");
let notes = document.getElementById("notes");
let charCount = document.getElementById("char_count");
let summaryLines = document.getElementById("summary-lines");


/*  Build the film cards  */

function showFilms() {

  films.forEach(function (film) {

    let left = seatsLeft[film.title];

    // ternary operator - two outcomes on one line
    let seatText = left === 0 ? "Sold out" : left + " seats left";
    let seatClass = left === 0 ? "seats full" : "seats";

    let card = document.createElement("div");
    card.className = "film";

    card.innerHTML =
      "<div class='film-body'>" +
      "<h3>" + film.title + "</h3>" +
      "<p class='meta'>" + film.rating + "<br />" + film.minutes + " mins</p>" +
      "<p class='price'>GHS " + film.price + "</p>" +
      "<p class='" + seatClass + "'>" + seatText + "</p>" +
      "</div>";

    // a sold out film is not clickable
    if (left > 0) {
      card.addEventListener("click", function () {
        booking.choose(film);
        markPicked(card);
        updateSummary();
      });
    }

    filmGrid.appendChild(card);
  });
}

function markPicked(chosen) {
  let cards = document.getElementsByClassName("film");

  for (let i = 0; i < cards.length; i++) {
    cards[i].className = cards[i] === chosen ? "film picked" : "film";
  }
}


/*  Build the timetable and the matching dropdown  */

function showTimes() {

  for (let i = 0; i < showtimes.length; i++) {

    timesBody.innerHTML = timesBody.innerHTML +
      "<tr><th scope='row'>" + showtimes[i][0] + "</th>" +
      "<td>" + showtimes[i][1] + "</td>" +
      "<td>" + showtimes[i][2] + "</td></tr>";

    // say so in the dropdown, otherwise the cheaper price looks like a mistake
    let tag = showtimes[i][3] ? " (afternoon)" : "";

    let option = document.createElement("option");
    option.value = i;
    option.textContent = showtimes[i][0] + ", " + showtimes[i][1] + tag;
    showtimeSelect.appendChild(option);
  }
}


/*  Lesson 9: the price, where the control flow lives  */

function seatSurcharge() {
  let picked = form.querySelector('input[name="seat"]:checked');
  return picked === null ? 0 : seatExtra[picked.value];
}

function afternoonSaving() {
  let index = Number(showtimeSelect.value);

  // the fourth item in the inner array says whether it is an afternoon show
  switch (showtimes[index][3]) {
    case true:
      return AFTERNOON_SAVING;
    default:
      return 0;
  }
}

function readSnacks() {
  booking.clearSnacks();

  let ticked = form.querySelectorAll('input[name="extras"]:checked');

  for (let i = 0; i < ticked.length; i++) {
    booking.addSnack(ticked[i].value);
  }
}

function updateSummary() {

  readSnacks();

  booking.tickets = Number(document.getElementById("tickets").value);

  summaryLines.innerHTML = "";

  if (booking.film === null) {
    document.getElementById("chosen-film").textContent = "No film selected yet.";
    document.getElementById("total").value = "GHS 0.00";
    document.getElementById("status-line").textContent = "Pick a film above to start.";
    return;
  }

  // describe() comes from the prototype
  document.getElementById("chosen-film").textContent = booking.film.describe();

  let tickets = booking.tickets;

  // show the full price first, then every adjustment on its own line,
  // so the figures on screen actually add up to the total
  addLine(tickets + " x " + booking.film.title + " at GHS " + booking.film.price +
    " = GHS " + booking.film.price * tickets);

  if (seatSurcharge() > 0) {
    addLine("Seat upgrade: GHS " + seatSurcharge() + " each = GHS " + seatSurcharge() * tickets);
  }

  if (afternoonSaving() > 0) {
    addLine("Afternoon show: GHS " + AFTERNOON_SAVING + " off each = minus GHS " + AFTERNOON_SAVING * tickets);
  }

  let perTicket = booking.film.price + seatSurcharge() - afternoonSaving();
  let ticketCost = perTicket * tickets;

  let snacks = booking.snackCost();

  if (snacks > 0) {
    addLine("Snacks = GHS " + snacks);
  }

  // && means both have to be true
  let groupDiscount = booking.tickets >= GROUP_SIZE && booking.film !== null
    ? ticketCost * GROUP_RATE
    : 0;

  if (groupDiscount > 0) {
    addLine("Group discount = minus GHS " + groupDiscount.toFixed(2));
  }

  let total = ticketCost + snacks - groupDiscount;
  document.getElementById("total").value = "GHS " + total.toFixed(2);

  // if / else if / else to decide the message
  let message;

  if (booking.tickets > seatsLeft[booking.film.title]) {
    message = "Only " + seatsLeft[booking.film.title] + " seats left for this film.";
  } else if (groupDiscount > 0) {
    message = "Group of " + booking.tickets + " - 10% off the tickets.";
  } else if (booking.tickets === GROUP_SIZE - 1) {
    message = "Add one more ticket for the group discount.";
  } else {
    message = "Ready when you are.";
  }

  document.getElementById("status-line").textContent = message;
}

function addLine(text) {
  let item = document.createElement("li");
  item.textContent = text;
  summaryLines.appendChild(item);
}


/*  Lesson 5: the counter and the page info  */

function updateCharCount() {
  let left = notes.maxLength - notes.value.length;
  charCount.value = left + " of " + notes.maxLength + " characters left";
}

function updatePageInfo() {
  document.getElementById("page-info").textContent =
    "Page last modified " + document.lastModified +
    ". Window is " + window.innerWidth + " pixels wide.";
}


/*  Listen  */

form.addEventListener("input", updateSummary);
form.addEventListener("change", updateSummary);
notes.addEventListener("input", updateCharCount);
window.addEventListener("resize", updatePageInfo);

document.getElementById("reset-btn").addEventListener("click", function () {
  booking = new Booking();
  form.reset();
  markPicked(null);
  updateCharCount();
  updateSummary();
});


/*  Run once on load  */

showFilms();
showTimes();
updateCharCount();
updateSummary();
updatePageInfo();

console.log(CINEMA + " page ready.");
