import React, {useEffect, ReactElement, useMemo} from 'react';
import './App.scss';
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import {checkToken, logout} from "./store/actions/auth";
import {useAppDispatch, useAppSelector} from "./hooks";
import {
    Box, CircularProgress,
    createTheme,
    CssBaseline,
    ThemeProvider
} from '@mui/material';
import {useSnackbar} from "notistack";

const theme = createTheme({
    typography: {
        fontFamily: 'Arial',
    },
    palette: {
        // mode: 'dark',
        background: {
            // default: '#d7edf1',
            paper: '#f5f8f8'
        },
        primary: {
            main: '#2c6e6a',
        },
        secondary: {
            main: '#2da3c2'
        },
    },
    components: {
        MuiListItem: {
            styleOverrides: {
                root: {
                    transition: '500ms',
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(44,109,106, 0.7)',

                        'svg, span': {
                            color: '#f5f8f8'
                        }
                    }
                }
            }
        }
    }
});

export interface INavItem {
    name: string
    icon: ReactElement
    start_path: string
    path: string
    validate?: string
    component: ReactElement
    children?: INavItem[]
}

export var defaultNavList: INavItem[] = [
    {
        name: '',
        icon: <div/>,
        start_path: '',
        path: '/:id?',
        validate: '',
        component: <div/>,
    },
]

const App: React.FC = () => {
    const location = useLocation()
    const dispatch = useAppDispatch()
    const {enqueueSnackbar} = useSnackbar()
    const {authState, isAuth, navList, error} = useAppSelector(state => state.authReducer)

    useEffect(() => {
        if (error?.message && error?.code !== 401) {
            enqueueSnackbar(error.message, {variant: 'error'})
        }
    }, [error])

    useEffect(() => {
        dispatch(checkToken())
    }, [])

    function recursiveBuildNav(navItem: INavItem) {
        if (navItem.children && navItem.children.length > 0) {
            const childs = navItem.children?.map(nav => recursiveBuildNav(nav))
            return <Route key={navItem.name} path={navItem.start_path + navItem.path} element={navItem.component}>
                {childs}
            </Route>
        }
        return <Route key={navItem.name} path={navItem.start_path + navItem.path} element={navItem.component}/>
    }

    const navigationList = useMemo(() => {
        let nav = '/'
        const newList = navList.map((navItem, index) => {
            if (index === 0 && navItem.path !== '/') nav = navItem.start_path
            return recursiveBuildNav(navItem)
            // return <Route key={navItem.name} path={navItem.start_path + navItem.path} element={navItem.component}/>

        })
        if (nav !== '/') newList.push(<Route key={'redirect'} path="/" element={<Navigate to={nav}/>}/>)
        return newList
    }, [navList])


    const routes = () => {
        if (authState) {
            return (
                <Box className={'login-container'}>
                    <CircularProgress/>
                </Box>
            )
        }
        if (!authState && !isAuth) {
            return (
                <Routes>
                    <Route path={'*'} element={<Navigate replace to={'login'}/>}/>
                    <Route path="login" element={<div/>}/>
                </Routes>
            )
        }
        if (location.pathname === '/logout') {
            dispatch(logout())
        }
        return (
            <Routes>
                <Route path="login" element={<Navigate to={'/'}/>}/>
                <Route path="logout" element={<Navigate replace to={'login'}/>}/>
                <Route path="change_password" element={<Navigate to={'/'}/>}/>
                <Route path="/" element={<div/>}>
                    {navigationList}
                </Route>
            </Routes>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                <CssBaseline/>
                {routes()}
            </div>
        </ThemeProvider>
    )
}

export default App;
