let VTboundingBox = {
    maxLon: -73.3654,
    minLon: -71.5489,
    maxLat: 45.0065,
    minLat: 42.7395
};

let marker

let gameState

let startButton = document.getElementById("start");
startButton.addEventListener('click', startGame);

let latitude = document.getElementById("latitude");
let latVal = document.getElementById("latVal");
let longitude = document.getElementById("longitude");


$("#myModal").on('hidden.bs.modal', function () {
    $("#youWon").css("display", "none")
    $("#guessBtn").css("display", "block")
});

$("#guessBtn").on('click', function () {

    if (event.target.tagName === "BUTTON") {
        let clickedCounty = event.target.id
        event.target.disabled = true
        winTest(clickedCounty)
    }

});

$("#quit").on('click', function () {


    $("#countyVal").text(correctCounty)
    $("#townVal").html(correctTown)
    $("#latVal").text(startLat.toFixed(4))
    $("#longVal").text(startLon.toFixed(4))

    startButton.disabled = false;
    quit.disabled = true;
    guess.disabled = true;
});

$("#zoomIn").on('click', function () {
    zoom("in");
});

$("#zoomOut").on('click', function () {
    zoom("out");
});

function zoom(way) {

    if (way === "in") {
        currentZoom += 1
    }
    else {
        currentZoom += -1
        changeScore(-50)
    }
    map.setZoom(currentZoom)

}



$("#north").on('click', function () {
    travel("north");
});

$("#west").on('click', function () {
    travel("west");
});

$("#east").on('click', function () {
    travel("east");
});

$("#south").on('click', function () {
    travel("south");
});

$("#southeast").on('click', function () {
    travel("southeast");
});

$("#southwest").on('click', function () {
    travel("southwest");
});

$("#northeast").on('click', function () {
    travel("northeast");
});

$("#northwest").on('click', function () {
    travel("northwest");
});

$("#center").on('click', function () {
    travel("home");
});



let startLat, startLon;
let currLat, currLon;
let correctCounty;
let correctTown;

let score = 1000;


// var map = L.map('map').setView([44.050254, -72.575367], 7);

let currentZoom
let gameZoom = 15
let openZoom = 7

var map = L.map("map", {
    center: [44.050254, -72.575367],
    zoom: openZoom,
    fadeAnimation: true,
    zoomAnimation: true
});

map.dragging.disable()

var carmenIcon = L.icon({
    iconUrl: './carmenOldSchool.png',
    iconSize: [60, 105],
    iconAnchor: [30, 105],
    popupAnchor: [0, -105]
});


var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    // attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

Esri_WorldImagery.addTo(map)

// L.marker([44.260254, -72.575367]).addTo(map)
//     .bindPopup('Monteplier, VT.')
//     .openPopup();

let fullStateLayer = L.geoJson(border_data);

fullStateLayer.addTo(map)
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
if (map.tap) map.tap.disable();
document.getElementById('map').style.cursor = 'default';


function startGame() {



    if (marker != undefined) {
        marker.remove();
    }


    startButton.disabled = true;
    quit.disabled = false;
    guess.disabled = false;

    latVal.textContent = "?"

    longVal.textContent = "?"

    countyVal.textContent = "?"

    townVal.textContent = "?"

    score = 1000
    $("#scoreVal").text(score);

    getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])

    getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])

    pipTest(startLat, startLon);
    correctTown = getTown(startLat, startLon);
}

function getTown(lat, lon) {
    let layer = L.geoJson(town_data);
    let results = leafletPip.pointInLayer([lon, lat], layer);
    results = results[0]
    results = results.feature.properties["TOWNNAMEMC"]
    console.log(results)
    return results
}

function pipTest(lat, lon) {

    let layer = L.geoJson(border_data);
    let results = leafletPip.pointInLayer([lon, lat], layer);

    if (results.length === 0) {
        getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])

        getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])

        pipTest(startLat, startLon);
    } else {
        setStartPoint()
    }
}

function setStartPoint() {

    fullStateLayer.remove();
    currentZoom = gameZoom

    map.setView([startLat, startLon], currentZoom, {
        pan: {
            animate: true,
            duration: 1
        },
        zoom: {
            animate: true
        }
    });




    marker = L.marker([startLat, startLon], { icon: carmenIcon });
    currLat = startLat
    currLon = startLon
    marker.addTo(map);
    marker.bindPopup("Where am I?").openPopup();

    gameState = "playing"


    fetch('https://nominatim.openstreetmap.org/reverse?lat=' + startLat + '&lon=' + startLon + '&format=json')
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonResponse) {
            correctCounty = jsonResponse.address.county.replace(" County", "");
            console.log(correctCounty + " is the County")
            return jsonResponse
        })



    enableZoomDirCountyButtons()


}

function enableZoomDirCountyButtons() {

    $("#direction-buttons button").each(function (index) {
        $(this).prop('disabled', false)
    })

    $("#zoom-buttons button").each(function (index) {
        $(this).prop('disabled', false)
    })

    $("#guessBtn button").each(function (index) {
        $(this).prop('disabled', false)
    })
}


function getRandomLat(min, max) {
    startLat = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomLon(min, max) {
    startLon = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive 
}

function travel(direction) {

    let shiftDistance = .0015

    let shiftDisForDiag = Math.sqrt(Math.pow(.0015, 2) / 2)
    switch (direction) {
        case "north":
            currLat += shiftDistance
            changeScore(-1);
            break;
        case "south":
            currLat += -1 * shiftDistance
            changeScore(-1);
            break;
        case "east":
            currLon += shiftDistance
            changeScore(-1);
            break;
        case "west":
            currLon += -1 * shiftDistance
            changeScore(-1);
            break;
        case "northeast":
            currLon += shiftDisForDiag
            currLat += shiftDisForDiag
            changeScore(-1);
            break;
        case "southeast":
            currLon += shiftDisForDiag
            currLat += -1 * shiftDisForDiag
            changeScore(-1);
            break;
        case "northwest":
            currLon += -1 * shiftDisForDiag
            currLat += shiftDisForDiag
            changeScore(-1);
            break;
        case "southwest":
            currLon += -1 * shiftDisForDiag
            currLat += -1 * shiftDisForDiag
            break;
        case "home":
            currLat = startLat
            currLon = startLon
            break;

    }
    map.setView([currLat, currLon]);
}

function changeScore(pointDifference) {
    if (gameState === "playing") {
        score += pointDifference;
        $("#scoreVal").text(score);
    }
}

function winTest(clickedCounty) {
    if (clickedCounty === correctCounty) {
        gameState = "over"
        $("#youWon").text("YOU WON!!!")
        $("#youWon").css("display", "block")
        $("#guessBtn").css("display", "none")

        $("#countyVal").text(correctCounty)

        $("#townVal").html(correctTown)

        $("#latVal").text(startLat.toFixed(4))

        $("#longVal").text(startLon.toFixed(4))

        startButton.disabled = false;
        quit.disabled = true;
        guess.disabled = true;
    }

    else {
        changeScore(-150)
        $("#youWon").css("display", "block")
        $("#guessBtn").css("display", "none")
        $("#youWon").text("Wrong! Lose 150 Points!")
    }
}


