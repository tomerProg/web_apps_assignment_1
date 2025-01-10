import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
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
type TokenPayload = {
    _id: string;
    random: string;
};

export const generateTokens = (userId: string): Tokens | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString();
    const payload: TokenPayload = {
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
        const userId = user._id.toString()
        const tokens = generateTokens(userId);
        if (!tokens) {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.send({ ...tokens, _id: userId });
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).send(err);
    }
};

const verifyRefreshToken = async (refreshToken: string | undefined) => {
    if (!refreshToken) {
        throw new Error('missing refresh token');
    }
    if (!process.env.TOKEN_SECRET) {
        throw new Error('missing token secret');
    }
    const tokenSecret = process.env.TOKEN_SECRET;
    const verifiedTokenPayload = jwt.verify(refreshToken, tokenSecret);
    if (typeof verifiedTokenPayload === 'string') {
        throw new Error('token payload shoud not be string');
    }

    const userId = verifiedTokenPayload._id;
    const user = await userModel.findById(userId);
    if (!user) {
        throw new Error('user not found');
    }
    if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
        user.refreshToken = [];
        await user.save();
        throw new Error('invalid refresh token');
    }
    const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
    user.refreshToken = tokens;

    return user;
};

export const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        await user.save();
        res.sendStatus(StatusCodes.OK);
    } catch (err) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        const userId = user._id.toString()
        const tokens = generateTokens(userId);

        if (!tokens) {
            res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: userId
        });
    } catch (err) {
        res.sendStatus(StatusCodes.BAD_REQUEST);
    }
};

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authorization = req.header('authorization');
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        return;
    }

    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.params.userId = (verifiedToken as TokenPayload)._id;
        next();
    } catch (error) {
        res.sendStatus(StatusCodes.UNAUTHORIZED);
    }
};
