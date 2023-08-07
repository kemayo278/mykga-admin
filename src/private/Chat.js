import React, { useContext, useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import "../Chat.css";
import { addDoc, collection, doc, getDocs, onSnapshot, or, orderBy, query, serverTimestamp, servermessage_Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase-config";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Chat() {

  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchUser, setSearchUser] = useState('');
  const [selectedContact, setselectedContacts] = useState([]);
  const {currentUser} = useContext(AuthContext);
  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);
  const [currentContactMessages, setCurrentContactMessages] = useState([]);

  const handleSearch = (event) => {
    setSearchUser(event.target.value);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const unsubscribe = onSnapshot(query(collection(db, "users")),
          (snapShot) => {
            let list = [];
            snapShot.docs.forEach(async (doc) => {
              let userData = doc.data();
              const userId = doc.id;
              if (userId !== currentUser.uid) {
                let userImg = userData.user_img;
                if (userImg == "" || userImg == "null" || userImg == null ) {
                  userImg = "https://kokitechgroup.cm/iconuser.png";
                }
                let userFulname = userData.user_fulname;
                if (userFulname.length > 15 ) {
                  userFulname = userFulname.substr(0, 15);
                }

                list.push({ userId: doc.id,userImg : userImg,userFulname : userFulname, ...userData });
              }
            });
            setContacts(list);
          }
        );
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.log(error);
      }
    };
    fetchContacts();
  }, []);

  const getMessagesForSelectedContact  = () => {
    try {
      if (selectedContactId) {
        const chatRef = collection(db, "messages");
        const querySnapshot = onSnapshot(
          query(
            chatRef,
            where('message_receive', 'in', [currentUser.uid, selectedContactId]),
            where('message_sender', 'in', [currentUser.uid, selectedContactId]),
            orderBy ("message_timestamp", "asc")
          ),
          (snapshot) => {
            let list = [];
            snapshot.docs.forEach((doc) => {
              let messageData = doc.data();
              list.push({ id: doc.id, ...messageData });
            });
            setCurrentContactMessages(list);
          }
        );
        return () => {
          querySnapshot();
        };
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedContactId) {
      setCurrentContactMessages([]);
      const getSelectedContact = async () => {
        try {
          const docRef = doc(db, "users", selectedContactId);
          const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              let userImg = userData.user_img;
              if (userImg == "" || userImg == "null" || userImg == null) {
                userImg = "https://kokitechgroup.cm/iconuser.png";
              }
              let userFulname = userData.user_fulname;
              if (userFulname.length > 15) {
                userFulname = userFulname.substr(0, 15);
              }
      
              const contact = {
                userId: docSnapshot.id,
                userImg: userImg,
                userFulname: userFulname,
                ...userData
              };

              const newData = { notification_state: "read" };

              updateDocumentsByQuery("notifications", "xender", selectedContactId, newData);
      
              setselectedContacts([contact]);
            } else {
              setselectedContacts([]);
            }
          });
      
          return () => {
            unsubscribe();
          };
        } catch (error) {
          console.log(error);
        }
      };      
      getSelectedContact();
      getMessagesForSelectedContact();
    } else {
      setCurrentContactMessages([]);
    }
  }, [selectedContactId, currentUser.uid]);

  const handleContactClick = (contactId) => {
    setSelectedContactId(contactId);
    getMessagesForSelectedContact(); 
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    try {
      setLoadingSubmitButton(true);

      await addDoc(collection(db, "messages"), {
        message_sender: currentUser.uid,
        message_receive: selectedContactId,
        message_content: newMessage,
        message_fix: selectedContactId,
        message_timestamp: serverTimestamp(),
      });

      let notification_content = "Vous avez recu un message..." + newMessage;
      let notification_state = "not_read";
      let notification_location = "app-mobile";

      await addDoc(collection(db, "notifications"), {
          notification_learner : selectedContactId,
          notification_content : notification_content,
          notification_state : notification_state,
          notification_location : notification_location,
          notification_timeStamp: serverTimestamp(),
      });
      setNewMessage("");
      getMessagesForSelectedContact(); 
      setLoadingSubmitButton(false);
      return;
    } catch (error) {
      console.log("Erreur lors de l'envoi du message :", error);
    }
  };

  function convertmessage_TimestampToDatetime(message_timestamp) {
    const date = message_timestamp.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
    return formattedDatetime;
  }

  const updateDocumentsByQuery = async (collectionPath, queryField, queryValue, newData) => {
    try {
      const q = query(collection(db, collectionPath), where(queryField, "==", queryValue),where("notification_state", "==", "not_read"));
      const querySnapshot = await getDocs(q);
  
      for (const doc of querySnapshot.docs) {
        await updateDoc(doc.ref, newData);
      }
  
      console.log("Update successful");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <>
      <NavBar />
      <SideBar />
      <main id="main" class="main">
        <div class="pagetitle">
          <h1>Chat Assistance Learners</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a>Home</a>
              </li>
              <li class="breadcrumb-item active">Chat</li>
            </ol>
          </nav>
        </div>
        <section class="section dashboard">
          <div class="container">
            <div class="row clearfix">
              <div class="col-lg-12">
                <div class="card chat-app">
                  <div id="plist" class="people-list">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text" style={{ padding : "10px" }}>
                          <i class="fa fa-search"></i>
                        </span>
                      </div>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Search..."
                        value={searchUser}
                        onChange={handleSearch}
                      />
                    </div>
                    {/* list users begin */}
                    <ul class="list-unstyled chat-list mt-2 mb-0" style={{ height: "60vh", overflowY : "scroll",scrollBehavior : "inherit" }}>
                    {contacts && contacts
                      .filter(contact => contact.userFulname.toLowerCase().includes(searchUser.toLowerCase()))
                      .map((contact) => {
                        return (
                        <>
                          <li
                            className={`clearfix ${selectedContactId === contact.userId ? "active" : ""}`}
                            onClick={() => handleContactClick(contact.userId)} key={contact.userId}
                          >
                            <img src={contact.userImg} style={{ height: "45px", objectFit: "cover" }} alt="User Image"/>
                            {/* <br/> */}
                            <div class="about" style={{ marginTop : "10px" }}>
                              <div className={`name ${selectedContactId === contact.userId ? "text-weigth-bold" : ""}`}>{contact.userFulname}</div>
                              <div class="status">
                                {/* <i class="fa fa-circle offline"></i> .... */}
                              </div>
                            </div>
                          </li>
                        </>
                        );
                      })}
                    </ul>
                    {/* list users end */}
                  </div>
                  <div class="chat">
                    <div class="chat-header clearfix">
                      <div class="row">
                        <div class="col-lg-6">
                        {selectedContactId && selectedContact.map((selectedContact) => {
                          return (
                            <>
                              <Link to={selectedContact.userImg}>
                                <img
                                    src={selectedContact.userImg}
                                    style={{ height: "55px", width : "55px", objectFit: "cover" }}
                                    alt="avatar"
                                />
                              </Link>
                              <div class="chat-about">
                                <h6 class="m-b-0">{selectedContact.user_fulname}</h6>
                                <small>{selectedContact.user_email}</small>
                              </div>
                            </>
                          );
                        })}
                        </div>
                        <div class="col-lg-6 hidden-sm text-right">
                          <div style={{ float : "right"}}>
                            <a href="javascript:void(0);"class="btn btn-outline-primary" style={{ border : "2px solid #eeeeee" }}>
                                <i class="fa fa-cogs"></i>
                            </a>
                            <a href="javascript:void(0);" class="btn btn-outline-warning" style={{ border : "2px solid #eeeeee" }}>
                                <i class="fa fa-question"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="chat-history" style={{ height: "50vh", overflowY : "scroll",scrollBehavior : "inherit" }}>
                       {/* list messages begin */}
                      <ul class="m-b-0">
                        {selectedContactId && currentContactMessages.map((message) => (
                          <>
                            {message.message_sender === currentUser.uid ? (
                            <li class="clearfix">
                              <div className={`message ${message.message_sender === currentUser.uid ? "my-message float-right" : "other-message"}`} key={message.id}>
                                {message.message_content}
                              </div>
                            </li>
                            ): (
                              <li class="clearfix">
                                <div class="message-data">
                                  <span class="message-data-time">{convertmessage_TimestampToDatetime(message.message_timestamp)}</span>
                                </div>
                                <div class="message other-message">
                                  {message.message_content}
                                </div>
                              </li>
                            )}
                          </>
                        ))}
                      </ul>
                      {/* list messages begin */}
                    </div>
                    <div class="chat-message clearfix">
                      <div class="input-group mb-0">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Enter text here..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          style={{ padding : "10px" }}
                        />
                        <div class="input-group-prepend">
                          <span onClick={loadingsubmitbutton ? null : handleSendMessage} class="input-group-text" style={{ padding : "15px", cursor : "pointer", backgroundColor : "#4154f1" }}>
                            {loadingsubmitbutton ? <i style={{ color: "white" }} class="fa fa-refresh fa-spin"></i> : <i class="fa fa-send" style={{ color: "white" }}></i>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
