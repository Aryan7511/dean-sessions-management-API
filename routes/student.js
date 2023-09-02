import express from "express";
import { postStudentSignup, getFreeSlot,postBookSlot } from "../controllers/student.js";
//in react we don't have to inclue .js but while importing in node we have to mention .js

const router = express.Router();

router.post("/login", postStudentSignup);
router.get("/free-slot", getFreeSlot);
router.post("/book-slot", postBookSlot);

export default router;
