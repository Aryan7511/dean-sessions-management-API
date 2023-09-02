import Student from "../models/Student.js";
import Slot from "../models/Slot.js";
import { v4 as uuidv4 } from "uuid";
import Dean from "../models/Dean.js";
import Session from "../models/Session.js";

export const postStudentSignup = async (req, res, next) => {
  const { universityId, password, name } = req.body;
  try {
    // Find the student in the database based on universityId
    const std = await Student.findOne({ universityId });

    //if student exists already in the database
    if (std) {
      return res.status(401).json({
        message: "Student already exist. please login using your token",
      });
    }

    // Generate a unique token (UUID) and store it in the database
    const token = uuidv4();
    const student = new Student({
      universityId: universityId,
      password: password,
      name: name,
      token: token,
    });
    const savedStudent = await student.save();

    res
      .status(201)
      .json({ message: "Student Created Succefully", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const FreeSlot = async (req, res, next) => {
  //we are limiting the threshold slots which are free to be 6
  const { token } = req.body; // it will be student token
  const threshold = 6;
  try {
    //  check whether the token is valid or not
    const stdt = await Student.findOne({ token });
    if (!stdt) {
      // if token is not valid
      return res.status(409).json({ message: "token is not valid a token" });
    }
    //find how many deans exist
    const totalDeans = await Dean.find().countDocuments();
    console.log(totalDeans);

    //fetching all valid free slots from database
    // Get the current date
    const currentDate = new Date();
    // console.log(currentDate)

    // Define the query condition to find slots with a date greater than the current date
    const condition = {
      slot: { $gt: currentDate }, // Date is greater than the current date
      $expr: { $lt: [{ $size: "$booked" }, totalDeans] }, // booked array length is less than totalDean
    };
    // Define the sorting order (ascending) based on the 'slot' field
    const sortOrder = { slot: 1 }; // 1 for ascending, -1 for descending

    let validSlots = await Slot.find(condition).sort(sortOrder);
    // console.log(validSlots);
    const countOfFreeSlot = threshold - validSlots.length;
    console.log(countOfFreeSlot);

    let createdSlots = [];
    if (validSlots.length > 0 && countOfFreeSlot != 0) {
      createdSlots = getSlots(
        countOfFreeSlot,
        new Date(validSlots[validSlots.length - 1].slot)
      );
    } else {
      createdSlots = getSlots(countOfFreeSlot);
    }

    let saveSlots = [];
    for (let i = 0; i < createdSlots.length; i++) {
      saveSlots.push({
        slot: createdSlots[i],
        booked: [],
      });
    }

    await Slot.insertMany(saveSlots);

    validSlots = await Slot.find(condition).sort(sortOrder);
    console.log(validSlots.length);

    const modifiedFreeSlots = await Promise.all(
      validSlots.map(async (slotObj) => {
        const deanIdsToExclude = slotObj.booked;
        const condition = {
          _id: { $nin: deanIdsToExclude }, // Exclude documents with these dean IDs
        };
        const availableDeans = await Dean.find(condition);
        const date = getDate(slotObj.slot);
        const time = getTime(slotObj.slot);
        const dayOfWeek = getDayOfWeek(slotObj.slot);
        const filteredDeans = availableDeans.map((dean) => {
          return {
            name: dean.name,
            universityId: dean.universityId,
          };
        });
        return {
          "Slot-Time": time,
          "Slot-Date": date,
          dayOfWeek: dayOfWeek,
          "Slot-ID": slotObj._id,
          "Available Deans": filteredDeans,
        };
      })
    );

    return res.status(201).json({ ...modifiedFreeSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOffset = (currentDay) => {
  if (currentDay === 0) {
    return 4;
  } else if (currentDay === 1) {
    return 3;
  } else if (currentDay === 2) {
    return 2;
  } else if (currentDay === 3) {
    return 1;
  } else if (currentDay === 4) {
    return 1;
  } else if (currentDay === 5) {
    return 6;
  } else if (currentDay === 6) {
    return 5;
  }
};

const getSlots = (count, lastslot = new Date()) => {
  let lastSlotTime = new Date(lastslot).getTime();

  let today = new Date(Date.now());
  let start = new Date();
  if (today > lastSlotTime) {
    start = today;
  } else {
    start = lastSlotTime;
  }

  let hold = new Date(start);
  start = new Date(start);
  hold.setHours(10);
  hold.setMinutes(0);

  let schedule = [];

  if (start.getDay() === 4 && start.getHours() >= 10) {
    hold = new Date(hold.getTime() + 24 * 60 * 60 * 1000);
    schedule.push(hold);
    count--;
  } else if (start.getDay() === 5 && start.getHours() < 10) {
    schedule.push(hold);
    count--;
  } else if (start.getDay() === 4 && start.getHours() < 10) {
    schedule.push(hold);
    count--;
  }

  while (count--) {
    let offset = getOffset(hold.getDay());

    hold = new Date(hold.getTime() + offset * 24 * 60 * 60 * 1000);
    schedule.push(hold);
  }

  for (let i = 0; i < schedule.length; i++) {
    console.log(schedule[i].toString());
  }

  return schedule;
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

export const postBookSlot = async (req, res, next) => {
  const { deanUniversityId, slotId, token } = req.body;
  try {
    //verifying the student with it's token whether it is valid student or not
    const std = await Student.findOne({ token });
    if (!std) {
      //if such student does not exist
      return res.status(400).json({ message: "Token is not valid" });
    }
    //now checking whether the dean university id is correct or not
    const dean = await Dean.findOne({ universityId: deanUniversityId });
    if (!dean) {
      return res
        .status(400)
        .json({ message: "dean university Id is not a valid Id" });
    }
    // checking whether the slot is already booked by some other student or not
    // if it is booked already then in that case booking can't be done
    const slot = await Slot.findOne({ _id: slotId });
    let listOfBookedDeans = slot.booked;
    const isPresent = listOfBookedDeans.includes(dean._id);
    const currentDate = new Date();

    if (currentDate > slot.slot) {
      return res.status(409).json({
        message: "Unfortunately, the slot time has expired.",
      });
    }

    if (isPresent) {
      // it means dean is not available
      return res.status(409).json({
        message: "Slot is already booked. Sorry for the inconvenience",
      });
    }

    //now creating a session
    const session = new Session({
      deanId: deanUniversityId,
      deanName: dean.name,
      studentId: std.universityId,
      studentName: std.name,
      slot: slotId,
    });
    const savedSession = await session.save();
    //now storing created Session id in the student and dean document
    std.sessions.push(savedSession._id);
    await std.save();

    //now storing created Session id in the student and dean document
    dean.sessions.push(savedSession._id);
    await dean.save();

    //now updating the booked field of slot
    slot.booked.push(dean._id);
    await slot.save();

    return res
      .status(200)
      .json({ message: "Your slot booking has been successfully completed!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const upcomingSessions = async (req, res, next) => {
  try {
    const { token } = req.body;
    const currentDate = new Date();
    //check whether it's valid token or not
    const student = await Student.findOne({ token }).populate({
      path: "sessions",
      select: "deanId deanName",
      populate: { path: "slot", select: "slot" },
    });

    if (!student) {
      // if no such student exists
      return res.status(404).json({ message: "Token is not a valid token" });
    }
    // console.log(student);

    const upcomingSessionssss = student.sessions
      .filter((session) => session.slot.slot > currentDate)
      .map((session) => {
        const time = getTime(session.slot.slot);
        const date = getDate(session.slot.slot);
        const dayOfWeek = getDayOfWeek(session.slot.slot);
        return {
          "Dean Name": session.deanName,
          "Dean ID": session.deanId,
          Time: time,
          dayOfWeek: dayOfWeek,
          Date: date,
        };
      });
    return res.status(200).json({ ...upcomingSessionssss });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
