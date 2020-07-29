import { GoogleMap, Marker } from '@react-google-maps/api'
import React from 'react'
import { PlaceWithLatLng } from '../types'
import mapTypeStyles from '../utils/mapTypeStyles'

interface Props {
    antipode?: boolean
    places: PlaceWithLatLng[]
}

const containerStyle: React.CSSProperties = { width: '100%', height: '100%' }

const getLatLng = ({ lng, lat }: google.maps.LatLngLiteral, antipode?: boolean) => {
    if (antipode) {
        return {
            lat: -1 * lat,
            lng: Number(lng) < 0 ? -1 * (Math.abs(lng) - 180) : Math.abs(lng) - 180
        }
    }
    return { lng, lat }
}
const getMarker = (i: number) => require(`../assets/pins/pin-${(i % 8) + 1}.png`)

const Map: React.FC<Props> = ({ places, antipode }) => {
    const mapRef = React.useRef<google.maps.Map>()

    const center: google.maps.LatLngLiteral = getLatLng(
        places[0] ?? {
            lat: -34.397,
            lng: 150.644
        },
        antipode
    )

    React.useEffect(() => {
        fitBounds()
    }, [places])

    const fitBounds = () => {
        const bounds = new window.google.maps.LatLngBounds()
        places.forEach((l) => bounds.extend(getLatLng(l, antipode)))
        mapRef.current?.fitBounds(bounds)
    }

    const onLoad = (map: google.maps.Map) => {
        mapRef.current = map
        mapRef.current.setOptions({
            styles: mapTypeStyles
        })
        fitBounds()
    }

    return (
        <GoogleMap onLoad={onLoad} zoom={8} mapContainerStyle={containerStyle} center={center}>
            {places.map((place, i) => (
                <Marker key={i} position={getLatLng(place, antipode)} icon={getMarker(i)} />
            ))}
        </GoogleMap>
    )
}

export default Map
