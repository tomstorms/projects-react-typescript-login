import axios, { AxiosResponse } from 'axios';
import React, { useState } from 'react'

export default function LoginPage() {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const login = () => {
        axios.post(process.env.REACT_APP_SERVER_URL + '/login', {
            username,
            password
        }, {
            withCredentials: true
        }).then((res: AxiosResponse) => {
            if (res.data.status === 'success') {
                window.location.href = "/";
            }
        }, () => {
            console.log('failure');
        });
    }

    return (
        <div>
            <h1>Login</h1>
            <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input type="text" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
        </div>
    )
}
