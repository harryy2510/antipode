import { CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import { LoadScript } from '@react-google-maps/api'
import React from 'react'
import Main from './components/Main'
import Preloader from './components/Preloader'
import theme from './utils/theme'

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LoadScript
                libraries={['places']}
                loadingElement={<Preloader />}
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API}
            >
                <Main />
            </LoadScript>
        </ThemeProvider>
    )
}

export default App
