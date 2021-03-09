export interface UserInterface {
    id: string;
    username: string;
    isAdmin: boolean;
}

export interface DatabaseUserInterface {
    username: string;
    password: string;
    isAdmin: boolean;
    _id: string;
}
