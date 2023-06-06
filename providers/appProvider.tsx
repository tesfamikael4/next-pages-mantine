import React, { createContext, useReducer } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons';
import { getCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { APP_KEY } from '../config/constants';

export const LOCAL_STORAGE_KEYS = {
    user: `${APP_KEY}_user`,
    user_id: `${APP_KEY}_user_id`,
    token: `${APP_KEY}_token`,
    login_status: `${APP_KEY}_login_status`,
}

interface AppContextProps {
    user: any;
    user_id: any;
    token: any;
    login_status: any;
    login: any;
    logout: any;
    actions: any;
}

const initialAppContext: AppContextProps = {
    user: null,
    user_id: null,
    token: null,
    login_status: null,
    login: null,
    logout: null,
    actions: {
        login_user: 'LOGIN_USER',
        logout_user: 'LOGOUT_USER',
    }
}

function appContextReducer(ctx: any, action: any) {
    switch (action.type) {
        case 'LOGIN_USER': {
            return {
                ...ctx,
                user: action.payload.user,
                token: action.payload.token,

            };
        }
        case 'LOGOUT_USER': {
            return {
                ...ctx,
                user: null,
                token: null
            };
        }

        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const AppContext = createContext(initialAppContext);

export const useAppContext = () => {
    return React.useContext(AppContext)
}


const AppProvider = (props: any) => {

    const router = useRouter()

    const user = getCookie(LOCAL_STORAGE_KEYS.user) || initialAppContext.user;
    const token = getCookie(LOCAL_STORAGE_KEYS.token) || initialAppContext.token;
    const userID = getCookie(LOCAL_STORAGE_KEYS.user_id) || initialAppContext.user_id;
    const loginStatus = getCookie(LOCAL_STORAGE_KEYS.login_status) || initialAppContext.login_status;

    const [appStore, dispatch] = useReducer(
        appContextReducer,
        initialAppContext
    );

    const cookieSetter = (cookie_name: any, value: any) => {
        setCookie(cookie_name, value, { maxAge: 60 * 60 * 24 * 30 })
    }

    const handleLogin = (user: any, token: any) => {
        console.log(user, token)
        cookieSetter(LOCAL_STORAGE_KEYS.user, user);
        cookieSetter(LOCAL_STORAGE_KEYS.user_id, user?.id);
        cookieSetter(LOCAL_STORAGE_KEYS.token, token);
        cookieSetter(LOCAL_STORAGE_KEYS.login_status, true);

        dispatch({
            type: 'LOGIN_USER',
            payload: {
                user: user,
                token: token
            }
        });
        showNotification({
            title: "Account login",
            message: "You have logged in successfully!",
            color: "green",
            icon: <IconAlertCircle />
        })
    };

    const handleLogout = () => {
        cookieSetter(LOCAL_STORAGE_KEYS.user, null);
        cookieSetter(LOCAL_STORAGE_KEYS.user_id, null);
        cookieSetter(LOCAL_STORAGE_KEYS.token, null);
        cookieSetter(LOCAL_STORAGE_KEYS.login_status, false);
        dispatch({
            type: 'LOGOUT_USER'
        });
        showNotification({
            title: "Account logout",
            message: "You have logged out successfully",
            color: "blue",
            icon: <IconAlertCircle />
        })
        router.push('/auth/login')
    };


    return (
        <AppContext.Provider value={{ user: user, user_id: userID, token: token, login_status: loginStatus, login: handleLogin, logout: handleLogout, actions: initialAppContext.actions }}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppProvider;