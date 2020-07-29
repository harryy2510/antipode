import { makeStyles } from '@material-ui/styles'
import React from 'react'
import preloader from '../assets/preloader.gif'

const useStyles = makeStyles({
    root: {
        backgroundColor: '#fdfdff',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& img': {
            width: '95%',
            maxWidth: 480
        }
    }
})
const Preloader: React.FC = () => {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <img src={preloader} alt="Loading..." />
        </div>
    )
}

export default Preloader
