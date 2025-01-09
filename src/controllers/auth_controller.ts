import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import userModel from '../models/users_model';

const saltRounds = 10;

const checkIsUserExist = async (email: string, password: string) => {
    const usersWithEmail = await userModel.find({ email }).lean();
    for (let index = 0; index < usersWithEmail.length; index++) {
        const user = usersWithEmail[index];
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            return true;
        }
    }

    return false;
};

const register = async (req: Request, res: Response) => {
    try {
        const { password, email } = req.body;
        const isUserExist = await checkIsUserExist(email, password);
        if (isUserExist) {
            throw new Error('something went wrong creating user');
        }

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
