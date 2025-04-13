const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { sendMessageToOpenAI } = require("./openai");
const dbconfig = require("./db/config");
const crypto = require("crypto");
const { questions } = require("./lib/questions");
const ChatSession = require("./db/models/chat");
const Message = require("./db/models/message");

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

  // Create a new chat session for each user
  chatSessions[socket.id] = {};
  const hash = parseInt(
    crypto.createHash("md5").update(socket.id).digest("hex").slice(0, 8),
    16
  ).toString(10);
  chatSessions[socket.id].sessionId = hash;

  const newChatSession = new ChatSession({
    sessionId: hash,
  });
  await newChatSession.save();
  await saveMessage(questions[1], hash);
  socket.emit("response", questions[1]);

  // Send message with user and bot
  socket.on("message", async (userMessage) => {
    try {
      await saveMessage(userMessage, chatSessions[socket.id].sessionId);
      let botMessage = {};

      // About the initial questions
      switch (userMessage.content_id) {
        case 1:
          botMessage = questions[2];
          botMessage = {
            ...botMessage,
            content: `Hi ${userMessage.content}, nice to meet you!\n${botMessage.content}`,
          };
          socket.emit("response", botMessage);
          await saveMessage(botMessage, hash);
          break;

        case 2:
          const all_previous_messages = await Message.find({
            sessionId: userMessage.content,
          });
          // New User
          if (all_previous_messages.length === 0) {
            botMessage = questions[4];
            botMessage = {
              ...botMessage,
              content: hash + "\n" + botMessage.content,
            };
            socket.emit("response", botMessage);
            await saveMessage(botMessage, hash);
          }
          // Session ID exists
          else {
            socket.emit("response", questions[3]);
            await saveMessage(questions[3], hash);

            all_previous_messages.map((previous_message) => {
              socket.emit("response", previous_message);
            });
          }
          break;

        // Main Chatting
        default:
          // Query OpenAI for a response
          const aiMessage = await sendMessageToOpenAI(userMessage.content);

          var message = {content_id: userMessage.content_id + 1, sender: "bot", content: aiMessage };

          // Add AI response to session history
          await saveMessage(message, chatSessions[socket.id].sessionId);
          // Send AI response back to the user
          socket.emit("response", message);
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
