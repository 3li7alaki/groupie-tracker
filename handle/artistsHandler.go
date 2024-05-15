package handle

import (
	"encoding/json"
	"groupie/data"
	"net/http"
)

func artistsHandler(w http.ResponseWriter, r *http.Request) {
	// Write the artists to the response
	err := json.NewEncoder(w).Encode(data.Artists)
	if err != nil {
		internalServerError(w, r)
		return
	}
	return
}
