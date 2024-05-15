const API_KEY= "AIzaSyCxuBywJ3pwTcJ5Kx-jzVgPDHxcC5DAmcQ";

let locations;
let map;
let geocoder;
let infoWindow;

async function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 26.18419175, lng: 50.559938333333335 },
        zoom: 8,
        mapId: 'concert_map'
    });

    geocoder = new google.maps.Geocoder();
    infoWindow = new google.maps.InfoWindow();

    getLocations();
}



function getLocations() {
    let list = [...document.querySelectorAll(".location")]
    locations = list.map((location) => {
        return location.innerHTML.split("\n")[0];
    });

    locations.forEach(location => {
        geocodeAndAddMarker(location);
    });
}

function geocodeAndAddMarker(location) {
    geocoder.geocode({ 'address': location.replace(/_/g, ' ') }, function(results, status) {
        if (status === 'OK') {
            const disc = document.createElement("img");
            disc.src = "images/marker.png";
            disc.style.width = "30px";
            const marker = new google.maps.marker.AdvancedMarkerElement({
                map: map,
                position: results[0].geometry.location,
                title: location.replace(/_/g, ' ').replace(/-/g, ', ').replace(/\b\w/g, l => l.toUpperCase()),
                content: disc
            });

            map.setCenter(results[0].geometry.location);

            marker.addListener("click", ({ domEvent, latLng }) => {
                const { target } = domEvent;
                // Jump to the marker
                map.panTo(latLng);
                // Animate the marker
                infoWindow.close();
                infoWindow.setContent(marker.title)
                infoWindow.open(marker.map, marker);
            })
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}