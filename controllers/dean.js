import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";

export const postDeanSignup = async (req, res, next) => {
  const { universityId, password, name } = req.body;
  try {
    // Find the student in the database based on universityId
    const dn = await User.findOne({ universityId, userType: "Dean" });

    //if student exists already in the database
    if (dn) {
      return res
        .status(401)
        .json({ message: "Dean already exist. please login using your token" });
    }

    // Generate a unique token (UUID) and store it in the database
    const token = uuidv4();
    const dean = new User({
      universityId: universityId,
      password: password,
      name: name,
      token: token,
      userType: "Dean",
      sessions: [],
    });
    const savedean = await dean.save();

    res.status(201).json({ message: "Dean Created Succefully", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deanPendingSessions = async (req, res, next) => {
  try {
    const { token } = req.body;
    const currentDate = new Date();
    //check whether it's valid token or not
    const dean = await User.findOne({ token, userType: "Dean" }).populate({
      path: "sessions.slot",
      model: "Slot",
    });

    // console.log(dean);

    if (!dean) {
      // if no such dean exists
      return res.status(404).json({ message: "Token is not a valid token" });
    }

    const validpendingSessions = dean.sessions
      .filter((session) => session.slot.slot > currentDate)
      .map((session) => {
        const time = getTime(session.slot.slot);
        const date = getDate(session.slot.slot);
        const dayOfWeek = getDayOfWeek(session.slot.slot);
        return {
          "Student Name": session.userName,
          "Student ID": session.userId,
          Time: time,
          dayOfWeek: dayOfWeek,
          Date: date,
        };
      });

    console.log(validpendingSessions);
    return res.status(200).json({ ...validpendingSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDate = (date) => {
  const year = date.getFullYear(); // Get the year (e.g., 2023)
  const month = date.getMonth() + 1; // Get the month (0-11, so add 1) (e.g., 9 for September)
  const day = date.getDate(); // Get the day of the month (e.g., 2)
  return `${day}-${month}-${year}`;
};

const getTime = (date) => {
  const hours = date.getHours(); // Get the hours (0-23)
  if (hours < 12) {
    return `${hours}:00 AM`;
  }
  return `${hours - 12}:00 PM`;
};

const getDayOfWeek = (date) => {
  const dayOfWeek = date.getDay();
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = daysOfWeek[dayOfWeek];
  return dayName;
};
