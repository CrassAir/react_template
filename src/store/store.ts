import {AnyAction, combineReducers, configureStore} from "@reduxjs/toolkit";
import authReducer from './reducers/AuthReducer'

const rootReducer = combineReducers({
    authReducer,
})

const reducerProxy = (state: any, action: AnyAction) => {
    if (action.type === 'logout/fulfilled') {
        return rootReducer(undefined, action);
    }
    return rootReducer(state, action);
}

export const setupStore = () => {
    return configureStore({
        reducer: reducerProxy,
        middleware: getDefaultMiddleware => getDefaultMiddleware({serializableCheck: false})
    })
}

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']