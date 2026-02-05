import express from "express";
import searchJobs from "../controllers/jobData.js";
import { verifyToken } from "../middleware/authVerify.js";

const router = express.Router();

router.post("/search", verifyToken, searchJobs);

export default router;
