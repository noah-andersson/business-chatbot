const isBookingCheck = (userMessage) => {  
  const promiseWords = ["book", "reservation", "promise", "appoint", "contact", "assign", "engage"];
  let booking_state = false;
  promiseWords.map(promiseWord => {
    if(userMessage.toLowerCase().includes(promiseWord)) {
      booking_state = true;
    }    
  });
  return booking_state;
}

const isBookingAnswer = (userMessage) => {
  if(userMessage === "yes" || "okay" || "y" || "yeah") {
    return {
      result: true,
      is_booking_state: false
    };
  } else if(userMessage === "no" || "n") {
    return {
      result: false,
      is_booking_state: false 
    }
  } else {
    return {
      result: false,
      is_booking_state: true
    }
  }
}

module.exports = {
  isBookingCheck,
  isBookingAnswer
};