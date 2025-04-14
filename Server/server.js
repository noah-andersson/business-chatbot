const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { sendMessageToOpenAI } = require("./openai");
const dbconfig = require("./db/config");
const crypto = require("crypto");
const { questions } = require("./lib/questions");
const ChatSession = require("./db/models/chat-session");
const Message = require("./db/models/message");

const { isBookingCheck } = require("./utils/isBookingCheck");

dotenv.config();

const app = express();

mongoose.connect(dbconfig.db_url);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const saveMessage = async (message, hash) => {
  const message_obj = await Message.create({
    sessionId: hash,
    time: new Date(),
    ...message,
  });
  await message_obj.save();
};

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);
  const chatSessions = {};
  const newUser = {};

  // Create a new chat session for each user
  const hash = parseInt(
    crypto.createHash("md5").update(socket.id).digest("hex").slice(0, 8),
    16
  ).toString(10);

  socket.emit("response", questions[1]);

  // Send message with user and bot
  socket.on("message", async (userMessage) => {
    try {
      let botMessage = {};

      // About the initial questions
      switch (userMessage.content_id) {
        // 3 Initial Questions + (-2)
        case -2:
          newUser.userName = userMessage.content;
          botMessage = questions[2];
          botMessage = {
            ...botMessage,
            content: `Hi ${userMessage.content}, nice to meet you!\n${botMessage.content}`,
          };
          socket.emit("response", botMessage);
          // await saveMessage(botMessage, hash);
          break;
        case -1:
          newUser.userEmail = userMessage.content;
          botMessage = questions[3];
          botMessage = {
            ...botMessage,
            content: `Good. I have received your name and email address.\n${botMessage.content}`,
          };
          socket.emit("response", botMessage);
          break;

        case 0:
          const all_previous_messages = await Message.find({
            sessionId: userMessage.content,
          });
          // New User
          if (all_previous_messages.length === 0) {
            newUser.sessionId = hash;
            botMessage = questions[5];
            botMessage = {
              ...botMessage,
              content: hash + "\n" + botMessage.content,
            };
            socket.emit("response", botMessage);
            
            // Create NewChatSession
            const newChatSession = new ChatSession(newUser);
            await newChatSession.save();
          }
          // Session ID exists
          else {
            socket.emit("response", questions[4]);
            // await saveMessage(questions[4], hash);

            all_previous_messages.map((previous_message) => {
              socket.emit("response", previous_message);
            });
          }
          break;

        // Main Chatting
        default:
          // Saving user's message
          await saveMessage(userMessage, hash);

          if (isBookingCheck(userMessage.content)) {
            botMessage = questions[6];
            botMessage = {
              ...botMessage,
              content_id: userMessage.content_id,
            };
            socket.emit("response", botMessage);
            await saveMessage(botMessage, hash);
          } else {
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
            socket.emit("response", botMessage);
          }
          break;
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
