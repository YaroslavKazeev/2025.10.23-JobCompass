import express from "express";
import searchJobs from "../controllers/jobData.js";
import { attachUserFromCookie } from "../middleware/authVerify.js";

const router = express.Router();

router.post("/search", attachUserFromCookie, searchJobs);

export default router;
