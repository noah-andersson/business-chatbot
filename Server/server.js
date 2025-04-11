const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { createServer } = require("http");
const dotenv = require("dotenv");
const { sendMessageToOpenAI } = require("./openai");
const dbconfig = require("./db/config");
const crypto = require("crypto");
const ChatSession = require("./db/models/chat");
const Message = require("./db/models/message");
const { questions } = require("./lib/questions");

dotenv.config();

const app = express();

mongoose
  .connect(dbconfig.db_url)
  .then(console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Store chat sessions
const chatSessions = {};

const saveMessage = async (message, hash) => {
  const message_obj = await Message.create({
    sessionId: hash,
    time: new Date(),
    ...message,
  });
  await message_obj.save();
};

const restoreChatSession = async (hash) => {
  const chat_session = await ChatSession.findOne({ sessionId: hash });
  if (chat_session) {
    const messages = await Message.find({ sessionId: hash });
    return messages;
  } else {
    return null;
  }
};

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  // Create a new chat session for each user
  if (!chatSessions[socket.id]) {
    chatSessions[socket.id] = {};
    chatSessions[socket.id].questionId = 0;
    const message = questions[chatSessions[socket.id].questionId];
    chatSessions[socket.id].messages = [message];

    const hash = parseInt(
      crypto.createHash("md5").update(socket.id).digest("hex").slice(0, 8),
      16
    ).toString(10);
    chatSessions[socket.id].sessionId = hash;

    const chat_session = await ChatSession.findOne({ sessionId: hash });
    if (chat_session) {
      console.log("Chat session already exists:", chat_session);
    } else {
      const newChatSession = new ChatSession({
        user: "",
        email: "",
        sessionId: hash,
      });
      await newChatSession.save();
    }

    await saveMessage(message, hash);
    // Send a welcome message and ask for the user's name
    socket.emit("response", message);
  }

  socket.on("message", async (userMessage) => {
    try {
      console.log(`Received message from ${socket.id}:`, userMessage.content);
      await saveMessage(userMessage, chatSessions[socket.id].sessionId);
      // Add user message to session history
      chatSessions[socket.id].messages.push(userMessage);
      if (userMessage.type === "input") {
        if (chatSessions[socket.id].questionId < questions.length - 1) {
          var message;
          if (chatSessions[socket.id].questionId === 0) {
            chatSessions[socket.id].questionId++;
            message = questions[chatSessions[socket.id].questionId];
            message = {
              ...message,
              content: `Hi ${userMessage.content}, nice to meet you!\n${message.content}`,
            };
          } else if (chatSessions[socket.id].questionId === 1) {
            chatSessions[socket.id].questionId++;
            message = questions[chatSessions[socket.id].questionId];
            message = { ...message, content: `${message.content}` };
          } else if (chatSessions[socket.id].questionId === 3) {
            const messages = await restoreChatSession(userMessage.content);
            if (messages) {
              socket.emit("chat_session", messages);
              return;
            } else {
              chatSessions[socket.id].questionId = 5;
              message = questions[chatSessions[socket.id].questionId];
            }
          }
          chatSessions[socket.id].messages.push(message);
          await saveMessage(message, chatSessions[socket.id].sessionId);
          socket.emit("response", message);
        } else {
          socket.emit("response", {
            content: "Thank you for your time. We will get back to you soon.",
            type: "text",
          });
          return;
        }
      } else if (userMessage.type === "select") {
        if (chatSessions[socket.id].questionId === 2) {
          if (userMessage.content === "yes") {
            chatSessions[socket.id].questionId++;
            const message = questions[chatSessions[socket.id].questionId];
            chatSessions[socket.id].messages.push(message);
            socket.emit("response", message);
          } else {
            chatSessions[socket.id].questionId = 4;
            var message = questions[chatSessions[socket.id].questionId];
            const hash = parseInt(
              crypto
                .createHash("md5")
                .update(socket.id)
                .digest("hex")
                .slice(0, 8),
              16
            ).toString(10);
            message = {
              ...message,
              content: `Thank you\n${message.content}${hash}`,
            };

            chatSessions[socket.id].messages.push(message);
            await saveMessage(message, chatSessions[socket.id].sessionId);
            socket.emit("response", message);
            return;
          }
        } else {
        }
      } else {
        // Query OpenAI for a response
        const aiMessage = await sendMessageToOpenAI(userMessage.content);

        var message = { type: "text", sender: "bot", content: aiMessage };
        // Add AI response to session history
        chatSessions[socket.id].messages.push(message);
        await saveMessage(message, chatSessions[socket.id].sessionId);

        // Send AI response back to the user
        socket.emit("response", message);
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
