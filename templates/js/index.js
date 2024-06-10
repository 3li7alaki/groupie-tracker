let artists = [];

init();

// Initiate Page
function init() {
    getArtists().then(() => {
        getFilters();
        addFilterEvents();
    });
}

// Asynchronously fill the cards
async function filter() {
    await loading(500);

    let url = new URL(window.location.href);
    let search = document.querySelector('.search').value;
    let creationMin = document.querySelector('.creation-min').value;
    let creationMax = document.querySelector('.creation-max').value;
    let memberCount = [...document.querySelectorAll('.member-count')].filter(member => member.checked).map(member => member.dataset.count);
    let firstAlbumMin = document.querySelector('.first-album-min').value;
    let firstAlbumMax = document.querySelector('.first-album-max').value;
    let tourLocation = document.querySelector('.tour-location').value;

    let filtered = search || creationMin || creationMax || memberCount.length > 0 || firstAlbumMin || firstAlbumMax || tourLocation;

    if (!filtered) {
        fillCards(artists);
        url.search = '';
        window.history.pushState({}, '', url);
        return;
    }

    let filteredArtists = artists.filter(artist => {
        let searchMatch = search ? inSearch(artist, search.toLowerCase()) : true;
        let creationMinMatch = creationMin ? Date.parse(artist.creationDate) >= Date.parse(creationMin+'-01-01') : true;
        let creationMaxMatch = creationMax ? Date.parse(artist.creationDate) <= Date.parse(creationMax+'-12-31') : true;
        let memberCountMatch = memberCount.length > 0 ? memberCount.includes(artist.members.length.toString()) : true;
        let firstAlbumMinMatch = firstAlbumMin ? Date.parse(artist.firstAlbum.split('-')[2]+'-01-01') >= Date.parse(firstAlbumMin+'-01-01') : true;
        let firstAlbumMaxMatch = firstAlbumMax ? Date.parse(artist.firstAlbum.split('-')[2]+'-01-01') <= Date.parse(firstAlbumMax+'-12-31') : true;
        let tourLocationMatch = tourLocation ? artist.GeoLocations.includes(tourLocation) : true;

        return searchMatch && creationMinMatch && creationMaxMatch && memberCountMatch && firstAlbumMinMatch && firstAlbumMaxMatch && tourLocationMatch;
    });

    let cards = document.querySelector('.cards');
    cards.innerHTML = '';
    if (filteredArtists.length === 0) {
        let noResults = document.createElement('h2');
        noResults.classList.add('no-results');
        noResults.textContent = 'No results found';
        cards.appendChild(noResults);
    } else {
        fillCards(filteredArtists);
    }



    // Update URL
    search ? url.searchParams.set('search', search) : url.searchParams.delete('search');
    creationMin ? url.searchParams.set('creationMin', creationMin) : url.searchParams.delete('creationMin');
    creationMax ? url.searchParams.set('creationMax', creationMax) : url.searchParams.delete('creationMax');
    memberCount.length > 0 ? url.searchParams.set('memberCount', memberCount) : url.searchParams.delete('memberCount');
    firstAlbumMin ? url.searchParams.set('firstAlbumMin', firstAlbumMin) : url.searchParams.delete('firstAlbumMin');
    firstAlbumMax ? url.searchParams.set('firstAlbumMax', firstAlbumMax) : url.searchParams.delete('firstAlbumMax');
    tourLocation ? url.searchParams.set('tourLocation', tourLocation) : url.searchParams.delete('tourLocation');
    window.history.pushState({}, '', url);
}

function getFilters() {
    let url = new URL(window.location.href);
    let search = url.searchParams.get('search');
    let creationMin = url.searchParams.get('creationMin');
    let creationMax = url.searchParams.get('creationMax');
    let memberCount = url.searchParams.get('memberCount');
    let firstAlbumMin = url.searchParams.get('firstAlbumMin');
    let firstAlbumMax = url.searchParams.get('firstAlbumMax');
    let tourLocation = url.searchParams.get('tourLocation');

    let filtered = search || creationMin || creationMax || memberCount || firstAlbumMin || firstAlbumMax || tourLocation;

    if (filtered) {
        document.querySelector('.search').value = search;
        document.querySelector('.creation-min').value = creationMin;
        document.querySelector('.creation-max').value = creationMax;
        memberCount ? memberCount.split(',').forEach(count => document.querySelector(`.member-count[data-count="${count}"]`).checked = true) : null;
        document.querySelector('.first-album-min').value = firstAlbumMin;
        document.querySelector('.first-album-max').value = firstAlbumMax;
        document.querySelector('.tour-location').value = tourLocation;
    }

    filter();
}

