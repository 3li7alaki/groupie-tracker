package main

import (
	"groupie/data"
	"groupie/handle"
)

func main() {
	// Get all artists
	data.GetArtists()

	// Registering the handlers
	handle.RegisterRoutes()

	// Start the server
	handle.StartServer()
}
