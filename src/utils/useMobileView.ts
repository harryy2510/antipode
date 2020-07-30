import { Theme, useMediaQuery } from '@material-ui/core'
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints'
import { useTheme } from '@material-ui/styles'

const useMobileView = (breakpoint: Breakpoint = 'sm'): boolean => {
    const theme = useTheme<Theme>()
    return useMediaQuery(theme.breakpoints.down(breakpoint))
}

export default useMobileView
