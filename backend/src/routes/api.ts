import express from "express";
import longevityRoutes from "./longevity";

const router = express.Router();

router.use("/longevity", longevityRoutes);

export default router;
