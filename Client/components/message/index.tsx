import React, { FC, useEffect, useState } from "react";
import { Message } from "@/types";
import styles from "../../App.module.scss";

const MessageView: FC<Message> = (props) => {
  const message = props;
  const [formattedTime, setFormatedTime] = useState<string>("");

  useEffect(() => {
    import("dayjs").then(({ default: moment }) => {
      setFormatedTime(moment(message.time).format("HH:mm"));
    });
  }, [message.time]);

  return (
    <div data-testid="message" style={{ minHeight: 32 }}>
      <div
        className={[
          message.sender === "bot" ? styles.botText : styles.inputText,
          styles.text,
        ].join(" ")}
      >
        {message.content && <span>{message.content}</span>}

        <span className={styles.time}>{formattedTime}</span>
      </div>
      <br />
    </div>
  );
};

export default MessageView;
