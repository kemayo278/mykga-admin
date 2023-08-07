import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";

export default function SideBar() {
  const location = useLocation();

  const {currentUser} = useContext(AuthContext);

  const [loadingiconuser,setLoadingIconUser] = useState(false);

  const [currentuser,setCurrentUser] = useState({});

  const navigate = useNavigate();

  const isActiveMenuItem = (paths) => {
    return paths.some((path) => location.pathname.includes(path));
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

    currentUser.uid && fetchCurrentUser()
  }, [currentUser.uid]);


  return (
    <aside id="sidebar" class="sidebar">
      <ul class="sidebar-nav" id="sidebar-nav">
        <li class="nav-item">
          <Link
            className={
              isActiveMenuItem(["/Dashboard"])
                ? "nav-link"
                : "nav-link collapsed"
            }
            to="/Dashboard"
          >
            <i class="bi bi-grid"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li class="nav-item">
          <a
            className={
              isActiveMenuItem(["/Categories", "/Add-Category","/Update-Category","/Trainings","/Add-Training","/View-Training","/Update-Training","/Modules","/Add-Module","/Update-Module","/View-Module"])
                ? "nav-link"
                : "nav-link collapsed"
            }
            data-bs-target="#forms-nav"
            data-bs-toggle="collapse"
            href="#"
          >
            <i class="bi bi-journal-text"></i>
            <span>Trainings</span>
            <i class="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul
            id="forms-nav"
            className={`nav-content collapse ${
              isActiveMenuItem(["/Categories", "/Add-Category","/Update-Category","/Trainings","/Add-Training","/View-Training","/Update-Training","/Modules","/Add-Module","/Update-Module","/View-Module"]) ? "show" : ""
            }`}
            data-bs-parent="#sidebar-nav"
          >
            { currentuser.user_type == "Admin" ?
            <>
              <li>
                <Link
                  className={isActiveMenuItem(["/Categories","/Add-Category","/Update-Category"]) ? "active" : ""}
                  to="/Categories"
                >
                  <i class="bi bi-circle"></i>
                  <span>Categories</span>
                </Link>
              </li>
              <li>
                <Link
                  className={isActiveMenuItem(["/Trainings","/Add-Training","/View-Training","/Update-Training"]) ? "active" : ""}
                  to="/Trainings"
                >
                  <i class="bi bi-circle"></i>
                  <span>Trainings</span>
                </Link>
              </li>
            </>
            : "" }
            <li>
              <Link
                className={isActiveMenuItem(["/Modules","/Add-Module","/Update-Module","/View-Module"]) ? "active" : ""}
                to="/Modules"
              >
                <i class="bi bi-circle"></i>
                <span>Modules</span>
              </Link>
            </li>            
          </ul>
        </li>
        <li class="nav-item">
          <a 
            className={
              isActiveMenuItem(["/Questionnaires","/Questions","/Add-Questionnaire","/Add-Tag","/Update-Questionnaire","/Update-Tag"])
                ? "nav-link"
                : "nav-link collapsed"
            }
            data-bs-target="#components-nav" 
            data-bs-toggle="collapse" 
            href="#"
          >
            <i class="bi bi-menu-button-wide"></i><span>exercises</span><i class="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul 
            id="components-nav" 
            className={`nav-content collapse ${
              isActiveMenuItem(["/Questionnaires","/Questions","/Add-Questionnaire","/Add-Tag","/Update-Questionnaire","/Update-Tag"]) ? "show" : ""
            }`}
            data-bs-parent="#sidebar-nav"
          >
            <li>
              <Link 
                className={isActiveMenuItem(["/Questionnaires","/Add-Questionnaire","/Update-Questionnaire"]) ? "active" : ""}
                to="/Questionnaires"
              >
                <i class="bi bi-circle"></i><span>Questionnaires</span>
              </Link>
            </li>
            <li>
              <Link 
                className={isActiveMenuItem(["/Questions","/Add-Tag","/Update-Tag"]) ? "active" : ""}
                to="/Questions"
              >
                <i class="bi bi-circle"></i><span>Questions</span>
              </Link>
            </li>            
          </ul>
        </li>
        {currentuser.user_type == "Admin" ?
        <>
        <li class="nav-item">
          <a 
          className={
            isActiveMenuItem(["/Teachers", "/Learners"])
              ? "nav-link"
              : "nav-link collapsed"
          }
           data-bs-target="#icons-nav" data-bs-toggle="collapse" href="#">
            <i class="bi bi-gem"></i><span>Users</span><i class="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul id="icons-nav"
            className={`nav-content collapse ${
              isActiveMenuItem(["/Teacher", "/Learners"]) ? "show" : ""
            }`}
            data-bs-parent="#sidebar-nav">
            <li>
              <Link
                className={isActiveMenuItem(["/Learners"]) ? "active" : ""}
                to="/Learners"
              >
                <i class="bi bi-circle"></i><span>Learners</span>
              </Link>
            </li>
            <li>
              <Link
                className={isActiveMenuItem(["/Teachers"]) ? "active" : ""}
                to="/Teachers"
              >
                <i class="bi bi-circle"></i><span>Teachers</span>
              </Link>
            </li>
          </ul>
        </li>    
        <li class="nav-item">
          <Link
            className={
              isActiveMenuItem(["/Subscriptions"])
                ? "nav-link"
                : "nav-link collapsed"
            }
            to="/Subscriptions"
          >
            <i class="bi bi-cart-check"></i>
            <span>Subscriptions</span>
          </Link>
        </li>
        </>
        : "" }
        <li class="nav-item">
              <Link className={
                  isActiveMenuItem(["/Profile"])
                    ? "nav-link"
                    : "nav-link collapsed"
                }
                to="/Profile">
                {/* <i class="fa fa-comments-o"></i> */}
                <i class="bi bi-person"></i>
                <span>Profile</span>
              </Link>
        </li>
        <li class="nav-item">
          <Link
            className={
              isActiveMenuItem(["/Chat"])
                ? "nav-link"
                : "nav-link collapsed"
            }
            to="/Chat"
          >
            <i class="fa fa-comments-o"></i>
            <span>Chat</span>
          </Link>
        </li>        
      </ul>
    </aside>
  );
}
