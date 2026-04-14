import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import settingsRouter from "./settings";
import galleryRouter from "./gallery";
import documentsRouter from "./documents";
import contactRouter from "./contact";
import cctvRouter from "./cctv";
import customPagesRouter from "./custom-pages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(settingsRouter);
router.use(galleryRouter);
router.use(documentsRouter);
router.use(contactRouter);
router.use(cctvRouter);
router.use(customPagesRouter);

export default router;
