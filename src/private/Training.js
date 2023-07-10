import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase-config'
import SkeletonTable from '../components/SkeletonTable'
import Swal from 'sweetalert2'

export default function Training() {

  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);

  const [trainings, setTrainings] = useState([]);

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoadingSkeletonButton(true);
      try {
        const unsubscribeTrainings = onSnapshot(
          collection(db, "trainings"),
          async (trainingsSnapshot) => {
            const categorySnapshot = await getDocs(collection(db, "categories"));
  
            const trainingsList = trainingsSnapshot.docs.map((doc) => {
              const trainingData = doc.data();
              const categoryId = trainingData.training_category;
              const categoryData = categorySnapshot.docs.find((catDoc) => catDoc.id === categoryId).data();
  
              return {
                training_id: doc.id,
                ...trainingData,
                category: categoryData
              };
            });
            
            setTrainings(trainingsList);
            setLoadingSkeletonButton(false);
          }
        );
        return () => {
          unsubscribeTrainings();
        };
      } catch (error) {
        console.log(error);
        setLoadingSkeletonButton(false);
      }
    };
  
    fetchTrainings();
  }, []);
  
  console.log(trainings);

  const ChangeStateTraining  = async(id,training_state) => {
    Swal.fire({
      title: 'Choose a Operation', icon: 'question',showDenyButton: true,showCancelButton: true, confirmButtonColor: '#3085d6',confirmButtonText: 'Enable',denyButtonText: `Disable`, cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        if(training_state !== "asset")
        {
          try {
              let state = "asset";
              updateDoc(doc(db, "trainings",id), {
                  training_state : state,
                  timeStamp: serverTimestamp()
              });
              Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This Training has been activated',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
        }
        else{
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This Training is already active',showConfirmButton: true,confirmButtonColor: '#3085d6',})
        }
      }
      else if (result.isDenied) {
        if(training_state !== "idle")
        {
          try {
            let state = "idle";
            updateDoc(doc(db, "trainings",id), {
                training_state : state,
                timeStamp: serverTimestamp(),
            });
            Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This training has been deactivated',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
        }
        else{
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This Training is already inactive',showConfirmButton: true,confirmButtonColor: '#3085d6',})
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
        <h1>List Of Trainings</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a>Home</a>
            </li>
            <li class="breadcrumb-item active">Trainings</li>
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
                      <Link to= "/Add-Training" style={{borderRadius: "5px",padding: "5px"}} class="btn btn-outline-primary float-right w-80 mt-4" >
                        New
                      </Link>
                    </div>
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr>
                        <th className="p-3 border-top-left-radius-5 border-bottom-left-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Image
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Training name
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Training category
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Training state
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Training price
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
                      {loadingskeletonbutton ? <>{SkeletonTable(7,8)}</>:
                        <>
                          {trainings && trainings.map((training) => {
                            let classState = "";
                            let contentState = "";
                            if (training.training_state === "asset") {classState = "bg-info text-white";contentState = "Enable";} 
                            else if (training.training_state === "idle") { classState = "bg-danger text-white";contentState = "Disable";} 
                            else {classState = "bg-warning text-dark";contentState = "Waiting For";}
                            return (
                              <tr>
                                  <td className="vertical-align-middle">
                                    <Link to={training.training_img}>
                                      <img src={training.training_img} style={{ height: "50px", width: "50px" }} />
                                    </Link>
                                  </td>
                                  <td className="vertical-align-middle">{training.training_name}</td>
                                  <td title={training.training_id} className="vertical-align-middle cursor-pointer">{(training.category.category_name)}</td>
                                  <td className="vertical-align-middle"><span style={{ padding: "10px" }} className={`badge rounded-pill ${classState}`}>{contentState}</span></td>
                                  <td className="vertical-align-middle">{training.training_price} FCFA</td>
                                  <td className="vertical-align-middle">
                                      <Link to={`/Update-Training/${training.training_id}`} className="btn btn-outline-warning" style={{ borderRadius: "5px", padding: "5px" }}>Update</Link>
                                  </td>
                                  <td className="vertical-align-middle">
                                      <a onClick={() => ChangeStateTraining(training.training_id,training.training_state)} className="btn btn-outline-info" style={{ borderRadius: "5px", padding: "5px" }}>Ena/Dis</a>
                                  </td>
                                  <td className="vertical-align-middle">
                                      <Link to={`/View-Training/${training.training_id}`} className="btn btn-outline-primary" style={{ borderRadius: "5px", padding: "5px" }}>See view</Link>
                                  </td>                                  
                              </tr> 
                            );
                          })} 
                        </>                     
                      }
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
