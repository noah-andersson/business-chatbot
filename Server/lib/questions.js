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
    content_id: 3,
    content:
      "Your Session ID is not correct.\nPlease copy above and recover chatting later.\nHow can I help you now?",
  },
  {
    sender: "bot",
    content_id: 5,
    content: "Are you booking now?\nIf you agree please 'yes' or not 'no'",
  },
  {
    sender: "bot",
    content_id: 6,
    content: "Booking Start!",
  },
  {
    sender: "bot",
    content_id: 7,
    content: "It's okay. Go on.",
  },
  {
    sender: "bot",
    content_id: 8,
    content: "If you agree please 'yes' or not 'no'", 
  },
];

module.exports = { questions };
