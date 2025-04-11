const questions = [
  {
    type: "input",
    sender: 'bot',
    content: "Welcome to the chatting room.\nWhat's your name?"
  },
  {
    type: "input",
    sender: 'bot',
    content: "What is your email address?"
  },
  {
    type: "select",
    sender: 'bot',
    content: "Do you remember your previous session id?",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" }
    ]
  }, 
  {
    type: "input",
    sender: 'bot',
    content: "Give me your session id"
  },
  {
    type: "text",
    sender: 'bot',
    content: "Keep this session id for future reference: "
  },
  {
    type: "text",
    sender: 'bot',
    content: "Couldn't find your session. How can I help you today?"
  },
];

module.exports = { questions };
