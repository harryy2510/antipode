import { createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
    palette: { primary: { main: '#5063f0' }, secondary: { main: '#5063f0' } },
    typography: { fontFamily: '"Poppins", sans-serif' },
    overrides: {
        MuiListItemIcon: {
            root: {
                minWidth: 32,
                verticalAlign: 'middle'
            }
        }
    }
})
export default theme
