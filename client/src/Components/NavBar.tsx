import axios, { AxiosResponse } from 'axios';
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { myContext } from '../Context/Context'

export default function NavBar() {
    const ctx = useContext(myContext);

    const logout = () => {
        axios.get(process.env.REACT_APP_SERVER_URL + '/logout', { 
            withCredentials: true
        }).then((res: AxiosResponse) => {
            if (res.data.status === 'success') {
                window.location.href = "/";
            }
        });
    }
    
    return (
        <div className="NavContainer">
            {ctx ? (
                <>
                    <Link to="/logout" onClick={logout}>Logout</Link>
                    <Link to="/profile">Profile</Link>
                    <Link to="/admin">Admin</Link>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}
            <Link to="/">Home</Link>
        </div>
    )
}
