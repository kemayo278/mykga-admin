import { Routes,Route, Navigate } from "react-router-dom";
import SignIn from "./SignIn";
import Dashboard from "./private/Dashboard";
import Profile from "./private/Profile";
import { AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import User from "./private/User";
import NewUser from "./private/NewUser";
import UpdateUser from "./private/UpdateUser";
import Category from "./private/Category";
import "./App.css";
import AddUpdateCategory from "./private/AddUpdateCategory";
import Training from "./private/Training";
import AddUpdateTraining from "./private/AddUpdateTraining";
import ViewTraining from "./private/ViewTraining";
import Questionnaire from "./private/Questionnaire";
import Question from "./private/Question";
import PageNotFound from "./private/404";
import AddUpdateQuestionnaire from "./private/AddUpdateQuestionnaire";
import Module from "./private/Module";
import AddUpdateModule from "./private/AddUpdateModule";
import AddUpdateQuestion from "./private/AddUpdateQuestion";
import ModuleView from "./private/ModuleView";
import Teacher from "./private/Teacher";
import Subscription from "./private/Subscription";
import Chat from "./private/Chat";
import Learner from "./private/Learner";

function App() {
  const {currentUser} = useContext(AuthContext);
  const RequireAuth = ({ children }) =>{
    return currentUser ? children : <Navigate to="/" />;
  }
  
  // console.log(currentUser.uid);
  return (
    <>
      <Routes>
        <Route path="/" element={<SignIn/>} />
        <Route path="/SignIn" element={<SignIn/>} />
        <Route path="/Users" element={
          <RequireAuth>
            <User/>
          </RequireAuth>
        } />      
        <Route path="/New-User" element={
          <RequireAuth>
            < NewUser/>
          </RequireAuth>
        } /> 
        <Route path="/Update-A-User/:id" element={
          <RequireAuth>
            < NewUser/>
          </RequireAuth>
        } />  
        <Route path="/Update-User/:id" element={
          <RequireAuth>
            < UpdateUser/>
          </RequireAuth>
        } />                           
        <Route path="/Dashboard" element={<RequireAuth><Dashboard/></RequireAuth>} />

        <Route path="/Categories" element={<RequireAuth><Category/></RequireAuth>}></Route> 
        <Route path="/Add-Category" element={<RequireAuth><AddUpdateCategory/></RequireAuth>} />
        <Route path="/Update-Category/:category_id" element={<RequireAuth><AddUpdateCategory/></RequireAuth>} />

        <Route path="/Trainings" element={<RequireAuth><Training/></RequireAuth>}></Route> 
        <Route path="/Add-Training" element={<RequireAuth><AddUpdateTraining/></RequireAuth>} />
        <Route path="/View-Training/:training_id" element={<RequireAuth><ViewTraining/></RequireAuth>} />
        <Route path="/Update-Training/:training_id" element={<RequireAuth><AddUpdateTraining/></RequireAuth>} />

        <Route path="/Modules" element={<RequireAuth><Module/></RequireAuth>}></Route> 
        <Route path="/Add-Module" element={<RequireAuth><AddUpdateModule/></RequireAuth>}></Route> 
        <Route path="/Update-Module/:module_id" element={<RequireAuth><AddUpdateModule/></RequireAuth>} />
        <Route path="/View-Module/:module_id" element={<RequireAuth><ModuleView/></RequireAuth>} />

        <Route path="/Questionnaires" element={<RequireAuth><Questionnaire/></RequireAuth>}></Route> 
        <Route path="/Add-Questionnaire" element={<RequireAuth><AddUpdateQuestionnaire/></RequireAuth>} />
        <Route path="/Update-Questionnaire/:questionnaire_id" element={<RequireAuth><AddUpdateQuestionnaire/></RequireAuth>} />

        <Route path="/Questions" element={<RequireAuth><Question/></RequireAuth>}></Route>
        <Route path="/Add-Tag" element={<RequireAuth><AddUpdateQuestion/></RequireAuth>} />
        <Route path="/Update-Tag/:question_id" element={<RequireAuth><AddUpdateQuestion/></RequireAuth>} />

        <Route path="/Teachers" element={<RequireAuth><Teacher/></RequireAuth>}></Route>
        <Route path="/Learners" element={<RequireAuth><Learner/></RequireAuth>}></Route>

        <Route path="/Subscriptions" element={<RequireAuth><Subscription/></RequireAuth>}></Route>

        <Route path="/Chat" element={<RequireAuth><Chat/></RequireAuth>}></Route>
               
        <Route path="/404-NotFound" element={<PageNotFound/>} />
        <Route path="/Profile" element={<Profile/>} />
      </Routes>
    </>
  );
}

export default App;
