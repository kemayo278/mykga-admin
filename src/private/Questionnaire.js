import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase-config'
import SkeletonTable from '../components/SkeletonTable'
import Swal from 'sweetalert2'

export default function Questionnaire() {

  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);

  const [questionnaires, setQuestionnaires] = useState([]);

  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = questionnaires.filter((questionnaire) =>
      questionnaire.questionnaire_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestionnaires(filtered);
  }, [questionnaires, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      setLoadingSkeletonButton(true);
      try {
        const unsubscribeQuestionnaires = onSnapshot(
          collection(db, "questionnaires"),
          async (questionnairesSnapshot) => {
            const trainingSnapshot = await getDocs(collection(db, "trainings"));
  
            const questionnairesList = questionnairesSnapshot.docs.map((doc) => {
              const questionnaireData = doc.data();
              const categoryId = questionnaireData.questionnaire_training;
              const trainingData = trainingSnapshot.docs.find((catDoc) => catDoc.id === categoryId).data();
  
              return {
                questionnaire_id : doc.id,
                ...questionnaireData,
                training : trainingData
              };
            });
            
            setQuestionnaires(questionnairesList);
            setLoadingSkeletonButton(false);
          }
        );
        return () => {
          unsubscribeQuestionnaires();
        };
      } catch (error) {
        console.log(error);
        setLoadingSkeletonButton(false);
      }
    };
  
    fetchQuestionnaires();
  }, []);

  const handleDelete = async(id) => {
    Swal.fire({
      title: 'Deletion', text: 'Do you want to delete this Category?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Delete', cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  };

  const ChangeStateQuestionnaire  = async(id,questionnaire_state) => {
    Swal.fire({
      title: 'Choose a Operation', icon: 'question',showDenyButton: true,showCancelButton: true, confirmButtonColor: '#3085d6',confirmButtonText: 'Enable',denyButtonText: `Disable`, cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        if(questionnaire_state !== "asset")
        {
          try {
              let state = "asset";
              updateDoc(doc(db, "questionnaires",id), {
                questionnaire_state : state,
                timeStamp: serverTimestamp()
              });
              Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This Questionnaire has been activated',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
        }
        else{
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This Questionnaire is already active',showConfirmButton: true,confirmButtonColor: '#3085d6',})
        }
      }
      else if (result.isDenied) {
        if(questionnaire_state !== "idle")
        {
          try {
            let state = "idle";
            updateDoc(doc(db, "questionnaires",id), {
                questionnaire_state : state,
                timeStamp: serverTimestamp(),
            });
            Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This Questionnaire has been deactivated',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
        }
        else{
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This Questionnaire is already inactive',showConfirmButton: true,confirmButtonColor: '#3085d6',})
        }
      }
    });
  };
    
  return (
    <>
    <NavBar onSearch={handleSearch} />
    <SideBar />
    <main id="main" class="main">
      <div class="pagetitle">
        <h1>List Of Questionnaires</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a>Home</a>
            </li>
            <li class="breadcrumb-item active">Questionnaires</li>
          </ol>
        </nav>
      </div>
      <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ height: "77vh", overflowY : "scroll",scrollBehavior : "inherit" }}>
                <div class="card-body">
                  <div className="row">
                    <div className="col-md-6">
                    </div>
                    <div className="col-md-6">
                      <Link to= "/Add-Questionnaire" style={{borderRadius: "5px",padding: "5px"}} class="btn btn-outline-primary float-right w-80 mt-4" >
                        New
                      </Link>
                    </div>
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr>
                        <th className="p-3 border-top-left-radius-5 border-bottom-left-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            Questionnaire id
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            Questionnaire title
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            Training
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Questionnaire state
                        </th>  
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            &nbsp;
                        </th>                                              
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            &nbsp;
                        </th>
                        <th className="p-3 border-top-right-radius-5 border-bottom-right-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            &nbsp;
                        </th>                                            
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestionnaires && filteredQuestionnaires.map((questionnaire) => {
                        let classState = "";
                        let contentState = "";
                        if (questionnaire.questionnaire_state === "asset") {classState = "bg-info text-dark";contentState = "Enable";} 
                        else if (questionnaire.questionnaire_state === "idle") { classState = "bg-danger text-white";contentState = "Disable";}                      
                        else{ classState = "bg-warning text-white";contentState = "Waiting-For"; }             
                        return (
                          <tr>
                            <td className="vertical-align-middle">{questionnaire.questionnaire_id}</td>
                            <td className="vertical-align-middle">{questionnaire.questionnaire_name}</td>
                            <td className="vertical-align-middle cursor-pointer">{(questionnaire.training.training_name)}</td>
                            <td className="vertical-align-middle"><span className={`badge rounded-pill ${classState}`} style={{ padding: "10px" }} >{contentState}</span></td>
                            <td className="vertical-align-middle">
                                <Link to={`/Update-Questionnaire/${questionnaire.questionnaire_id}`} className="btn btn-outline-warning" style={{ borderRadius: "5px", padding: "5px" }}>Update</Link>
                            </td>
                            <td className="vertical-align-middle">
                              <a onClick={() => ChangeStateQuestionnaire(questionnaire.questionnaire_id,questionnaire.questionnaire_state)} className="btn btn-outline-info" style={{ borderRadius: "5px", padding: "5px" }}>Ena/Dis</a>
                            </td>
                            <td className="vertical-align-middle">
                                <a onClick={() => handleDelete(questionnaire.questionnaire_id)} className="btn btn-outline-danger" style={{ borderRadius: "5px", padding: "5px" }}>Delete</a>
                            </td>
                          </tr>
                        );
                      })}
                    {loadingskeletonbutton && <>{SkeletonTable(7,7)}</>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
    </main>
    <Footer />
  </>
  )
}

