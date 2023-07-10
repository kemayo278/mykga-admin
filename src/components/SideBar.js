import React, { useContext, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();

  const isActiveMenuItem = (paths) => {
    return paths.some((path) => location.pathname.includes(path));
  };

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
              isActiveMenuItem(["/Questionnaires","/Questions","/Add-Questionnaire","/Add-Question","/Update-Questionnaire","/Update-Question"])
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
              isActiveMenuItem(["/Questionnaires","/Questions","/Add-Questionnaire","/Add-Question","/Update-Questionnaire","/Update-Question"]) ? "show" : ""
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
                className={isActiveMenuItem(["/Questions","/Add-Question","/Update-Question"]) ? "active" : ""}
                to="/Questions"
              >
                <i class="bi bi-circle"></i><span>Questions</span>
              </Link>
            </li>            
          </ul>
        </li>    
        <li class="nav-item">
          <a 
          className={
            isActiveMenuItem(["/Teachers"])
              ? "nav-link"
              : "nav-link collapsed"
          }
           data-bs-target="#icons-nav" data-bs-toggle="collapse" href="#">
            <i class="bi bi-gem"></i><span>Users</span><i class="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul id="icons-nav"
            className={`nav-content collapse ${
              isActiveMenuItem(["/Teacher"]) ? "show" : ""
            }`}
            data-bs-parent="#sidebar-nav">
            <li>
              <a href="#">
                <i class="bi bi-circle"></i><span>Basic Users</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i class="bi bi-circle"></i><span>Learners</span>
              </a>
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
              isActiveMenuItem(["/Users","/New-User","/Update-User"])
                ? "nav-link"
                : "nav-link collapsed"
            }
            to="/Users"
          >
            <i class="fa fa-comments-o"></i>
            <span>Chat</span>
          </Link>
        </li>        
      </ul>
    </aside>
  );
}
