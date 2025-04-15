const { sendMessageToOpenAI } = require("./openai");
const ChatSession = require("../model/ChatSession");
const Message = require("../model/Message");
const Petition = require("../model/Petition");
const { basic_questions } = require("../lib/questions.js");
const { catalogCities, catalogBranchOffices } = require("../api/petition.js");

let botMessage = {};
let botSelection = {};
const newUser = {};

const saveMessage = async (message, hash) => {
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
    // 3 Initial Questions + (-2)
    case 1:
      newUser.userName = userMessage.content;
      botMessage = basic_questions[2];
      botMessage = {
        ...botMessage,
        content: `Hi ${userMessage.content}, nice to meet you!\n${botMessage.content}`,
      };
      break;

    case 2:
      newUser.userEmail = userMessage.content;
      botMessage = basic_questions[3];
      break;

    case 3:
      const all_previous_messages = await Message.find({
        sessionId: userMessage.content,
      });
      // New User
      if (all_previous_messages.length === 0) {
        newUser.sessionId = hash;
        botMessage = basic_questions[5];
        botMessage = {
          ...botMessage,
          content: hash + "\n" + botMessage.content,
        };
        // Create NewChatSession
        const newChatSession = new ChatSession(newUser);
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
      const res_office = await catalogBranchOffices()
      const office_list = [];
      res_office.data.filter((item) => 
        item.city === userMessage.content
      ).map((item) => {
        item.departments.map((item) => {
          office_list.push({ label: item.name, value: item.name });
        })
      })
      botMessage = {
        ...basic_questions[8],
        options: office_list,
      };
      break;
  }

  await saveMessage(userMessage, hash)
  await saveMessage(botMessage, hash);
  return botMessage;
};

const aiAnswer = async (userMessage, hash) => {
  await saveMessage(userMessage, hash);
  // Query OpenAI for a response
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
