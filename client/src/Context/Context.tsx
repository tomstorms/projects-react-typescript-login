import axios, { AxiosResponse } from 'axios';
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { UserInterface } from '../Interface/UserInterface';

export const myContext = createContext<Partial<UserInterface>>({})
export default function Context(props : PropsWithChildren<any>) {
    const [user, setUser] = useState<UserInterface>();
    useEffect(() => {
        axios.get(process.env.REACT_APP_SERVER_URL + '/user', { withCredentials: true }).then((res: AxiosResponse) => {
            setUser(res.data);
        })
    }, [])

    return (
        <myContext.Provider value={user!}>{props.children}</myContext.Provider>
    )
}
