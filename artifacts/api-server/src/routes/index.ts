import { Router, type IRouter } from "express";
import healthRouter from "./health";
import customersRouter from "./customers";
import visitsRouter from "./visits";
import rewardsRouter from "./rewards";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";
import portalRouter from "./portal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(portalRouter);
router.use(customersRouter);
router.use(visitsRouter);
router.use(rewardsRouter);
router.use(dashboardRouter);

export default router;
