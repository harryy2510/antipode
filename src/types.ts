export type Place = google.maps.places.AutocompletePrediction & {
    recent?: boolean
}

export type PlaceWithLatLng = Place & google.maps.LatLngLiteral
