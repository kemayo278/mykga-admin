import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { auth, db } from "../firebase-config";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import iconuser from "../Sample_User_Icon.png";
import { signOut } from "firebase/auth";

export default function NavBar() {
    const [isActive , setIsActive] = useState(true);

    const {currentUser} = useContext(AuthContext);

    const [notifications, setNotifications] = useState([]);

    const [countnotification, setCountNotification] = useState(0);

    const [currentuser,setCurrentUser] = useState({});

    const [loadingiconuser,setLoadingIconUser] = useState(false);

    const {dispatch} = useContext(AuthContext);

    const navigate = useNavigate();

    const AddToogleBar = () => {
      let element = document.getElementById("root");
      if (isActive) {
        element.className = "toggle-sidebar";
      }
      else{
        element.className = "";
      }
      setIsActive(current => !current);
    }

    const handleLogout = async () => {
      try {
        await signOut(auth);
        dispatch({ type: "LOGOUT" });
        navigate('/SignIn');
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      const fetchCurrentUser = async () => {
          const docRef = doc(db , "users", currentUser.uid);
          const snapshot = await getDoc(docRef);
          setLoadingIconUser(true);
          if(snapshot.exists()){
            let currentuserData = snapshot.data();
            let currentuserFulname = currentuserData.user_fulname;
            let currentuserImg = currentuserData.user_img;
            if (currentuserFulname.length > 10 ) {
              currentuserFulname = currentuserFulname.substr(0, 11);
            }
            if(!currentuserImg || currentuserImg === ""){
              let fileurl = "https://kokitechgroup.cm/iconuser.png";
              currentuserImg = fileurl;
            }
            setCurrentUser({currentuserImg : currentuserImg,currentuserFulname : currentuserFulname ,...currentuserData});
            setLoadingIconUser(false);
          }
          else{
            console.log("ce document n'existe pas");
            navigate("/");
          }
      };

      const fetchNotifications = async () => {
        try {
          const unsubscribeNotifications = onSnapshot(
            query(collection(db, "notifications"), orderBy("notification_timeStamp", "desc"),where("notification_state","==","not_read"),where("notification_location","==","app-web")),
            async (notificationsSnapshot) => {
              const userSnapshot = await getDocs(collection(db, "users"));
    
              const notificationsList = notificationsSnapshot.docs.map((doc) => {
                const notificationData = doc.data();
                const userId = notificationData.notification_learner;
                const userData = userSnapshot.docs.find((userDoc) => userDoc.id === userId).data();
    
                return {
                  notification_id : doc.id,
                  ...notificationData,
                  user : userData
                };
              });
              
              setNotifications(notificationsList);
            }
          );
          return () => {
            unsubscribeNotifications();
          };
        } catch (error) {
          console.log(error);
        }
      };

      const getCountNotifications = async () => {
        try {
          const querySnapshot = query(
            collection(db, "notifications"),
            where("notification_state", "==", "not_read"),
            where("notification_location", "==", "app-web")
          );
      
          const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
            const totalCountNotification = snapshot.docs.length;
            setCountNotification(totalCountNotification);
          });
      
          return unsubscribe;
        } catch (error) {
          console.error('Erreur lors du comptage des éléments de la collection:', error);
        }
      };

      currentUser.uid && fetchCurrentUser() && fetchNotifications() && getCountNotifications();
    }, [currentUser.uid]);

    function convertTimestampToDatetime(timestamp) {
      const date = timestamp.toDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const formattedDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
      return formattedDatetime;
    }

    console.log(notifications);

  return (
    <>
    <header id="header" class="header fixed-top d-flex align-items-center">
      <div class="d-flex align-items-center justify-content-between">
        <a href="index.html" class="logo d-flex align-items-center">
          <img src="/assets/img/logo.png" alt="" />
          <span class="d-none d-lg-block">KGA ADMIN</span>
        </a>
        <i class="bi bi-list toggle-sidebar-btn" onClick={AddToogleBar}></i>
      </div>

      <div class="search-bar">
        <form
          class="search-form d-flex align-items-center"
          method="POST"
          action="#"
        >
          <input
            type="text"
            name="query"
            placeholder="Search"
            title="Enter search keyword"
          />
          <button type="submit" title="Search">
            <i class="bi bi-search"></i>
          </button>
        </form>
      </div>

      <nav class="header-nav ms-auto">
        <ul class="d-flex align-items-center">
          <li class="nav-item d-block d-lg-none">
            <a class="nav-link nav-icon search-bar-toggle" href="#">
              <i class="bi bi-search"></i>
            </a>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
              <i class="bi bi-bell"></i>
              {countnotification !== 0 && <span class="badge bg-primary badge-number">{countnotification}</span>}
            </a>

            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications">
              <li class="dropdown-header">
              {countnotification !== 0 && <>
                You have {countnotification} new notification{countnotification > 1 && <>s</>}
                <Link to="/Subscriptions">
                  <span class="badge rounded-pill bg-primary p-2 ms-2">
                    View all
                  </span>
                </Link>
                </>
              }
              {countnotification === 0 && <span style={{ fontWeight: "bold" }}> Aucune notification !! </span>}
              </li>
              {countnotification !== 0 && <>
              <li>
                <hr class="dropdown-divider" />
              </li>

              {notifications && notifications.map((notification) => {
                return (
                  <>
                    <li class="notification-item">
                      <i class="bi bi-exclamation-circle text-warning"></i>
                      <div>
                        <h4>{notification.user.user_fulname}</h4>
                        <p>{notification.notification_content}</p>
                        <p>{convertTimestampToDatetime(notification.notification_timeStamp)}</p>
                      </div>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                  </>
                );
               })}
              <li class="dropdown-footer">
                <Link to="/Subscriptions">Show all notifications</Link>
              </li>
              </>}
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link nav-icon" href="#" data-bs-toggle="dropdown">
              <i class="bi bi-chat-left-text"></i>
              <span class="badge bg-success badge-number">3</span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow messages">
              <li class="dropdown-header">
                You have 3 new messages
                <a href="#">
                  <span class="badge rounded-pill bg-primary p-2 ms-2">
                    View all
                  </span>
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>

              <li class="message-item">
                <a href="#">
                  <img
                    src="assets/img/messages-1.jpg"
                    alt=""
                    class="rounded-circle"
                  />
                  <div>
                    <h4>Maria Hudson</h4>
                    <p>
                      Velit asperiores et ducimus soluta repudiandae labore
                      officia est ut...
                    </p>
                    <p>4 hrs. ago</p>
                  </div>
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>

              <li class="message-item">
                <a href="#">
                  <img
                    src="assets/img/messages-2.jpg"
                    alt=""
                    class="rounded-circle"
                  />
                  <div>
                    <h4>Anna Nelson</h4>
                    <p>
                      Velit asperiores et ducimus soluta repudiandae labore
                      officia est ut...
                    </p>
                    <p>6 hrs. ago</p>
                  </div>
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>

              <li class="message-item">
                <a href="#">
                  <img
                    src="assets/img/messages-3.jpg"
                    alt=""
                    class="rounded-circle"
                  />
                  <div>
                    <h4>David Muldon</h4>
                    <p>
                      Velit asperiores et ducimus soluta repudiandae labore
                      officia est ut...
                    </p>
                    <p>8 hrs. ago</p>
                  </div>
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>

              <li class="dropdown-footer">
                <a href="#">Show all messages</a>
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown pe-3">
            <a
              class="nav-link nav-profile d-flex align-items-center pe-0"
              href="#"
              data-bs-toggle="dropdown"
            >
              <img
                src={loadingiconuser ? "https://kokitechgroup.cm/iconuser.png" : currentuser.currentuserImg}
                style={{ width : "40px", height: "40px", objectFit : "cover" }}
                class="rounded-circle"
              />
              <span class="d-none d-md-block dropdown-toggle ps-2">
                {currentuser.currentuserFulname}
              </span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li class="dropdown-header">
                <h6>{currentuser.user_fulname}</h6>
                <span>{currentuser.user_type}</span>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>

              <li>
                <Link
                  class="dropdown-item d-flex align-items-center"
                  to="/Profile"
                >
                  <i class="bi bi-person"></i>
                  <span>My Profile</span>
                </Link>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>

              <li>
                <Link
                  class="dropdown-item d-flex align-items-center"
                  to="/Profile"
                >
                  <i class="bi bi-gear"></i>
                  <span>Account Settings</span>
                </Link>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>

              <li>
                <button onClick={handleLogout} class="dropdown-item d-flex align-items-center">
                  <i class="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
    </>
  );
}
