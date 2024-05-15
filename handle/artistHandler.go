package handle

import (
	"groupie/data"
	"html/template"
	"net/http"
	"strconv"
)

const minID = 1
const maxID = 52

func artistHandler(w http.ResponseWriter, r *http.Request) {
	// Get the id from the URL
	id := r.URL.Query().Get("id")
	if id == "" {
		badRequest(w, r, "id is required")
		return
	}

	// Convert the id to an int
	idInt, err := strconv.Atoi(id)
	if err != nil {
		badRequest(w, r, "id must be an integer")
		return
	}

	// Check if the id is valid
	if !validID(idInt) {
		badRequest(w, r, "id is invalid")
		return
	}

	// Get the artist by id
	artist := data.GetArtistByID(idInt)
	if artist == nil {
		notFound(w, r)
		return
	}

	// Parse the template
	tmp, err := template.ParseFiles("templates/artist.html")
	if err != nil {
		internalServerError(w, r)
		return
	}

	// Execute the template with the artist data
	err = tmp.Execute(w, artist)
	if err != nil {
		internalServerError(w, r)
		return
	}
}

func validID(id int) bool {
	return id >= minID && id <= maxID
}
