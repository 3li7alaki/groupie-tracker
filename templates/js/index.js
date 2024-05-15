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
    let search = document.querySelector('.search').value;
    // let creationDate = document.querySelector('.creation-date').value;
    // let firstAlbum = document.querySelector('.first-album').value;
    // let memberCount = document.querySelector('.member-count').value;
    // let concertLocations = document.querySelector('.concert-locations').value;

    // let filtered = search || creationDate || firstAlbum || memberCount || concertLocations;
    let filtered = search;

    if (!filtered) {
        fillCards(artists);
        return;
    }

    let filteredArtists = artists.filter(artist => {
        let searchMatch = artist.name.toLowerCase().includes(search.toLowerCase());
        // let creationDateMatch = artist.creationDate.includes(creationDate);
        // let firstAlbumMatch = artist.firstAlbum.includes(firstAlbum);
        return searchMatch;
    });

    let cards = document.querySelector('.cards');
    cards.innerHTML = '';
    if (filteredArtists.length === 0) {
        let noResults = document.createElement('h2');
        noResults.classList.add('no-results');
        noResults.textContent = 'No results found';
        cards.appendChild(noResults);
        return;
    } else {
        fillCards(filteredArtists);
    }

    // Update URL
    let url = new URL(window.location.href);
    search ? url.searchParams.set('search', search) : url.searchParams.delete('search');
    // url.searchParams.set('creationDate', creationDate);
    // url.searchParams.set('firstAlbum', firstAlbum);
    // url.searchParams.set('memberCount', memberCount);
    // url.searchParams.set('concertLocations', concertLocations);
    window.history.pushState({}, '', url);
}

function getFilters() {
    let url = new URL(window.location.href);
    let search = url.searchParams.get('search');
    let creationDate = url.searchParams.get('creationDate');
    let firstAlbum = url.searchParams.get('firstAlbum');
    let memberCount = url.searchParams.get('memberCount');
    let concertLocations = url.searchParams.get('concertLocations');

    let filtered = search || creationDate || firstAlbum || memberCount || concertLocations;

    if (filtered) {
        document.querySelector('.search').value = search;
        // document.querySelector('.creation-date').value = creationDate;
        // document.querySelector('.first-album').value = firstAlbum;
        // document.querySelector('.member-count').value = memberCount;
        // document.querySelector('.concert-locations').value = concertLocations;
    }

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
    // let creationDate = document.querySelector('.creation-date');
    // let firstAlbum = document.querySelector('.first-album');
    // let memberCount = document.querySelector('.member-count');
    // let concertLocations = document.querySelector('.concert-locations');

    search.addEventListener('input', debounce(filter, 200));
    // creationDate.addEventListener('onchange', filter);
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

        cardBack.addEventListener('dblclick', function () {
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