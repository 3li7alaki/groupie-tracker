package handle

import (
	"html/template"
	"net/http"
)

type Error struct {
	Name    string
	Status  int
	Message string
}

func errorHandler(w http.ResponseWriter, r *http.Request, e *Error) {
	// Parse the template
	tmp, err := template.ParseFiles("templates/error.html")
	if err != nil {
		http.Error(w, e.Message, e.Status)
		return
	}

	// Execute the template with the error data
	w.WriteHeader(e.Status)
	err = tmp.Execute(w, e)
	if err != nil {
		http.Error(w, e.Message, e.Status)
		return
	}
}

func notFound(w http.ResponseWriter, r *http.Request) {
	e := &Error{
		Name:    "Not Found",
		Status:  http.StatusNotFound,
		Message: "Not Found",
	}
	errorHandler(w, r, e)
}

func badRequest(w http.ResponseWriter, r *http.Request, message string) {
	e := &Error{
		Name:    "Bad Request",
		Status:  http.StatusBadRequest,
		Message: message,
	}
	errorHandler(w, r, e)
}

func internalServerError(w http.ResponseWriter, r *http.Request) {
	e := &Error{
		Name:    "Internal Server Error",
		Status:  http.StatusInternalServerError,
		Message: "Internal Server Error",
	}
	errorHandler(w, r, e)
}

func methodNotAllowed(w http.ResponseWriter, r *http.Request) {
	e := &Error{
		Name:    "Method Not Allowed",
		Status:  http.StatusMethodNotAllowed,
		Message: "Method Not Allowed",
	}
	errorHandler(w, r, e)
}
