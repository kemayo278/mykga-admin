import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase-config'
import SkeletonTable from '../components/SkeletonTable'
import Swal from 'sweetalert2'
import Sample_User from "../Sample_User_Icon.png"

export default function Learner() {

  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);

  const [learners, setLearners] = useState([]);

  const [filteredLearners, setFilteredLearners] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = learners.filter((learner) =>
      learner.user_fulname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLearners(filtered);
  }, [learners, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    const fetchLearner = async () => {
        setLoadingSkeletonButton(true);
        try {
          const unsubscribe = onSnapshot(
            query(collection(db, "users"), where("user_type", "==", "Learner")),
            (snapShot) => {
              let list = [];
              snapShot.docs.forEach((doc) => {
                list.push({ user_id : doc.id, ...doc.data() });
              });
              setLearners(list);
              setLoadingSkeletonButton(false);
            }
          );
          return () => {
            unsubscribe();
          };
        } catch (error) {
          setLoadingSkeletonButton(true);
        }
    };
    fetchLearner();
  }, []);

  const ChangeStateLearnerToDisable  = async(id,user_state) => {
    Swal.fire({
      title: 'Do you want to deactivate this user ?', icon: 'question',showCancelButton: true, confirmButtonColor: '#3085d6',confirmButtonText: 'Disable', cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        if(user_state !== "idle")
        {
          try {
              let state = "idle";
              updateDoc(doc(db, "users",id), {
                user_state : state,
                timeStamp: serverTimestamp()
              });
              Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This Learner has been deactivated',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
        }
        else{
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This Learner is already deactivated',showConfirmButton: true,confirmButtonColor: '#3085d6',})
        }
      }
    });
  };

  const ChangeStateLearnerToEnable  = async(id,user_state) => {
    Swal.fire({
      title: 'Do you want to activate this user ?', icon: 'question',showCancelButton: true, confirmButtonColor: '#3085d6',confirmButtonText: 'Enable', cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        if(user_state !== "asset")
        {
          try {
              let state = "asset";
              updateDoc(doc(db, "users",id), {
                user_state : state,
                timeStamp: serverTimestamp()
              });
              Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This Learner has been activated',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
        }
        else{
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This Learner is already activated',showConfirmButton: true,confirmButtonColor: '#3085d6',})
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
        <h1>List Of Learners</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a>Home</a>
            </li>
            <li class="breadcrumb-item active">Learners</li>
          </ol>
        </nav>
      </div>
      <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ height: "77vh" }}>
                <div class="card-body">
                  <div className="row">
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr>
                        <th className="p-3 border-top-left-radius-5 border-bottom-left-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Image
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Full name
                        </th>                         
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Email
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          State
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Phone
                        </th>  
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Address
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
                      {filteredLearners && filteredLearners.map((Learner) => {
                        let classState = "";
                        let contentState = "";
                        if (Learner.user_state === "asset") {classState = "bg-info text-dark";contentState = "Enable";} 
                        else if (Learner.user_state === "idle") { classState = "bg-danger text-white";contentState = "Disable";}                      
                        return (
                          <tr>
                              <td className="vertical-align-middle">
                                {Learner.user_img != null ? (
                                  <Link to={Learner.user_img}>
                                    <img
                                      src={Learner.user_img}
                                      style={{ height: "50px", width: "50px", borderRadius :"50%",objectFit : "cover" }}
                                    />
                                  </Link>
                                ) : (
                                  <img
                                      src="https://kokitechgroup.cm/iconuser.png"
                                      style={{ height: "50px", width: "50px", borderRadius :"50%",objectFit : "cover" }}
                                    />
                                )}
                              </td>
                              <td className="vertical-align-middle">{Learner.user_fulname}</td>
                              <td className="vertical-align-middle">{Learner.user_email}</td>
                              <td className="vertical-align-middle"><span className={`badge rounded-pill ${classState}`} style={{ padding: "10px" }} >{contentState}</span></td>
                              <td className="vertical-align-middle">{Learner.user_phone == "null" || Learner.user_phone == null ? "Null" : Learner.user_phone }</td>
                              <td className="vertical-align-middle">{Learner.user_address == "null" || Learner.user_address == null ? "Null" : Learner.user_address }</td>
                              <td className="vertical-align-middle">
                                  <a onClick={() => ChangeStateLearnerToEnable(Learner.user_id,Learner.user_state)} className="btn btn-outline-info" style={{ borderRadius: "5px", padding: "5px" }}>Enable</a>
                              </td>
                              <td className="vertical-align-middle">
                                  <a onClick={() => ChangeStateLearnerToDisable(Learner.user_id,Learner.user_state)} className="btn btn-outline-danger" style={{ borderRadius: "5px", padding: "5px" }}>Disable</a>
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

