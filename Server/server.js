const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Message = require("./model/Message");
const { basic_questions } = require("./lib/questions");
const {
  initialAsking,
  isPetition,
  petitionAsking,
  mainPetition,
  aiAnswer,
} = require("./utils/communication");

const app = express();
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const chat_sessions = {};
  chat_sessions[socket.id] = socket;

  let bot_question = null;
  let is_petition = false;
  // let petition_list_count = 1;

  // Create a new chat session for each user
  const hash = parseInt(
    crypto.createHash("md5").update(socket.id).digest("hex").slice(0, 8),
    16
  ).toString(10);
  socket.emit("response", basic_questions[1]);

  // Send message with user and bot
  socket.on("message", async (userMessage) => {
    try {
      if (userMessage.id <= 3) {
        // If bot asks user for name and email
        bot_question = await initialAsking(userMessage, hash);
        socket.emit("response", bot_question);

        // If existing Session ID
        if (bot_question.label === "session_id_correct") {
          const previous_messages = await Message.find({
            sessionId: userMessage.content,
          });
          previous_messages.map((previous_message) => {
            socket.emit("response", previous_message);
          });
        }
      }
      else if (!is_petition && isPetition(userMessage.content)) {
        // Asking user for petition
        bot_question = await petitionAsking(userMessage, hash);
        socket.emit("response", bot_question);
      } 
      else if ((userMessage.label === "is_booking" && userMessage.content === "yes") || is_petition ) {
        // Petition Procedure
        is_petition = true;
        bot_question = await mainPetition(userMessage, hash);      
        // if(petition is end) { is_petition = false }  
        socket.emit("response", bot_question);
      }
      else {
        // ChatGPT Working
        bot_question = await aiAnswer(userMessage, hash);
        socket.emit("response", bot_question);
      }
    } catch (error) {
      console.error("Error querying OpenAI:", error);
      socket.emit("error", "Failed to fetch response from OpenAI.");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    delete chat_sessions[socket.id]; // Cleanup session
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
