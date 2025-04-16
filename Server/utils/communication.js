const { sendMessageToOpenAI } = require("./openai.js");
const ChatSession = require("../model/ChatSession.js");
const Message = require("../model/Message.js");
const Petition = require("../model/Petition.js");
const { basic_questions } = require("../lib/questions.js");
const {
  catalogCities,
  catalogBranchOffices,
} = require("../api/petition.js");

let botMessage = {};  // Bot message that ask and answer to user
const new_chatsession = {}; // ChatSession Model Variable
const office_items = [];  // Office items in city where user wants
const department_items = [];  // Department items in office user selects

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
      botMessage = basic_questions[2];
      botMessage = {
        ...botMessage,
        content: `Hi ${userMessage.content}, nice to meet you!\n${botMessage.content}`,
      };
      break;

    case 2:
      new_chatsession.userEmail = userMessage.content;
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
        // Create NewChatSession
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
      const res_office = await catalogBranchOffices();
      const office_list = [];
      res_office.data
        .filter((item) => item.city === userMessage.content)
        .map((item) => {
          office_items.push(item);
        });
      
      office_items.map((office) => {
        office_list.push({ label: office.name, value: office.name });
      })
      botMessage = {
        ...basic_questions[8],
        options: office_list,
      };
      break;

    case "branch_office":
      const department_list = [];
      office_items
        .filter((item) => item.name === userMessage.content)[0]
        .departments.map((item) => {
          department_items.push(item);
        }); 
        
      department_items.map((department) => {
        department_list.push({ label: department.name, value: department.name });
      })
      botMessage = {
        ...basic_questions[9],
        options: department_list,
      };
      break;
    
    case "department_selection":
      botMessage = {
        ...basic_questions[10],
      }
      break;
    case "schedule_day":

      
      break;
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
