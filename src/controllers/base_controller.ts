import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Model } from 'mongoose';

class BaseController<T> {
    constructor(private readonly model: Model<T>) {}

    async getAll(req: Request, res: Response) {
        const filter = req.query.owner;
        try {
            const items = await this.model.find(filter ? { owner: filter } : {});
            res.send(items);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).send(error);
        }
    }

    async getById(req: Request, res: Response) {
        const id = req.params.id;
        try {
            const item = await this.model.findById(id);
            if (item != null) {
                res.send(item);
            } else {
                res.status(StatusCodes.NOT_FOUND).send('not found');
            }
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).send(error);
        }
    }

    async create(req: Request, res: Response) {
        const body = req.body;
        try {
            const item = await this.model.create(body);
            res.status(StatusCodes.CREATED).send(item);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).send(error);
        }
    }

    async deleteItem(req: Request, res: Response) {
        const id = req.params.id;
        try {
            await this.model.findByIdAndDelete(id);
            res.sendStatus(StatusCodes.OK);
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).send(error);
        }
    }

    async update(req: Request, res: Response) {
        const {
            params: { id },
            body: update,
        } = req;

        try {
            const { modifiedCount } = await this.model.updateOne({ _id: id }, update);

            if (modifiedCount === 0) {
                res.status(StatusCodes.NOT_FOUND).send('not found');
            } else {
                res.sendStatus(StatusCodes.OK);
            }
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
        }
    }
}

export default BaseController;
