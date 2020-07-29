import { useDebouncedCallback, useStore } from '@harryy/rehooks'
import { ListItemIcon, ListItemText, Theme } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import { HistoryOutlined, LocationOnOutlined } from '@material-ui/icons'
import Autocomplete, {
    AutocompleteProps,
    AutocompleteRenderInputParams
} from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/styles'
import parse from 'autosuggest-highlight/parse'
import { keyBy } from 'lodash-es'
import React from 'react'
import { Place } from '../types'

const useStyles = makeStyles(({ palette: { text, divider }, spacing }: Theme) => ({
    icon: {
        color: text.secondary,
        marginRight: spacing(2)
    },
    input: {
        '& .MuiInputBase-root': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: divider,
                borderWidth: 2
            },
            '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: divider
                }
            }
        }
    },
    noOptions: {
        display: 'none'
    }
}))

type RemoveKeys = 'renderInput' | 'options' | 'value' | 'onChange'

interface Props extends Omit<AutocompleteProps<Place, true, false, false>, RemoveKeys> {
    value: Place[]
    onChange: (places: Place[]) => void
}

const LocationAutocomplete: React.FC<Props> = ({ value, onChange, ...props }) => {
    const classes = useStyles()

    const [options, setOptions] = React.useState<Place[]>([])
    const [recentSearchMap, setRecentSearchMap] = useStore<Record<string, Place>>(
        'recent-search-map',
        {}
    )
    const autocompleteService = React.useRef<google.maps.places.AutocompleteService>(
        new window.google.maps.places.AutocompleteService()
    ).current!

    const [inputValue, setInputValue] = React.useState('')
    const [fetch] = useDebouncedCallback(
        (
            request: google.maps.places.AutocompletionRequest,
            callback: (result: google.maps.places.AutocompletePrediction[]) => void
        ) => autocompleteService.getPlacePredictions(request, callback),
        200
    )

    React.useEffect(() => {
        setRecentSearchMap((existingSearchMap) => {
            const newSearchMap: Record<string, Place> = {}
            value.forEach((place) => {
                newSearchMap[place.place_id] = { ...place, recent: true }
            })
            for (let placeId in existingSearchMap) {
                if (!(placeId in newSearchMap)) {
                    newSearchMap[placeId] = existingSearchMap[placeId]
                }
            }
            return newSearchMap
        })
    }, [value])
    React.useEffect(() => {
        if (inputValue === '') {
            setOptions(value)
            return
        }
        fetch({ input: inputValue }, (results: Place[]) => {
            let newOptions: Place[] = [...value]
            if (results) {
                newOptions = [...newOptions, ...results]
            }
            setOptions(newOptions)
        })
    }, [value, inputValue, fetch])

    const handleChange = React.useCallback(
        (event: React.ChangeEvent<{}>, newValue: Place[]) => onChange(newValue),
        [options]
    )
    const handleInputChange = React.useCallback(
        (event: React.ChangeEvent<{}>, newInputValue: string) => setInputValue(newInputValue),
        []
    )
    const renderOption = React.useCallback((option: Place) => {
        const primaryText = (() => {
            if (option.recent) {
                return option.structured_formatting.main_text
            }
            const matches = option.structured_formatting.main_text_matched_substrings
            const parts = parse(
                option.structured_formatting.main_text,
                matches.map((match) => [match.offset, match.offset + match.length])
            )
            return parts.map((part, index) => (
                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                    {part.text}
                </span>
            ))
        })()

        return (
            <>
                <ListItemIcon>
                    {option.recent ? (
                        <HistoryOutlined className={classes.icon} />
                    ) : (
                        <LocationOnOutlined className={classes.icon} />
                    )}
                </ListItemIcon>
                <ListItemText
                    primaryTypographyProps={{ variant: 'body1' }}
                    primary={primaryText}
                    secondary={option.structured_formatting.secondary_text}
                />
            </>
        )
    }, [])
    const renderInput = React.useCallback(
        (params: AutocompleteRenderInputParams) => {
            return (
                <TextField
                    {...params}
                    placeholder={
                        value.length ? '' : 'Type to search for country, city, or locality...'
                    }
                    variant="outlined"
                    fullWidth
                    className={classes.input}
                />
            )
        },
        [classes, value]
    )

    const autocompleteOptions = React.useMemo(() => {
        const valueMap = keyBy(value, 'place_id')
        return (inputValue ? options : Object.values(recentSearchMap).slice(0, 5)).filter(
            (place) => !valueMap[place.place_id]
        )
    }, [inputValue, options, recentSearchMap, value])

    return (
        <Autocomplete<Place, true, false, false>
            classes={{ noOptions: classes.noOptions }}
            popupIcon={null}
            forcePopupIcon={false}
            fullWidth
            noOptionsText={null}
            getOptionLabel={(option) => option.description}
            filterOptions={(x) => x}
            options={autocompleteOptions}
            autoComplete
            includeInputInList
            filterSelectedOptions
            disableCloseOnSelect
            multiple
            value={value}
            onChange={handleChange}
            onInputChange={handleInputChange}
            renderInput={renderInput}
            renderOption={renderOption}
            {...props}
        />
    )
}

export default LocationAutocomplete
