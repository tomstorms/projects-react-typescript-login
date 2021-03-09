import React, { useContext } from 'react'
import { myContext } from '../Context/Context'

export default function ProfilePage() {
    const ctx = useContext(myContext);
    return (
        <div>
            <h1>Current logged in user: {ctx.username}</h1>
        </div>
    )
}
