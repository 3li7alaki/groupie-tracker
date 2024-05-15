package handle

import (
	"fmt"
	"net/http"
)

const Link = "http://localhost:8080"
const Port = ":8080"

func StartServer() {
	// Start the server
	fmt.Println("\033[36mServer Connected...\033[0m")
	fmt.Printf("\033[36mlink on: %s\033[0m\n", Link)
	fmt.Printf("\033[36mport: %s\033[0m\n", Port)

	err := http.ListenAndServe(Port, nil)
	if err != nil {
		fmt.Println("Error starting the server :", err)
	}
}
