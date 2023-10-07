# `{word: {location: string, latitude: number, longitude: number}}` into `{location: {latitude: number, longitude: number, openings: {name: string, pgn: string}[]}}

import json
import csv
from typing import TypedDict

with open("./data/openings.tsv", "r") as f:
    openings: list[list[str]] = list(csv.reader(f, delimiter='\t'))

class LocationData(TypedDict):
    latitude: float
    longitude: float
    location: str

with open("./data/word-locations.json", "r") as f:
    locations_data: dict[str, LocationData] = json.load(f)


# print(locations_data)

class Opening(TypedDict):
    name: str
    pgn: str

class OpeningLocationData(TypedDict):
    latitude: float
    longitude: float
    openings: list[Opening]


transformed: dict[str, OpeningLocationData] = {}


for opening in openings:
    [eco, name, pgn] = opening
    name_words = name.replace(':','').replace(',', '').replace("'s", '').replace('-', ' ').split(' ')
    name_locations = [locations_data[loc] for loc in name_words if loc in locations_data]

    # we now have a list of locations associated with the current opening

    for name_location in name_locations:
        if name_location["location"] not in transformed:
            transformed[name_location["location"]] = {'latitude': name_location['latitude'], 'longitude': name_location['longitude'], 'openings': [{'name': name, 'pgn': pgn}]}
        else:
            transformed[name_location["location"]]['openings'].append({'name': name, 'pgn': pgn})

print(json.dumps(transformed))