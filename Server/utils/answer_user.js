const { sendMessageToOpenAI } = require("./openai");
const ChatSession = require("../model/ChatSession");
const Message = require("../model/Message");
const Petition = require("../model/Petition");
const { saved_questions } = require("../lib/saved_questions");
const { catalogCities } = require("../services/booking");

let botMessage = {};
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
  switch (userMessage.content_id) {
    // 3 Initial Questions + (-2)
    case -2:
      newUser.userName = userMessage.content;
      botMessage = saved_questions[2];
      botMessage = {
        ...botMessage,
        content: `Hi ${userMessage.content}, nice to meet you!\n${botMessage.content}`,
      };
      break;

    case -1:
      newUser.userEmail = userMessage.content;
      botMessage = saved_questions[3];
      break;

    case 0:
      const all_previous_messages = await Message.find({
        sessionId: userMessage.content,
      });

      // New User
      if (all_previous_messages.length === 0) {
        newUser.sessionId = hash;
        botMessage = saved_questions[5];
        botMessage = {
          ...botMessage,
          content: hash + "\n" + botMessage.content,
        };

        // Create NewChatSession
        const newChatSession = new ChatSession(newUser);
        await newChatSession.save();
      }

      // If Session ID exists
      else {
        botMessage = saved_questions[4];
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
    // const res = await catalogCities();

    // if (res.data.success) {
    //   botMessage = {
    //     sender:'bot',
    //     type: 'select',
    //     options: 
    //   } 
    // }
    botMessage = saved_questions[6];
    botMessage = {
      ...botMessage,
      content_id: userMessage.content_id,
    };
    await saveMessage(userMessage, hash);
    await saveMessage(botMessage, hash);
    return botMessage;
  } catch (e) {
    return {
      sender: "bot",
      content_id: 6,
      content:
        "Something went wrong while fetching cities data",
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
      botMessage = saved_questions[7];
      botMessage = {
        ...botMessage,
        content_id: userMessage.content_id + 1,
      };
      await saveMessage(botMessage, hash);
      break;
    case 2:
      new_petition.branchOffice = userMessage.content;
      botMessage = saved_questions[8];
      botMessage = {
        ...botMessage,
        content_id: userMessage.content_id + 1,
      };
      await saveMessage(botMessage, hash);
      break;
    case 3:
      new_petition.content = userMessage.content;
      botMessage = saved_questions[9];
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
    content_id: userMessage.content_id,
    sender: "bot",
    content: aiMessage,
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
