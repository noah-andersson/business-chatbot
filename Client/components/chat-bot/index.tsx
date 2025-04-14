import React, { useEffect, useState, useRef, KeyboardEvent } from "react";
import styles from "../../App.module.scss";
import TextareaAutosize from "react-textarea-autosize";
import io from "socket.io-client";
import { Message } from "@/types";
import MessageView from "../message";

const ChatBot = () => {
  const [idleTime, setIdleTime] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState<boolean>(true);
  const [typing, setTyping] = useState<boolean>(false);
  const [contentId, setContentId] = useState<number>(-2);

  const socketRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Listen for responses from the server
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    // Server sends a message labeled 'response'
    socketRef.current.on("response", (response: any) => {
      setMessages((prev) => [...prev, { ...response, time: Date.now() }]);
      setTyping(false);
    });    

    // Close socket connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("response");
        socketRef.current.disconnect();
      }
    };
  }, []);

  const onChange = (e: any) => {
    e.persist();
    setMessage(e.target.value);
  };

  const onSend = (text?: string): void => {
    setIdleTime(0);
    if (text || message.trim()) {
      setTyping(true);
      const userMessage = {
        sender: "user",
        content_id: contentId,
        content: text || message,
        time: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      if (socketRef.current) {
        socketRef.current.emit("message", userMessage);
        setContentId(prev => prev + 1);
      }
      setMessage("");
      return;
    }
  };

  const onEnter = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    if (e.charCode === 13 && message && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  useEffect(() => {
    const list = document.getElementById("chat-list-body") as HTMLDivElement;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
    inputRef.current?.focus();
  }, [messages.length]);

  return (
    <span className={styles.chatBot}>
      <div
        style={{
          width: open ? 500 : 0,
          height: open ? 600 : 0,
          opacity: open ? 1 : 0,
          transition: `opacity 300ms ease-out`,
        }}
        className={styles.chatBody}
      >
        <div className={styles.header}>
          <div className={styles.botLogo}>BOT</div>
          <div className={styles.display}>
            <div>Chat Assistant</div>
            <div>{typing ? "typing..." : "online"}</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="close"
            className={styles.close}
          >
            &times;
          </button>
        </div>
        <div id="chat-list-body" className={styles.body}>
          {messages.map((message: Message, index: number) => (
            <MessageView key={index} {...message} />
          ))}
        </div>

        {/* Deleting Section */}
        {idleTime > 240 && (
          <div
            onClick={() => setIdleTime(0)}
            className={styles.keepAlive}
            role="button"
            aria-label="keep open"
          >{`Chat assistant will close in ${
            300 - idleTime
          } seconds. Click here to keep alive`}</div>
        )}

        {
          <div className={styles.footer}>
            <TextareaAutosize
              onKeyPress={onEnter}
              placeholder="Write your question here..."
              onChange={onChange}
              value={message}
              maxRows={6}
              className={styles.input}
              disabled={typing || !open}
              ref={inputRef}
            />
            <img
              role="button"
              onClick={() => onSend()}
              className={styles.icon}
              alt=""
              src="/send.svg"
            />
          </div>
        }
      </div>
      {!open && (
        <div
          tabIndex={0}
          data-testid="open"
          role="button"
          onClick={() => setOpen(true)}
          aria-label="send message"
          className={styles.button}
        >
          <img alt="" src="/icon.svg" />
        </div>
      )}
    </span>
  );
};

export default ChatBot;