// Clear the filters
function clearFilters() {
    document.querySelector('.search').value = '';
    document.querySelector('.creation-min').value = '';
    document.querySelector('.creation-max').value = '';
    document.querySelector('.first-album-min').value = '';
    document.querySelector('.first-album-max').value = '';
    document.querySelectorAll('.member-count').forEach(member => member.checked = false);
    document.querySelector('.tour-location').value = '';
    filter();
}

async function getArtists() {
    // Get the data from the API and return it
    await fetch('/artists')
        .then(response => response.json())
        .then(data => {
            artists = data;
        });
}

function addFilterEvents() {
    let search = document.querySelector('.search');
    let creationMin = document.querySelector('.creation-min');
    let creationMax = document.querySelector('.creation-max');
    let memberCount = document.querySelectorAll('.member-count');
    let firstAlbumMin = document.querySelector('.first-album-min');
    let firstAlbumMax = document.querySelector('.first-album-max');
    let tourLocation = document.querySelector('.tour-location');

    search.addEventListener('change', debounce(filter, 200));
    search.addEventListener('input', debounce(suggest, 200));
    search.addEventListener('focus', function() {
        this.active = true;
        suggest();
    });
    search.addEventListener('blur', function() {
        this.active = false;
        setTimeout(() => {
            document.querySelector('.suggestions').style.display = 'none';
        }, 200);
    });
    creationMin.addEventListener('input', debounce(filter, 200));
    creationMax.addEventListener('input', debounce(filter, 200));
    memberCount.forEach(member => member.addEventListener('change', debounce(filter, 200)));
    firstAlbumMin.addEventListener('input', debounce(filter, 200));
    firstAlbumMax.addEventListener('input', debounce(filter, 200));
    tourLocation.addEventListener('input', debounce(filter, 200));
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    }
}

function fillCards(artists) {
    let cards = document.querySelector('.cards');
    cards.innerHTML = '';
    // Fill the cards with the data
    createCards(artists);
    addCardBackEvents();
}

