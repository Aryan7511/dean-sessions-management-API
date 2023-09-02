import Dean from "../models/Dean.js";
import { v4 as uuidv4 } from "uuid";

export const postDeanSignup = async (req, res, next) => {
  const { universityId, password ,name} = req.body;
  try {
    // Find the student in the database based on universityId
    const dn = await Dean.findOne({ universityId });

    //if student exists already in the database
    if (dn){
      return res.status(401).json({ message: "Dean already exist. please login using your token" });
    }
    
    // Generate a unique token (UUID) and store it in the database
    const token = uuidv4();
    const dean = new Dean({
      universityId: universityId,
      password: password,
      name:name,
      token: token,
    });
    const savedean = await dean.save();

    res.status(201).json({ message: "Dean Created Succefully", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


