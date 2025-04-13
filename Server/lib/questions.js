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
    content: "If you have already Session ID, send me please.",
  },
  {
    sender: "bot",
    content_id: 3,
    content:
      "Your Session ID is correct.\nSo you can chat continuously.\nWhat do you want to know?",
  },
  {
    sender: "bot",
    content_id: 4,
    content:
      "Your Session ID is not correct.\nPlease copy above and recover chatting later.\nHow can I help you now?",
  },
];

module.exports = { questions };
