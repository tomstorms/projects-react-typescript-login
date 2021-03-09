import axios, { AxiosResponse } from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { myContext } from '../Context/Context';
import { UserInterface } from '../Interface/UserInterface';

export default function AdminPage() {
    const ctx = useContext(myContext);

    const [data, setData] = useState<UserInterface[]>();
    const [selectedUser, setSelectedUser] = useState<string>();
    
    useEffect(() => {
        axios.get('http://localhost:4000/getallusers', {
            withCredentials: true
        }).then((res: AxiosResponse) => {
            setData(res.data.filter((item : UserInterface) => {
                return item.username !== ctx.username;
            }));
        })
    }, [ctx]);

    if (!data) {
        return null;
    }

    const deleteUser = () => {
        let userid : string;
        data.forEach((item: UserInterface) => {
            if (item.username === selectedUser) {
                userid = item.id;
            }
        });

        axios.post('http://localhost:4000/deleteuser', {
            id: userid!,
        }, {
            withCredentials: true
        })
    }

    return (
        <div>
            <h1>Admin</h1>
            <select onChange={e => setSelectedUser(e.target.value)} name="deleteUser" id="deleteUser">
                <option>Select a user...</option>
                {
                    data.map((item: UserInterface, index: number) => {
                        return (
                            <option key={index} value={item.username}>{item.username}</option>
                        )
                    })
                }
            </select>
            <button onClick={deleteUser}>Delete User</button>
        </div>
    )
}
