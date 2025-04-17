const { sendMessageToOpenAI } = require("./openai.js");
const ChatSession = require("../model/ChatSession.js");
const Message = require("../model/Message.js");
const Petition = require("../model/Petition.js");
const { basic_questions } = require("../lib/questions.js");
const {
  catalogCities,
  catalogBranchOffices,
  catalogDepartments,
  findByServiceAndDay,
} = require("../api/petition.js");

let botMessage = {}; // Bot message that ask and answer to user
const new_petition = {}; // Petition Model Variable
const new_chatsession = {}; // ChatSession Model Variable
const office_items = []; // Office items in city where user wants
const department_items = []; // Department items in office user selects

const saveMessage = async (message, hash) => {
  // Saving user/bot message to DB
  const message_obj = await Message.create({
    sessionId: hash,
    time: new Date(),
    ...message,
  });
  await message_obj.save();
};

const initialAsking = async (userMessage, hash) => {
  // About the initial questions
  switch (userMessage.id) {
    case 1:
      new_chatsession.userName = userMessage.content;
      new_petition.userName = userMessage.content;

      botMessage = basic_questions[2];
      botMessage = {
        ...botMessage,
        content: `Hi ${userMessage.content}, nice to meet you!\n${botMessage.content}`,
      };
      break;

    case 2:
      new_chatsession.emailAddress = userMessage.content;
      new_petition.emailAddress = userMessage.content;

      botMessage = basic_questions[3];
      break;

    case 3:
      const all_previous_messages = await Message.find({
        sessionId: userMessage.content,
      });
      // New User
      if (all_previous_messages.length === 0) {
        new_chatsession.sessionId = hash;
        botMessage = basic_questions[5];
        botMessage = {
          ...botMessage,
          content: hash + "\n" + botMessage.content,
        };
        // Create new ChatSession to DB
        const newChatSession = new ChatSession(new_chatsession);
        await newChatSession.save();
      }
      // If Session ID already exists
      else {
        botMessage = basic_questions[4];
      }
      break;
  }
  return botMessage;
};

const isPetition = (userMessage) => {
  // If user inputs some petition words
  const promise_words = [
    "petition",
    "book",
    "reservation",
    "promise",
    "appoint",
    "contact",
    "assign",
    "engage",
  ];
  let state = false;
  promise_words.map((promise_word) => {
    if (userMessage.toLowerCase().includes(promise_word)) {
      state = true;
    }
  });
  return state;
};

const petitionAsking = async (userMessage, hash) => {
  // Asking user to agree new petition
  botMessage = basic_questions[6];
  botMessage = {
    ...botMessage,
    id: userMessage.id,
  };
  await saveMessage(userMessage, hash);
  await saveMessage(botMessage, hash);
  return botMessage;
};

const mainPetition = async (userMessage, hash) => {
  // Main Petition
  switch (userMessage.label) {
    case "is_booking":
      const res_city = await catalogCities();
      const city_list = [];
      res_city.data.map((city) => {
        city_list.push({ label: city, value: city });
      });
      botMessage = {
        ...basic_questions[7],
        options: city_list.slice(1),
      };
      break;

    case "user_city":
      new_petition.userCity = userMessage.content;
      const res_office = await catalogBranchOffices();
      const office_list = [];
      res_office.data
        .filter((item) => item.city === userMessage.content)
        .map((item) => {
          office_items.push(item);
        });

      office_items.map((office) => {
        office_list.push({ label: office.name, value: office.name });
      });
      botMessage = {
        ...basic_questions[8],
        options: office_list,
      };
      break;

    case "branch_office":
      new_petition.branchOfficeId = office_items.filter(
        (item) => item.name === userMessage.content
      )[0].id; // Get branchOfficeId
      const res_department = await catalogDepartments(
        new_petition.branchOfficeId
      );
      const department_list = [];

      res_department.data.map((department) => {
        department_items.push(department);
        department_list.push({
          label: department.name,
          value: department.name,
        });
      });
      botMessage = {
        ...basic_questions[9],
        options: department_list,
      };
      break;

    case "department_selection":
      new_petition.departmentId = department_items.filter(
        (item) => item.name === userMessage.content
      )[0].id;
      botMessage = basic_questions[10];

      break;

    case "schedule_day":
      new_petition.datePetition = userMessage.content;
      const res_already_exist_time = await findByServiceAndDay(
        new_petition.datePetition,
        new_petition.branchOfficeId,
        new_petition.departmentId
      );
      const time_list = [
        "09:00",
        "09:20",
        "09:40",
        "10:00",
        "10:20",
        "10:40",
        "15:00",
        "15:20",
        "15:40",
      ];
      const possible_time = time_list.filter(
        (item) => !res_already_exist_time.includes(item)
      );

      const possible_time_list = [];
      if (possible_time.length !== 0 && res_already_exist_time.length !== 0) {
        // If possible time exist for petition
        possible_time.map((item) => {
          possible_time_list.push({ label: item, value: item });
        });
        possible_time_list.push({ label: "other day", value: "other day" });
        botMessage = {
          ...basic_questions[11],
          options: possible_time_list,
        };
      } else {
        botMessage = {
          ...basic_questions[10],
          content:
            "There are no possible petition time.\nPlease select other day.",
        };
      }
      break;

    case "possible_time":
      if (userMessage.content === "other day") {
        botMessage = basic_questions[10];
      } else {
        new_petition.timePetition = userMessage.content;
        botMessage = basic_questions[12];
        // Create new petition to DB
        const newPetition = new Petition(new_petition);
        await newPetition.save();
      }
  }


  await saveMessage(userMessage, hash);
  await saveMessage(botMessage, hash);
  return botMessage;
};

const aiAnswer = async (userMessage, hash) => {
  // Answer by user's query using openAI
  await saveMessage(userMessage, hash);
  const aiMessage = await sendMessageToOpenAI(userMessage.content);
  botMessage = {
    id: userMessage.id,
    sender: "bot",
    type: "text",
    label: "ai_answer",
    content: aiMessage,
    options: [],
  };
  // Add AI response to session history
  await saveMessage(botMessage, hash);
  // Send AI response back to the user
  return botMessage;
};

module.exports = {
  initialAsking,
  isPetition,
  petitionAsking,
  mainPetition,
  aiAnswer,
};
