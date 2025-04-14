const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Message = require("./model/Message");
const { saved_questions } = require("./lib/saved_questions");
const {
  initialAsking,
  isPetition,
  petitionAsking,
  mainPetition,
  aiAnswer,
} = require("./utils/answer_user");

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
  const chatSessions = {};
  chatSessions[socket.id] = socket;

  let bot_question = null;
  let is_petition = false;
  let petition_list_count = 1;

  // Create a new chat session for each user
  const hash = parseInt(
    crypto.createHash("md5").update(socket.id).digest("hex").slice(0, 8),
    16
  ).toString(10);

  socket.emit("response", saved_questions[1]);

  // Send message with user and bot
  socket.on("message", async (userMessage) => {
    try {
      // If bot asks user
      if (userMessage.content_id < 1) {
        bot_question = await initialAsking(userMessage, hash);
        socket.emit("response", bot_question);

        // If Existing SessionIS
        if (bot_question.content_id === 4) {
          const previous_messages = await Message.find({
            sessionId: userMessage.content,
          });
          previous_messages.map((previous_message) => {
            socket.emit("response", previous_message);
          });
        }
      }
      // If user wants petition
      else if (isPetition(userMessage.content)) {
        bot_question = await petitionAsking(userMessage, hash);
        socket.emit("response", bot_question);
        is_petition = true;
      }
      // If petition is started
      else if (is_petition) {
        bot_question = await mainPetition({...userMessage, content_id: petition_list_count ++}, hash);
        socket.emit("response", bot_question);
      }
      // If user asks bot
      else {
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
    delete chatSessions[socket.id]; // Cleanup session
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
