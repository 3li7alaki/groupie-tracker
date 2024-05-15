package handle

import (
	"net/http"
)

func RegisterRoutes() {
	// Index Page
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			notFound(w, r)
		} else {
			indexHandler(w, r)
		}
	})

	// Get Artists
	http.HandleFunc("/artists", artistsHandler)

	// Artist Page
	http.HandleFunc("/artist", artistHandler)

	// Static Files
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("./templates/css"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("./templates/images"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./templates/js"))))
}
