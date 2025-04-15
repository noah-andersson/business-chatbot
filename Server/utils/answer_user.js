const { sendMessageToOpenAI } = require("./openai");
const ChatSession = require("../model/ChatSession");
const Message = require("../model/Message");
const Petition = require("../model/Petition");
const { basic_questions } = require("../lib/questions.js");
const { catalogCities } = require("../api/petition.js");

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
  const promiseWords = [
    "petition",
    "book",
    "reservation",
    "promise",
    "appoint",
    "contact",
    "assign",
    "engage",
  ];
  let booking_state = false;
  promiseWords.map((promiseWord) => {
    if (userMessage.toLowerCase().includes(promiseWord)) {
      booking_state = true;
    }
  });
  return booking_state;
};

const petitionAsking = async (userMessage, hash) => {
  try {
    const res = await catalogCities();

    botSelection = {
      ...saved_selections[1],
      options: res.data,
    };

    botMessage = {
      ...basic_questions[6],
      content_id: userMessage.content_id,
    };
    await saveMessage(userMessage, hash);
    await saveMessage(botMessage, hash);
    return [botMessage, botSelection];
  } catch (e) {
    return {
      sender: "bot",
      content_id: 6,
      content: "Something went wrong while fetching cities data",
    };
  }
};

let new_petition = {
  userName: "",
  userEmail: "",
  userCity: "",
  branchOffice: "",
  content: "",
};

const mainPetition = async (userMessage, hash) => {
  await saveMessage(userMessage, hash);
  switch (userMessage.content_id) {
    case 1:
      new_petition.userCity = userMessage.content;
      botMessage = basic_questions[7];
      botMessage = {
        ...botMessage,
        content_id: userMessage.content_id + 1,
      };
      await saveMessage(botMessage, hash);
      break;
    case 2:
      new_petition.branchOffice = userMessage.content;
      botMessage = basic_questions[8];
      botMessage = {
        ...botMessage,
        content_id: userMessage.content_id + 1,
      };
      await saveMessage(botMessage, hash);
      break;
    case 3:
      new_petition.content = userMessage.content;
      botMessage = basic_questions[9];
      botMessage = {
        ...botMessage,
        content_id: userMessage.content_id + 1,
      };
      // Create NewChatSession
      new_petition.userName = newUser.userName;
      new_petition.userEmail = newUser.userEmail;
      const newPetition = new Petition(new_petition);
      await newPetition.save();

      await saveMessage(botMessage, hash);
      break;
  }
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
    options: []
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
