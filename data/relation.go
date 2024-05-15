package data

import (
	"encoding/json"
	"log"
	"net/http"
)

type Index struct {
	Relations []Relation `json:"index"`
}

type Relation struct {
	ID             int                 `json:"id"`
	DatesLocations map[string][]string `json:"datesLocations"`
}

func GetRelations() []Relation {
	resp, err := http.Get("https://groupietrackers.herokuapp.com/api/relation")
	if err != nil {
		log.Fatal(err)
		return nil
	}
	defer resp.Body.Close()

	var index Index

	if err := json.NewDecoder(resp.Body).Decode(&index); err != nil {
		log.Fatal(err)
		return nil
	}

	return index.Relations
}
