import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import studentRoutes from "./routes/student.js";
import deanRoutes from "./routes/dean.js";

const app = express();

// app.use("/posts", postRoutes);

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
/*: This line applies the cors middleware to your application, allowing it to handle cross-origin requests properly. 
This is essential when your frontend code (hosted on a different domain) wants to make requests to your backend server. */
app.use(cors());

app.use("/student", studentRoutes);
app.use("/dean",deanRoutes);

const CONNECTION_URL =
  "mongodb+srv://Aryan:S4vbvmDOdNVUghgm@cluster0.zcxuv2e.mongodb.net/";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await mongoose.connect(CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected Successfully");
    app.listen(PORT, (err) => {
      if (err) {
        console.log("Error in server setup");
      } else {
        console.log(`Server listening on Port ${PORT}`);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
})();
