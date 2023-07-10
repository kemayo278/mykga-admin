import React, { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase-config";
import { useNavigate, useParams } from "react-router-dom";

const initialState = { question_description : "", question_questionnaire : "", question_choice_one : "", question_choice_two : "", question_choice_three : "", question_choice_four : "", question_choice_five : "", question_response : ""}

export default function AddUpdateQuestion() {

  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);

  const [loadinginput, setLoadingInput] = useState(false);
  
  const formRef = useRef();
  
  const [dataquestion,setDataQuestion] = useState(initialState);

  const [errors,setErrors] = useState({});

  const [success,setSucces] = useState("");

  const [questionnaires, setQuestionnaires] = useState([]);

  const {question_description,question_questionnaire,question_choice_one,question_choice_two,question_choice_three,question_choice_four,question_choice_five,question_response} = dataquestion;

  const {question_id} = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestionId = async () => {
        const docRef = doc(db , "questions", question_id);
        setLoadingInput(true)
        const snapshot = await getDoc(docRef);
        if(snapshot.exists()){
            setDataQuestion({...snapshot.data()});
            setLoadingInput(false);
        }
        else{
        console.log("ce document n'existe pas");
        navigate('/404-NotFound'); 
        }
    };
    question_id && fetchQuestionId();
  }, [question_id]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
        try {
          const unsubscribe = onSnapshot(
            query(collection(db, "questionnaires"), orderBy("timeStamp", "desc")),
            (snapShot) => {
              let list = [];
              snapShot.docs.forEach((doc) => {
                list.push({ questionnaire_id: doc.id , ...doc.data() });
              });
              setQuestionnaires(list);
            }
          );
          return () => {
            unsubscribe();
          };
        } catch (error) {
          errors.error = "An error occurred while executing the program fetching questionnaires";
          setErrors(errors)
        }    
    };    
    fetchQuestionnaire();
  }, []);

  const handleChange = (e) => {
    setDataQuestion({ ...dataquestion,[e.target.name] : e.target.value })
  }

  const validate = () => {
    let errors = {};
    if (!question_description || question_description.trim() === "") {
      errors.question_description  = "Question Description is required";
    }
    if (!question_questionnaire || question_questionnaire.trim() === "") {
        errors.question_questionnaire  = "Questionnaire name is required";
    }    
    if (!question_choice_one || question_choice_one.trim() === "") {
      errors.question_choice_one  = "Question choice one is required";
    }
    if (!question_choice_two || question_choice_two.trim() === "") {
      errors.question_choice_two  = "Question choice two is required";
    }  
    if (!question_choice_three || question_choice_three.trim() === "") {
        errors.question_choice_three  = "Question choice three is required";
    }      
    if (!question_choice_four || question_choice_four.trim() === "") {
        errors.question_choice_four  = "Question choice four is required";
    }   
    if (!question_choice_five || question_choice_five.trim() === "") {
        errors.question_choice_five  = "Question choice five is required";
    }     
    if (!question_response || question_response.trim() === "") {
        errors.question_response  = "Question response is required";
    }       
    return errors;                
  }
  
  const handleAddQuestion = async(e) => {
    e.preventDefault();
    let errors = validate();
    if(Object.keys(errors).length) return setErrors(errors);
    setLoadingSubmitButton(true);
    if (!question_id) {
      try 
      {
        await addDoc(collection(db, "questions"), {
            ...dataquestion,
            timeStamp: serverTimestamp(),
        });
        setSucces("Question added success !!");
        setTimeout(() => { setSucces('');}, 4000);
        setErrors(errors)
        setDataQuestion(initialState);
      } catch (error) {
          errors.error = "An error occurred while executing the program";
          setErrors(errors)
      }
    }
    else{
        try 
        {
            await updateDoc(doc(db, "questions",question_id), {
                ...dataquestion,
                timeStamp: serverTimestamp(),
            });
            setSucces("Question Updated success !!");
            setTimeout(() => { setSucces('');}, 4000);
            setErrors(errors);
            
        } catch (error) {
            errors.error = "An error occurred while executing the program";
            setErrors(errors)
        }
    }        
    setLoadingSubmitButton(false);
  }
  return (
    <div>
      <NavBar />
      <SideBar />
      <main id="main" class="main">
        <div class="pagetitle">
          <h1>{ question_id ? "Update Question": "Create a New Question" }</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a>Home</a>
              </li>
              <li class="breadcrumb-item">Questions</li>
              <li class="breadcrumb-item active">
                {question_id ? `Update / ${question_id}`  : "New"}
              </li>
            </ol>
          </nav>
        </div> 
        <section class="section">
          <div class="row">
            <div class="col-lg-12">
              <div class="card">
                <div class="card-body mt-4">
                  <form ref={formRef} class="row g-3">
                    {success ? <div class="alert alert-success alert-dismissible fade show" role="alert">
                        { success }
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>: null}  
                    {errors.error ? <div class="alert alert-warning alert-dismissible fade show" role="alert">
                        { errors.error }
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>: null}                        
                    <div class="col-12">
                        <div class="form-floating mb-3 mt-3">
                            <textarea value={question_description} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control text-size-17" name="question_description" id="floatingTextarea" style={{height:" 300px;"}}></textarea>
                            <label for="floatingTextarea" className="text-size-17">Description</label>
                            {errors.question_description ? <span className="text-danger">{errors.question_description}</span> : null}
                        </div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Questionnaire name </label>
                        <div class="input-group">
                            <select disabled={loadinginput ? 'disabled' : ''} value={question_questionnaire} onChange={handleChange} class="form-select padding-10 text-size-17" name="question_questionnaire">
                              <option selected></option>
                              {questionnaires && questionnaires.map((questionnaire) => (
                                <>
                                  <option className="text-size-17" value={questionnaire.questionnaire_id}>{questionnaire.questionnaire_name}</option>
                                </>
                              ))}
                            </select>
                        </div>
                        {errors.question_questionnaire ? <span className="text-danger">{errors.question_questionnaire}</span> : null}
                    </div>                       
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} value={question_choice_one} onChange={handleChange} class="form-control text-size-17" id="floatingName" name="question_choice_one"/>
                            <label for="floatingName" className="text-size-17">Choice 1</label>
                        </div>
                        {errors.question_choice_one ? <span className="text-danger">{errors.question_choice_one}</span> : null}
                    </div>                           
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} value={question_choice_two} onChange={handleChange} class="form-control text-size-17" id="floatingName" name="question_choice_two"/>
                            <label for="floatingName" className="text-size-17">Choice 2</label>
                        </div>
                        {errors.question_choice_two ? <span className="text-danger">{errors.question_choice_two}</span> : null}
                    </div>   
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} value={question_choice_three} onChange={handleChange} class="form-control text-size-17" id="floatingName" name="question_choice_three"/>
                            <label for="floatingName" className="text-size-17">Choice 3</label>
                        </div>
                        {errors.question_choice_three ? <span className="text-danger">{errors.question_choice_three}</span> : null}
                    </div>                                                        
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} value={question_choice_four} onChange={handleChange} class="form-control text-size-17" id="floatingName" name="question_choice_four"/>
                            <label for="floatingName" className="text-size-17">Choice 4</label>
                        </div>
                        {errors.question_choice_four ? <span className="text-danger">{errors.question_choice_four}</span> : null}
                    </div>   
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} value={question_choice_five} onChange={handleChange} class="form-control text-size-17" id="floatingName" name="question_choice_five"/>
                            <label for="floatingName" className="text-size-17">Choice 5</label>
                        </div>
                        {errors.question_choice_five ? <span className="text-danger">{errors.question_choice_five}</span> : null}
                    </div>   
                    <div class="col-md-6">
                        <div class="form-floating">
                            <input type="number" required min="1" max="5" disabled={loadinginput ? 'disabled' : ''} value={question_response} onChange={handleChange} class="form-control text-size-17" name="question_response"/>
                            <label for="floatingName" className="text-size-17">True Choice</label>
                        </div>
                        {errors.question_response ? <span className="text-danger">{errors.question_response}</span> : null}
                    </div>                                                               
                    <div class="text-center">
                      <button type="submit" onClick={handleAddQuestion} class="btn btn-primary" style={{borderRadius: "5px",padding: "7px"}}>
                        {loadingsubmitbutton ? <i class="fa fa-refresh fa-spin"></i> : null} Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

