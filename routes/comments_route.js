import express from 'express';

const router = express.Router();

router.put('/:commentId', updateComment);

export default router;
