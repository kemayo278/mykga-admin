import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase-config'
import SkeletonTable from '../components/SkeletonTable'
import Swal from 'sweetalert2'

export default function Question() {

  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingSkeletonButton(true);
      try {
        const unsubscribeQuestions = onSnapshot(
          collection(db, "questions"),
          async (questionsSnapshot) => {
            const questionnaireSnapshot = await getDocs(collection(db, "questionnaires"));
  
            const questionsList = questionsSnapshot.docs.map((doc) => {
              const questionData = doc.data();

              let questionDescription = questionData.question_description;
              if (questionDescription.length > 30 ) {
                questionDescription = questionDescription.substr(0, 30); // Réduire à 15 caractères
              }

              const questionnaireId = questionData.question_questionnaire;
              const questionnaireData = questionnaireSnapshot.docs.find((questDoc) => questDoc.id === questionnaireId).data();
  
              return {
                questionDescription : questionDescription,
                question_id : doc.id,
                ...questionData,
                questionnaire : questionnaireData
              };
            });
            
            setQuestions(questionsList);
            setLoadingSkeletonButton(false);
          }
        );
        return () => {
          unsubscribeQuestions();
        };
      } catch (error) {
        console.log(error);
        setLoadingSkeletonButton(false);
      }
    };
  
    fetchQuestions();
  }, []);

  console.log(questions);
  
  const handleDelete = async(id) => {
    Swal.fire({
      title: 'Deletion', text: 'Do you want to delete this Question?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Delete', cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        try {
            deleteDoc(doc(db, "questions", id));
            setQuestions(questions.filter((item) => item.id !== id));
            Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'Question deleted successfully',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
      }
    });
  };
    
  return (
    <>
    <NavBar />
    <SideBar />
    <main id="main" class="main">
      <div class="pagetitle">
        <h1>List Of Questions</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a>Home</a>
            </li>
            <li class="breadcrumb-item active">Questions</li>
          </ol>
        </nav>
      </div>
      <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ height: "77vh" }}>
                <div class="card-body">
                  <div className="row">
                    <div className="col-md-6">
                    </div>
                    <div className="col-md-6">
                      <Link to= "/Add-Question" style={{borderRadius: "5px",padding: "5px"}} class="btn btn-outline-primary float-right w-80 mt-4" >
                        New 
                      </Link>
                    </div>
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr>
                        <th className="p-3 border-top-left-radius-5 border-bottom-left-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Question id
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Question description
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Questionnaire name
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Questionnaire response
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
                    {questions && questions.map((question) => (
                        <tr>
                            <td className="vertical-align-middle text-center">{question.question_id}</td>
                            <td title={question.question_description} className="vertical-align-middle cursor-pointer">{(question.questionDescription)}</td>
                            <td className="vertical-align-middle text-center">{question.questionnaire.questionnaire_name}</td>
                            <td className="vertical-align-middle text-center">{question.question_response}</td>
                            <td className="vertical-align-middle">
                                <Link to={`/Update-Question/${question.question_id}`} className="btn btn-outline-warning" style={{ borderRadius: "5px", padding: "5px" }}>Update</Link>
                            </td>
                            <td className="vertical-align-middle">
                                <a onClick={() => handleDelete(question.question_id)} className="btn btn-outline-danger" style={{ borderRadius: "5px", padding: "5px" }}>Delete</a>
                            </td>
                        </tr>      
                    ))}
                    {loadingskeletonbutton && <>{SkeletonTable(7,5)}</>}
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




