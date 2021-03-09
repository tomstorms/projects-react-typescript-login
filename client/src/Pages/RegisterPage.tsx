import axios, { AxiosResponse } from 'axios';
import React, { useState } from 'react'

export default function RegisterPage() {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const register = () => {
        axios.post('http://localhost:4000/register', {
            username,
            password
        }, {
            withCredentials: true
        }).then((res: AxiosResponse) => {
            if (res.data === 'success') {
                window.location.href = "/register";
            }
        });
    }

    return (
        <div>
            <h1>Register</h1>
            <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input type="text" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={register}>Login</button>
        </div>
    )
}
