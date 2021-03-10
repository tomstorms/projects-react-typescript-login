import mongoose, { Error } from 'mongoose';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import passport from 'passport';
import passportLocal from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './Models/User';
import { DatabaseUserInterface, UserInterface } from './Interface/UserInterface';

/**
 * ENV SETUP
 */
dotenv.config({
    path: `.env.${process.env.NODE_ENV}`,
});

/**
 * DATABASE
 */
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err : Error) => {
    if (err) {
        console.log('MongoFailed');
        throw err;
    }
    console.log("Connected to MongoDB");
});

/**
 * MIDDLEWARE
 */
const app = express();
app.use(express.json());
app.use(cors({origin: process.env.SITE_CORS_ORIGIN, credentials: true})); // Persist sessions in 'origin' location
app.use(
    session({
        secret: (process.env?.SITE_EXPRESS_SECRET ? process.env.SITE_EXPRESS_SECRET : 'secretcode'),
        resave: true,
        saveUninitialized: true,
    })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

/**
 * PASSPORT
 */
// Local Logins
const LocalStrategy = passportLocal.Strategy;
passport.use(new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username: username }, (err : Error, user: DatabaseUserInterface) => {
        if (err) throw err;
        if (!user) return done(null, false); // return 'Unauthorised'
        bcrypt.compare(password, user.password, (err, result: boolean) => {
            if (err) throw err;
            if (result === true) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    });
}));

passport.serializeUser((user: DatabaseUserInterface, cb) => {
    cb(null, user._id);
});

passport.deserializeUser((id: string, cb) => {
    User.findOne({ _id: id }, (err : Error, user: DatabaseUserInterface) => {
        const userInformation : UserInterface = {
            username: user.username,
            isAdmin: user.isAdmin,
            id: user._id
        };
        cb(err, userInformation);
    });
});

/**
 * ROUTES
 */
app.post('/register', async (req : Request, res : Response) => {

    const { username, password } = req?.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        returnJSON(res, { status: 'fail', msg: 'Invalid values' });
        return;
    }

    User.findOne({ username }, async (err : Error, doc : DatabaseUserInterface) => {
        if (err) throw err;
        if (doc) returnJSON(res, { status: 'fail', msg: 'User already exists' });
        if (!doc) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
                username,
                password: hashedPassword,
            });
            await newUser.save();
            returnJSON(res, { status: 'success' });
        }
    });

});

app.post('/login', passport.authenticate('local'), (req, res) => {
    returnJSON(res, { status: 'success' });
});

app.get('/user', (req, res) => {
    res.send(req.user);
});

app.get('/logout', (req, res) => {
    req.logout();
    returnJSON(res, { status: 'success' });
});

// Setup Middleware
const isAdministratorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { user } : any = req;
    if (user) {
        User.findOne({ username: user.username }, (err : Error, doc : DatabaseUserInterface) => {
            if (err) throw err;
            if (doc?.isAdmin) {
                next();
            }
            else {
                returnJSON(res, { status: 'fail', msg: 'Sorry, only admins can perform this' });
            }
        });
    }
    else {
        returnJSON(res, { status: 'fail', msg: 'Sorry, you are not lgoged in' });
    }
}

app.post('/deleteuser', isAdministratorMiddleware, async (req, res) => {
    const { id } = req?.body;
    await User.findByIdAndDelete(id);

    returnJSON(res, { status: 'success' });
});

app.get('/getallusers', isAdministratorMiddleware, async (req, res) => {
    await User.find({}, (err : Error, data : DatabaseUserInterface[]) => {
        if (err) throw err;

        const filteredUsers : UserInterface[] = [];
        data.forEach((item: DatabaseUserInterface) => {
            const userInformation = {
                id: item._id,
                username: item.username,
                isAdmin: item.isAdmin,
            }
            filteredUsers.push(userInformation);
        })

        returnJSON(res, { status: 'success', data: filteredUsers });
    });
});

/**
 * SERVER
 */
app.listen(process.env.SITE_PORT, () => {
    console.log("Server started");
});


const returnJSON = (res : Response, data : any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}