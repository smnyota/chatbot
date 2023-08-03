import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import MoneyMentorLogo from '/Users/vahinpalle/hackathon/testGPTAPP/src/assets/Capital_One_logo.svg.png'; 

const API_KEY = "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";

const systemMessage = {
  "role": "system", "content": "Explain things like you are a financial advisor."
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm here to assist you with your finances!",
      sentTime: "just now",
      sender: "MoneyMentor"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage, 
        ...apiMessages 
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <header className="app-header">
        <img src={MoneyMentorLogo} alt="MoneyMentor Logo" className="logo" />
        <h1>MoneyMentor</h1>
      </header>
      <div style={{ position:"relative", height: "90vh", width: "100vw"  }}>
        <MainContainer>
          <ChatContainer className="chat-container">       
            <MessageList 
              className="message-list"
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput 
              className="message-input"
              placeholder="Type message here" 
              onSend={handleSend} 
            />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App