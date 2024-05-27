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
    let firstAlbum = document.querySelector('.first-album').value;

    // let concertLocations = document.querySelector('.concert-locations').value;

    // let filtered = search || creationDate || firstAlbum || memberCount || concertLocations;
    let filtered = search || creationMin || creationMax || memberCount.length > 0 || firstAlbum;

    if (!filtered) {
        fillCards(artists);
        url.search = '';
        window.history.pushState({}, '', url);
        return;
    }

    let filteredArtists = artists.filter(artist => {
        let searchMatch = search ? artist.name.toLowerCase().includes(search.toLowerCase()) : true;
        let creationMinMatch = creationMin ? Date.parse(artist.creationDate) >= Date.parse(creationMin) : true;
        let creationMaxMatch = creationMax ? Date.parse(artist.creationDate) <= Date.parse(creationMax) : true;
        let memberCountMatch = memberCount.length > 0 ? memberCount.includes(artist.members.length.toString()) : true;

        let firstAlbumMatch = true;
        if (firstAlbum) {
            let firstAlbumDate = new Date(firstAlbum+'-01');
            let artistFirstAlbumDate = new Date(artist.firstAlbum);
            firstAlbumMatch = firstAlbumDate.getFullYear() === artistFirstAlbumDate.getFullYear() && firstAlbumDate.getMonth() === artistFirstAlbumDate.getMonth();
        }

        return searchMatch && creationMinMatch && creationMaxMatch && memberCountMatch && firstAlbumMatch;
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
    firstAlbum ? url.searchParams.set('firstAlbum', firstAlbum) : url.searchParams.delete('firstAlbum');
    // url.searchParams.set('memberCount', memberCount);
    // url.searchParams.set('concertLocations', concertLocations);
    window.history.pushState({}, '', url);
}

function getFilters() {
    let url = new URL(window.location.href);
    let search = url.searchParams.get('search');
    let creationMin = url.searchParams.get('creationMin');
    let creationMax = url.searchParams.get('creationMax');
    let memberCount = url.searchParams.get('memberCount');
    let firstAlbum = url.searchParams.get('firstAlbum');
    let concertLocations = url.searchParams.get('concertLocations');

    let filtered = search || creationMin || creationMax || memberCount || firstAlbum;

    if (filtered) {
        document.querySelector('.search').value = search;
        document.querySelector('.creation-min').value = creationMin;
        document.querySelector('.creation-max').value = creationMax;
        memberCount ? memberCount.split(',').forEach(count => document.querySelector(`.member-count[data-count="${count}"]`).checked = true) : null;
        document.querySelector('.first-album').value = firstAlbum;
        // document.querySelector('.first-album').value = firstAlbum;
        // document.querySelector('.member-count').value = memberCount;
        // document.querySelector('.concert-locations').value = concertLocations;
    }

    filter();
}

// Clear the filters
function clearFilters() {
    document.querySelector('.search').value = '';
    document.querySelector('.creation-min').value = '';
    document.querySelector('.creation-max').value = '';
    document.querySelector('.first-album').value = '';
    document.querySelectorAll('.member-count').forEach(member => member.checked = false);
    // document.querySelector('.member-count').value = '';
    // document.querySelector('.concert-locations').value = '';
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
    let firstAlbum = document.querySelector('.first-album');
    // let memberCount = document.querySelector('.member-count');
    // let concertLocations = document.querySelector('.concert-locations');

    search.addEventListener('input', debounce(filter, 200));
    creationMin.addEventListener('input', debounce(filter, 200));
    creationMax.addEventListener('input', debounce(filter, 200));
    memberCount.forEach(member => member.addEventListener('change', debounce(filter, 200)));
    firstAlbum.addEventListener('input', debounce(filter, 200));
    // firstAlbum.addEventListener('onchange', filter);
    // memberCount.addEventListener('onchange', filter);
    // concertLocations.addEventListener('onchange', filter);
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