import React, { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../firebase-config";
import { useParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const initialState = { questionnaire_state :"waiting_for" ,questionnaire_name : "", questionnaire_training : "", questionnaire_position : ""}

export default function AddUpdateQuestionnaire() {

  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);

  const [loadinginput, setLoadingInput] = useState(false);
  
  const formRef = useRef();
  
  const [dataquestionnaire,setDataQuestionnaire] = useState(initialState);

  const [errors,setErrors] = useState({});

  const [success,setSucces] = useState("");

  const {questionnaire_name , questionnaire_position, questionnaire_training} = dataquestionnaire;

  const [trainings, setTrainings] = useState([]);

  const {questionnaire_id} = useParams();

  useEffect(() => {
    const fetchQuestionnaireId = async () => {
        const docRef = doc(db , "questionnaires", questionnaire_id);
        setLoadingInput(true)
        const snapshot = await getDoc(docRef);
        if(snapshot.exists()){
            setDataQuestionnaire({...snapshot.data()});
            setLoadingInput(false);
        }
        else{
        console.log("ce document n'existe pas");
        }
    };
    questionnaire_id && fetchQuestionnaireId();
  }, [questionnaire_id]);

  useEffect(() => {
    const fetchTraining = async () => {
        try {
          const unsubscribe = onSnapshot(
            query(collection(db, "trainings"), orderBy("timeStamp", "desc")),
            (snapShot) => {
              let list = [];
              snapShot.docs.forEach((doc) => {
                list.push({ training_id: doc.id , ...doc.data() });
              });
              setTrainings(list);
            }
          );
          return () => {
            unsubscribe();
          };
        } catch (error) {
          errors.error = "An error occurred while executing the program fetching trainings";
          setErrors(errors)
        }    
    };    
    fetchTraining();
  }, []);

  console.log(trainings);

  const handleChange = (e) => {
    setDataQuestionnaire({ ...dataquestionnaire,[e.target.name] : e.target.value })
  }

  const validate = () => {
    let errors = {};
    if (!questionnaire_name || questionnaire_name.trim() === "") { errors.questionnaire_name  = "Questionnaire Title is required";}
    if (!questionnaire_position || questionnaire_position.trim() === "") {
        errors.questionnaire_position = "Questionnaire Position is required";
    } else if (!/^\d+$/.test(questionnaire_position)) {
        errors.questionnaire_position = "Questionnaire Position must contain only digits";
    }
    if (!questionnaire_training || questionnaire_training.trim() === "") { errors.questionnaire_training  = "Questionnaire Training is required";}
    return errors;                
  }
  
  const handleAddQuestionnaire = async(e) => {
    e.preventDefault();
    let errors = validate();
    console.log(errors);
    if(Object.keys(errors).length) return setErrors(errors);
    setLoadingSubmitButton(true);
    if (!questionnaire_id) {
      try {
        const query_questionnaire_name_InCollection = await getDocs(query(collection(db, 'questionnaires'), where('questionnaire_name', '==', dataquestionnaire.questionnaire_name)));   
        if (!query_questionnaire_name_InCollection.empty) {
            errors.questionnaire_nameInCollection = "This question name already exists";
            setErrors(errors);
        }
        else {
          await addDoc(collection(db, "questionnaires"), {
              ...dataquestionnaire,
              timeStamp: serverTimestamp(),
          });
          setSucces("Questionnaire added success !!");
          setTimeout(() => { setSucces('');}, 6000);
          formRef.current.reset();
          setErrors(errors);
          setDataQuestionnaire(initialState);
        } 
      } catch (error) {
        errors.error = "An error occurred while executing the program";
        setErrors(errors);
      }
    }
    else{
      try {
          await updateDoc(doc(db, "questionnaires",questionnaire_id), {
              ...dataquestionnaire,
              timeStamp: serverTimestamp(),
          });
          setSucces("Questionnaire Updated success !!");
          setTimeout(() => { setSucces('');}, 6000);
          setErrors(errors);
        
      } catch (error) {
        errors.error = "An error occurred while executing the program";
        setErrors(errors);
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
          <h1>{ questionnaire_id ? "Update Questionnaire": "Create a New Questionnaire" }</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a>Home</a>
              </li>
              <li class="breadcrumb-item">Questionnaires</li>
              <li class="breadcrumb-item active">
                {questionnaire_id ? `Update / ${questionnaire_id}`  : "New"}
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
                        <label class="form-label ">Title</label>
                        <input type="text" value={questionnaire_name} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control padding-10" name="questionnaire_name"/>
                        {errors.questionnaire_name ? <span className="text-danger">{errors.questionnaire_name}</span> : null}
                        {/* {errors.questionnaire_nameInCollection ? <span className="text-danger">{errors.questionnaire_nameInCollection}</span> : null} */}
                    </div>                      
                    <div class="col-6">
                        <label class="form-label">Position</label>
                        <input type="text" value={questionnaire_position} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control" name="questionnaire_position" style={{padding : "10px"}}/>
                        {errors.questionnaire_position ? <span className="text-danger">{errors.questionnaire_position}</span> : null}
                    </div>
                    <div class="col-6">
                        <label class="form-label">Training</label>
                        <div class="input-group">
                            <select disabled={loadinginput ? 'disabled' : ''} value={questionnaire_training} onChange={handleChange} class="form-select padding-10 text-size-17" name="questionnaire_training">
                              <option selected></option>
                              {trainings && trainings.map((training) => (
                                <>
                                  <option className="text-size-17" value={training.training_id}>{training.training_name}</option>
                                </>
                              ))}
                            </select>
                        </div>
                        {errors.questionnaire_training ? <span className="text-danger">{errors.questionnaire_training}</span> : null}
                    </div>                                                 
                    <div class="text-center">
                      <button type="submit" onClick={handleAddQuestionnaire} class="btn btn-primary" style={{borderRadius: "5px",padding: "7px"}}>
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


