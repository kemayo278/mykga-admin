import React, { useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/firestore";

const ChatApp = () => {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Récupérer la liste des contacts depuis la collection "users" de Firebase Firestore
    const fetchContacts = async () => {
      try {
        const contactsSnapshot = await firebase.firestore().collection("users").get();
        const contactsData = contactsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(contactsData);
      } catch (error) {
        console.log("Erreur lors de la récupération des contacts :", error);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    // Récupérer les messages pour le contact sélectionné depuis la collection "messages" de Firebase Firestore
    if (selectedContactId) {
      const fetchMessages = async () => {
        try {
          const messagesSnapshot = await firebase
            .firestore()
            .collection("messages")
            .where("senderId", "==", selectedContactId)
            .get();
          const messagesData = messagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(messagesData);
        } catch (error) {
          console.log("Erreur lors de la récupération des messages :", error);
        }
      };

      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedContactId]);

  const handleContactClick = (contactId) => {
    setSelectedContactId(contactId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      await firebase.firestore().collection("messages").add({
        senderId: selectedContactId,
        content: newMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      console.log("Erreur lors de l'envoi du message :", error);
    }
  };

  return (
    <div className="container">
      <div className="row clearfix">
        <div className="col-lg-12">
          <div className="card chat-app">
            <div id="plist" className="people-list">
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text" style={{ padding: "10px" }}>
                    <i className="fa fa-search"></i>
                  </span>
                </div>
                <input type="text" className="form-control" placeholder="Search..." />
              </div>
              <ul className="list-unstyled chat-list mt-2 mb-0">
                {contacts.map((contact) => (
                  <li
                    className={`clearfix ${selectedContactId === contact.id ? "active" : ""}`}
                    onClick={() => handleContactClick(contact.id)}
                    key={contact.id}
                  >
                    <img src={contact.avatar} alt="avatar" />
                    <div className="about">
                      <div className="name">{contact.name}</div>
                      <div className="status">
                        <i className={`fa fa-circle ${contact.online ? "online" : "offline"}`}></i>{" "}
                        {contact.online ? "online" : `left ${contact.lastSeen}`}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="chat">
              <div className="chat-header clearfix">
                <div className="row">
                  <div className="col-lg-6">
                    {selectedContactId && (
                      <>
                        <img src={selectedContact.avatar} alt="avatar" />
                        <div className="chat-about">
                          <h6 className="m-b-0">{selectedContact.name}</h6>
                          <small>Last seen: {selectedContact.lastSeen}</small>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="col-lg-6 hidden-sm text-right">
                    <div style={{ float: "right" }}>
                      <a href="javascript:void(0);" className="btn btn-outline-info">
                        <i className="fa fa-cogs"></i>
                      </a>
                      <a href="javascript:void(0);" className="btn btn-outline-warning">
                        <i className="fa fa-question"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="chat-history"
                style={{ height: "50vh", overflowY: "scroll", scrollBehavior: "inherit" }}
              >
                <ul className="m-b-0">
                  {messages.map((message) => (
                    <li className={`clearfix ${message.senderId === selectedContactId ? "other-message float-right" : "my-message"}`} key={message.id}>
                      {message.content}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="chat-message clearfix">
                <div className="input-group mb-0">
                  <div className="input-group-prepend">
                    <span className="input-group-text" style={{ padding: "15px" }}>
                      <i className="fa fa-send"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter text here..."
                    style={{ padding: "10px" }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary" onClick={handleSendMessage}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
