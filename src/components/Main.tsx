import { Container, Fade, Grid, Theme, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import React from 'react'
import locationUrl from '../assets/location.png'
import { Place, PlaceWithLatLng } from '../types'
import LocationAutocomplete from './LocationAutocomplete'
import Map from './Map'

const useStyles = makeStyles(
    ({
        spacing,
        typography: { fontWeightMedium },
        palette: { action },
        shape: { borderRadius },
        breakpoints: { down }
    }: Theme) => ({
        root: {
            padding: spacing(8),
            backgroundImage: `url(${locationUrl})`,
            width: '100%',
            height: '100%',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,

            backgroundPosition: 'bottom center',
            backgroundSize: 360,
            backgroundRepeat: 'no-repeat',
            textAlign: 'center',
            overflow: 'auto',

            [down('sm')]: {
                padding: spacing(6, 2)
            }
        },
        heading: {
            fontWeight: fontWeightMedium,
            [down('sm')]: {
                fontSize: '1.75rem'
            }
        },
        subHeading: {
            [down('sm')]: {
                fontSize: '1.125rem'
            }
        },
        autoComplete: {
            marginBottom: spacing(2)
        },
        section: {
            marginBottom: spacing(8),
            [down('sm')]: {
                marginBottom: spacing(6)
            }
        },
        mapContainer: {
            width: '100%',
            margin: 0
        },
        mapWrapper: {
            height: 480,
            '& > div': {
                boxShadow: `2px 2px 10px ${action.disabled}`,
                borderRadius,
                overflow: 'hidden'
            },
            [down('md')]: {
                height: 360
            }
        }
    })
)

type LatLngMap = Record<string, { fetched: boolean; latLng: google.maps.LatLngLiteral | null }>
type PlaceFetchResult = {
    result: google.maps.places.PlaceResult
    place: Place
}

const Main: React.FC = () => {
    const classes = useStyles()
    const placesService = React.useRef<google.maps.places.PlacesService>(
        new window.google.maps.places.PlacesService(document.createElement('div'))
    ).current!

    const [places, setPlaces] = React.useState<Place[]>([])
    const [latLangMap, setLatLngMap] = React.useState<LatLngMap>({})
    const { placesWithLatLng, placesToFetch } = React.useMemo(() => {
        const placesWithLatLng: PlaceWithLatLng[] = []
        const placesToFetch: Promise<PlaceFetchResult>[] = []
        places.forEach((place) => {
            if (latLangMap[place.place_id]?.latLng) {
                placesWithLatLng.push({ ...place, ...latLangMap[place.place_id].latLng! })
            } else if (!latLangMap[place.place_id]?.fetched) {
                placesToFetch.push(
                    new Promise<PlaceFetchResult>((resolve) => {
                        placesService.getDetails({ placeId: place.place_id }, (result) =>
                            resolve({ result, place })
                        )
                    })
                )
            }
        })
        return { placesWithLatLng, placesToFetch }
    }, [places, latLangMap])
    React.useEffect(() => {
        if (placesToFetch.length) {
            Promise.all(placesToFetch).then((results) => {
                const newLatLngMap: LatLngMap = {}
                results.forEach((value) => {
                    newLatLngMap[value.place.place_id] = {
                        fetched: true,
                        latLng: value.result?.geometry?.location.toJSON() ?? null
                    }
                })
                setLatLngMap((existingLatLngMap) => ({
                    ...existingLatLngMap,
                    ...newLatLngMap
                }))
            })
        }
    }, [placesToFetch])

    return (
        <div className={classes.root}>
            <div className={classes.section}>
                <Typography className={classes.heading} variant="h4">
                    Antipode finder
                </Typography>
                <Typography className={classes.subHeading} color="textSecondary" variant="h5">
                    Search for the opposite side of the world
                </Typography>
            </div>
            <Container maxWidth="sm" className={classes.section}>
                <div className={classes.section}>
                    <LocationAutocomplete
                        value={places}
                        onChange={setPlaces}
                        className={classes.autoComplete}
                    />
                </div>
            </Container>
            <Fade mountOnEnter in={placesWithLatLng.length > 0}>
                <Grid container spacing={8} className={classes.mapContainer}>
                    <Grid item xs={12} md={6} className={classes.mapWrapper}>
                        <Map places={placesWithLatLng} />
                    </Grid>
                    <Grid item xs={12} md={6} className={classes.mapWrapper}>
                        <Map places={placesWithLatLng} antipode />
                    </Grid>
                </Grid>
            </Fade>
        </div>
    )
}

export default Main
