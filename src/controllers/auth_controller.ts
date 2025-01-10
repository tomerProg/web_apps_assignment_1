import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import userModel from '../models/users_model';

const saltRounds = 10;

const register = async (req: Request, res: Response) => {
    try {
        const { password, email } = req.body;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        await userModel.create({
            email,
            password: hashedPassword
        });
        res.sendStatus(StatusCodes.CREATED);
    } catch (err) {
        res.status(StatusCodes.BAD_REQUEST).send(err);
    }
};

export default {
    register
};