function createCards(artists) {
    let cards = document.querySelector('.cards');
    artists.forEach(
        artist => {
            let card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img class="album-cover" src="${artist.image}" alt="${artist.name}">
                    </div>
                    <div class="card-back">
                        <div class="card-back-disc" data-id="${artist.id}"></div>
                        <h3 class="artist-name">${artist.name}</h3>
                    </div>
                </div>
            `;
            cards.appendChild(card);
        }
    )
}

function addCardBackEvents() {
    let isMouseDown = false;
    let cardBackElements = document.querySelectorAll('.card-back-disc');

    cardBackElements.forEach(cardBack => {
        cardBack.addEventListener('mousedown', function(event) {
            isMouseDown = true;
            this.style.animationPlayState = 'paused'; // Pause the spinning animation
            this.style.cursor = 'grabbing'; // Change the cursor to indicate the user can grab the disc

            let currentDegree = getCurrentRotation(this);
            let center = {x: event.movementX, y: event.movementY};


            cardBack.addEventListener('mousemove', function(e) {
                if (isMouseDown) {
                    let radians = Math.atan2(e.pageX - center.x, e.pageY - center.y);
                    if (radians < 0) {
                        currentDegree += 2;
                    } else {
                        currentDegree -= 2;
                    }
                    cardBack.style.animation = 'none'; // Remove the spinning animation
                    cardBack.style.transform = `rotate(${currentDegree}deg)`;
                    center = {x: e.pageX, y: e.pageY};
                    document.documentElement.style.setProperty('--start-angle', `${currentDegree}deg`);
                }
            });
        });

        cardBack.addEventListener('mouseup', function() {
            isMouseDown = false;
            this.style.animation = 'spin 4s infinite linear'; // Add the spinning animation back
            this.style.animationPlayState = 'running'; // Resume the spinning animation
            this.style.cursor = 'grab'; // Change the cursor back to the hand
        });

        cardBack.addEventListener('mouseleave', function() {
            if (isMouseDown) {
                document.documentElement.style.setProperty('--start-angle', `${getCurrentRotation(this)}deg`);
                this.style.animation = 'spin 4s infinite linear'; // Add the spinning animation back
                this.style.animationPlayState = 'running'; // Resume the spinning animation if the user leaves while holding the click
                this.style.cursor = 'grab'; // Change the cursor back to the hand
            }
        });

        cardBack.addEventListener('dblclick', async function () {
            await loading(1000);
            let dataId = cardBack.getAttribute('data-id');
            window.location.href = '/artist?id=' + dataId;
        })
    });
}

function getCurrentRotation(el) {
    let st = window.getComputedStyle(el, null);
    let tr = st.getPropertyValue("-webkit-transform") ||
        st.getPropertyValue("-moz-transform") ||
        st.getPropertyValue("-ms-transform") ||
        st.getPropertyValue("-o-transform") ||
        st.getPropertyValue("transform") ||
        "fail...";

    if (tr !== "none") {
        let values = tr.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');
        let a = values[0];
        let b = values[1];


        let scale = Math.sqrt(a*a + b*b);

        let radians = Math.atan2(b, a);
        if ( radians < 0 ) {
            radians += (2 * Math.PI);
        }
        var angle = Math.round( radians * (180/Math.PI));

    } else {
        angle = 0;
    }

    return angle;
}

async function loading(time) {
    document.querySelector('.loading').style.display = 'block';
    await new Promise(resolve => setTimeout(resolve, time));
    document.querySelector('.loading').style.display = 'none';
}

function inSearch(artist, search) {
    let inSearch = false;
    // Check if search term is in any of the artists location
    let artistLocations = artist.GeoLocations;
    artistLocations.forEach(location => {
        if (location.toLowerCase().includes(search)) {
            inSearch = true;
        }
    });

    // Check if search term is in artist name
    if (artist.name.toLowerCase().includes(search)) {
        inSearch = true;
    }

    // Check if search term is in artist members
    let artistMembers = artist.members;
    artistMembers.forEach(member => {
        if (member.toLowerCase().includes(search)) {
            inSearch = true;
        }
    });

    // Check if search term is in artist creation date
    if (artist.creationDate.toString().includes(search)) {
        inSearch = true;
    }

    // Check if search term is in artist first album date
    if (artist.firstAlbum.includes(search) && search.length > 4) {
        inSearch = true;
    }

    return inSearch;
}

function suggest() {
    let search = document.querySelector('.search').value.toLowerCase();
    let suggestionsBox = document.querySelector('.suggestions');
    suggestionsBox.innerHTML = '';

    if (!search || document.querySelector('.search').active === false) {
        suggestionsBox.style.display = 'none';
        return;
    }

    let suggestions = [];
    artists.forEach(artist => {
        artist.name.toLowerCase().indexOf(search) === 0 ? suggestions.push({type: 'Artist/Band', value: artist.name}) : null;
        artist.members.forEach(member => member.toLowerCase().indexOf(search) === 0 ? suggestions.push({
            type: 'Artist/Member',
            value: member
        }) : null);
        artist.creationDate.toString().includes(search) ? suggestions.push({
            type: 'Creation Date',
            value: artist.creationDate
        }) : null;
        artist.firstAlbum.includes(search) ? suggestions.push({type: 'First Album', value: artist.firstAlbum}) : null;
    });

    if (search.length > 3) {
        let locations = [...document.querySelectorAll('.location')].map(location => location.value);
        locations.forEach(location => location.toLowerCase().includes(search) ? suggestions.push({
            type: 'Location',
            value: location
        }) : null);
    }

    suggestions.length > 0 ? suggestionsBox.style.display = 'block' : suggestionsBox.style.display = 'none';

    suggestions = suggestions.filter((suggestion, index, self) =>
            index === self.findIndex(t => (
                t.type === suggestion.type && t.value === suggestion.value
            ))
    );

    suggestions.forEach(suggestion => {
        let suggestionElement = document.createElement('div');
        suggestionElement.classList.add('suggestion');
        let typeElement = document.createElement('span');
        typeElement.classList.add('type');
        typeElement.textContent = suggestion.type;
        let valueElement = document.createElement('span');
        valueElement.classList.add('value');
        valueElement.textContent = suggestion.value;
        suggestionElement.appendChild(valueElement);
        suggestionElement.appendChild(typeElement);

        suggestionElement.addEventListener('click', function() {
            document.querySelector('.search').value = suggestion.value;
        });
        suggestionsBox.appendChild(suggestionElement);
    });
}