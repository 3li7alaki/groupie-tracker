# Groupie Trackers

Groupie Trackers is a web application that displays information about various music artists and bands. It fetches data from a provided API and presents it in an interactive and visually appealing way.

## Features
- Displays details about artists, including their name, image, year they began activity, date of first album, and members
- Shows the artists' last and upcoming concert locations
- Provides the dates of the artists' last and upcoming concerts
- Links the artists, dates, and locations together to provide a comprehensive view
- Offers various data visualizations such as blocks, cards, tables, lists, and graphics to present the information
- Implements a feature where a client-side action communicates with the server to retrieve information (client-server architecture)

## Technologies Used
- **Backend:** Developed using Golang to handle data manipulation and storage
- **Frontend:** Built with HTML and CSS for the site structure and styling
- **Interactivity:** Utilized JavaScript for creating events, animations, geocoding, and client-side asynchronous filtering to enhance the user experience

## Installation and Usage
1. Clone the repository: `git clone https://github.com/yourusername/groupie-trackers.git`
2. Navigate to the project directory: `cd groupie-trackers`
3. Run the application: `go run main.go`
4. Open your web browser and visit: `http://localhost:8080`

**Note:** The application requires an active internet connection to fetch data from the API.