import { createContext, useState, useEffect } from "react";
import axios from 'axios';

export const DataContext = createContext(null);

const DataProvider = ({ children }) => {
    const [account, setAccount] = useState({ username: '', name: '' });

    // Add axios interceptor for token injection
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(config => {
            const token = sessionStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = token;
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    return (
        <DataContext.Provider value={{
            account,
            setAccount
        }}>
            {children}
        </DataContext.Provider>
    );
}

export default DataProvider;