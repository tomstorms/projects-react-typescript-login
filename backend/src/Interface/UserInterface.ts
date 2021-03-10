export interface IUser {
    id: string;
    username: string;
    isAdmin: boolean;
    googleId?: string;
}

export interface IMongoUser {
    username: string;
    password: string;
    isAdmin: boolean;
    _id: string;
    googleId?: string;
}
