const questions = [
  {},
  {
    sender: "bot",
    content_id: 1,
    content: "Welcome to the chat. What's your name?",
  },
  {
    sender: "bot",
    content_id: 2,
    content: "Could you input your email address?",
  },
  {
    sender: "bot",
    content_id: 3,
    content: "If you have already Session ID, send me please.",
  },
  {
    sender: "bot",
    content_id: 4,
    content:
      "Your Session ID is correct.\nSo you can chat continuously.\nWhat do you want to know?",
  },
  {
    sender: "bot",
    content_id: 4,
    content:
      "Your Session ID is not correct.\nPlease copy above and recover chatting later. How can I help you now?",
  },

  {
    sender: "bot",
    content_id: 5,
    content: "I think you are booking now, aren't you?\nType your city please.",
  },
];

module.exports = { questions };
