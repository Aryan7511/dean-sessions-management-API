import express from "express";
import {  postDeanSignup, deanPendingSessions } from "../controllers/dean.js";
//in react we don't have to inclue .js but while importing in node we have to mention .js

const router = express.Router();

router.post("/login", postDeanSignup);
router.post("/pending-sessions", deanPendingSessions);

export default router;