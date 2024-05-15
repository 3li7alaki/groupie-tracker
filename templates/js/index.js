let artists = getArtists();

init();

// Initiate Page
function init() {
    fillCards(artists);
}

// Asynchronously fill the cards
function filter() {
    let search = document.querySelector('.search').value;
    let filteredArtists = artists.filter(artist => artist.name.toLowerCase().includes(search.toLowerCase()));
    let cards = document.querySelector('.cards');
    cards.innerHTML = '';
    fillCards(filteredArtists);
}

function getArtists() {
    // Get the data from the API and return it
    fetch('/artists')
        .then(response => response.json())
        .then(artists => {
            return artists;
        });
    return [];
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
                <div class="card-front">
                    <img class="album-cover" src="${artist.image}" alt="${artist.name}">
                </div>
                <div class="card-back">
                    <div class="card-back-disc" data-id="${artist.id}"></div>
                    <h3 class="artist-name">${artist.name}</h3>
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