package handle

import (
	"groupie/data"
	"html/template"
	"net/http"
	"os"
)

func indexHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the template
	_, err := os.Stat("templates/index.html")
	if err != nil {
		internalServerError(w, r, err)
		return
	}
	tmp, err := template.ParseFiles("templates/index.html")
	if err != nil {
		internalServerError(w, r, err)
	}

	// Execute the template with the artists data
	err = tmp.Execute(w, data.Locations)
	if err != nil {
		internalServerError(w, r, err)
	}
}
