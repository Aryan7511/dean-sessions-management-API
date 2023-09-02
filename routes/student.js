import express from "express";
import { postStudentSignup, FreeSlot,postBookSlot,upcomingSessions } from "../controllers/student.js";
//in react we don't have to inclue .js but while importing in node we have to mention .js

const router = express.Router();

router.post("/login", postStudentSignup);
router.post("/free-slot", FreeSlot);
router.post("/book-slot", postBookSlot);
router.post('/upcoming-sessions',upcomingSessions);

export default router;
