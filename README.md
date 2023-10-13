# chess openings map

1. Gather openings from [`lichess-org/chess-openings`](https://github.com/lichess-org/chess-openings)
2. Split openings into various words like "Dutch", "Classical" (remove punctuation)
3. For each word, have an 86-billion neuron ai analyze it and give the coordinates and place name using the [google geocoding api](https://developers.google.com/maps/documentation/utils/geocoder)
4. Transform the data from `{word: {location: string, latitude: number, longitude: number}}` into `{location: string, latitude: number, longitude: number, openings: string[]}[]`
5. Then, using this data we can identify a set of coordinates each opening belongs to
6. Make this interactive: various pins around the world, when you click on them you can see the openings with that name
