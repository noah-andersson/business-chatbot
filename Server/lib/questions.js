const basic_questions = [
  {},
  {
    id: 1,
    sender: "bot",
    type: "input",
    label: "user_name",
    content: "Welcome to the business chatting room. What's your name?",
    options: [],
  },
  {
    id: 2,
    sender: "bot",
    type: "input",
    label: "user_email",
    content: "Could you input your email address?",
    options: [],
  },
  {
    id: 3,
    sender: "bot",
    type: "input",
    label: "session_id",
    content: "Good. If you have already Session ID, send me please.",
    options: [],
  },
  {
    id: 4,
    sender: "bot",
    type: "input",
    label: "session_id_correct",
    content: "Your Session ID is correct.\nSo you can chat continuously.\nWhat do you want to know?",
    options: [],
  },
  {
    id: 5,
    sender: "bot",
    type: "input",
    label: "session_id_incorrect",
    content: "This is your new Session ID.\nPlease copy above and recover chatting later.\nHow can I help you now?",
    options: [],
  },
  {
    id: 6,
    sender: "bot",
    type: "select",
    label: "is_booking",
    content: "I think you are booking now, aren't you?",
    options: [
      { label: "Yes, I am booking.", value: "yes" },
      { label: "No, I won't.", value: "no" }
    ]
  },
  {
    id: 7,
    sender: "bot",
    type: "select",
    label: "user_city",
    content: "What is your city?",
    options: [],
  },
  {
    id: 8,
    sender: "bot",
    type: "select",
    label: "branch_office",
    content: "Okay. Select branch office you want.",
    options: [],
  },
  {
    id: 9,
    sender: "bot",
    type: "select",
    label: "department_selection",
    content: "What kind of service do you want?",
    options: [],
  },
  {
    id: 10,
    sender: "bot",
    type: "input",
    label: "schedule_day",
    content: "Select day you want to get service.",
    options: [],
  },
  
];

module.exports = { basic_questions };
