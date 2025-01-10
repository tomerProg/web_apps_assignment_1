import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import userModel from '../models/users_model';

const saltRounds = 10;

export const createUserForDb = async (email: string, password: string) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return {
        email,
        password: hashedPassword
    };
};

export const register = async (req: Request, res: Response) => {
    try {
        const { password, email } = req.body;
        const user = await createUserForDb(email, password);
        await userModel.create(user);
        res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).send(err);
    }
};

type Tokens = {
    accessToken: string;
    refreshToken: string;
};

const generateTokens = (userId: string): Tokens | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString();
    const payload = {
        _id: userId,
        random: random
    };
    const {
        TOKEN_SECRET: secret,
        TOKEN_EXPIRES: tokenExpires,
        REFRESH_TOKEN_EXPIRES: refreshTokenExpires
    } = process.env;

    const accessToken = jwt.sign(payload, secret, { expiresIn: tokenExpires });
    const refreshToken = jwt.sign(payload, secret, {
        expiresIn: refreshTokenExpires
    });

    return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            throw new Error('wrong username or password');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error('wrong username or password');
        }

        const tokens = generateTokens(user._id);
        if (!tokens) {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.send({ ...tokens, _id: user._id });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).send(err);
    }
};
