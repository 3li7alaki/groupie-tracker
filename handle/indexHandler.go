package handle

import (
	"html/template"
	"net/http"
)

func indexHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the template
	tmp, err := template.ParseFiles("templates/index.html")
	if err != nil {
		internalServerError(w, r)
	}

	// Execute the template with the artists data
	err = tmp.Execute(w, nil)
	if err != nil {
		internalServerError(w, r)
	}
}
