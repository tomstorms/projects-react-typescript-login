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

const LocalStrategy = passportLocal.Strategy;

dotenv.config();

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zikku.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
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


// Middleware
// Persist sessions in origin location
const app = express();
app.use(express.json());
app.use(cors({origin: 'http://localhost:3000', credentials: true}));
app.use(
    session({
        secret: 'secretcode',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Passport
passport.use(new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username: username }, (err : Error, user: DatabaseUserInterface) => {
        if (err) throw err;
        if (!user) return done(null, false); // return unauthorised
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


// Routes
app.post('/register', async (req : Request, res : Response) => {

    const { username, password } = req?.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        res.send("Improper values");
        return;
    }

    User.findOne({ username }, async (err : Error, doc : DatabaseUserInterface) => {
        if (err) throw err;
        if (doc) res.send("User already exists");
        if (!doc) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
                username,
                password: hashedPassword,
            });
            await newUser.save();
            res.send("success");
        }
    });

});

const isAdministratorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { user } : any = req;
    if (user) {
        User.findOne({ username: user.username }, (err : Error, doc : DatabaseUserInterface) => {
            if (err) throw err;
            if (doc?.isAdmin) {
                next();
            }
            else {
                res.send('Sorry, only admins can perform this');
            }
        });
    }
    else {
        res.send('Sorry, you are not lgoged in');
    }
}


app.post('/login', passport.authenticate('local'), (req, res) => {
    res.send('success');
});

app.get('/user', (req, res) => {
    res.send(req.user);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.send('success');
});

app.post('/deleteuser', isAdministratorMiddleware, async (req, res) => {
    const { id } = req?.body;
    await User.findByIdAndDelete(id);
    res.send('success');
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

        res.send(filteredUsers);
    });
});


// Start server
app.listen(4000, () => {
    console.log("Server started");
})