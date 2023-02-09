import axios, {AxiosError} from "axios";
import {IAuth, IAuthResponse} from "../../models/IAuth";
import {apiUrl, restAuthUrl} from "../../api";
import {createAsyncThunk} from "@reduxjs/toolkit";
import api, {apiError} from "../../api";

let interceptor = 0;

export const login = createAsyncThunk(
    'login',
    async (post: IAuth, thunkAPI) => {
        try {
            const {data} = await axios.post<IAuthResponse>(restAuthUrl + 'login/', post)
            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('token', data.key)
            interceptor = api.interceptors.request.use((config: any) => {
                config.headers["Authorization"] = `Token ${data.key}`;
                return config
            })
            return {user: data.user, token: data.key, interceptor: interceptor}
        } catch (e) {
            return thunkAPI.rejectWithValue({code: 0, message: 'Неверный логин или пароль'})
        }
    }
)

export const logout = createAsyncThunk(
    'logout',
    async (_, thunkAPI) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        try {
            await api.post(restAuthUrl + "logout/", {})
            api.interceptors.request.eject(interceptor)
            return {}
        } catch (e) {
            api.interceptors.request.eject(interceptor)
            return thunkAPI.rejectWithValue(apiError(e as Error | AxiosError))
        }
    }
)

export const checkToken = createAsyncThunk(
    'checkToken',
    async (_, thunkAPI) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (token) {
            try {
                await axios.post<IAuthResponse>(apiUrl + 'check_token/', {token: token})
                interceptor = api.interceptors.request.use((config: any) => {
                    config.headers["Authorization"] = `Token ${token}`;
                    return config
                })
                return {user: user, token: token, interceptor: interceptor}
            } catch (e) {
                thunkAPI.dispatch(logout());
                return thunkAPI.rejectWithValue(apiError(e as Error | AxiosError))
            }
        } else if (token === undefined) {
            thunkAPI.dispatch(logout());
        }
    }
)