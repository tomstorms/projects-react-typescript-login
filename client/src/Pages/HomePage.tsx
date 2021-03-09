import React, { useContext } from 'react'
import { myContext } from '../Context/Context'

export default function HomePage() {
    const ctx = useContext(myContext);
    return (
        <div>
            <h1>HomePage</h1>
        </div>
    )
}
