import { Router, Request, Response } from 'express';
import { FeedRouter } from './feeds/feed.router';
import { UserRouter } from './users/user.router';

const router: Router = Router();

router.use('/feed', FeedRouter);
router.use('/users', UserRouter);

router.get('/', async (req: Request, res: Response) => {
    res.send(`V0`);
});

export const IndexRouter: Router = router;
