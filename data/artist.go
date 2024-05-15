package data

import (
	"encoding/json"
	"log"
	"net/http"
)

type Artist struct {
	ID            int      `json:"id"`
	Image         string   `json:"image"`
	Name          string   `json:"name"`
	Members       []string `json:"members"`
	CreationDate  int      `json:"creationDate"`
	FirstAlbum    string   `json:"firstAlbum"`
	TourLocations map[string][]string
}

var Artists []Artist

func GetArtists() {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/artists")
	if err != nil {
		log.Fatal(err)
		return
	}
	defer resp.Body.Close()

	var artists []Artist

	if err := json.NewDecoder(resp.Body).Decode(&artists); err != nil {
		log.Fatal(err)
		return
	}

	relations := GetRelations()
	for i := range artists {
		artists[i].AddRelations(relations[i])
	}

	Artists = artists
	return
}

func GetArtistByID(id int) *Artist {
	for _, artist := range Artists {
		if artist.ID == id {
			return &artist
		}
	}
	return nil
}

func (a *Artist) AddRelations(relation Relation) {
	a.TourLocations = relation.DatesLocations
}

func (a *Artist) GetLocations() []string {
	var locations []string
	for location := range a.TourLocations {
		locations = append(locations, location)
	}
	return locations
}

func (a *Artist) GetDates(location string) []string {
	return a.TourLocations[location]
}

func (a *Artist) Print() {
	log.Printf("ID: %d\n", a.ID)
	log.Printf("Image: %s\n", a.Image)
	log.Printf("Name: %s\n", a.Name)
	log.Printf("Members: %v\n", a.Members)
	log.Printf("Creation Date: %d\n", a.CreationDate)
	log.Printf("First Album: %s\n", a.FirstAlbum)
	log.Printf("Locations: %v\n", a.GetLocations())
	log.Printf("Dates: %v\n", a.TourLocations)
}
