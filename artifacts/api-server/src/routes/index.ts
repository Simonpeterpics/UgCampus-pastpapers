import { Router, type IRouter } from "express";
import healthRouter from "./health";
import papersRouter from "./papers";
import uploadsRouter from "./uploads";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(papersRouter);
router.use(uploadsRouter);
router.use(dashboardRouter);

export default router;
