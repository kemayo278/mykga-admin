import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase-config'
import SkeletonTable from '../components/SkeletonTable'
import Swal from 'sweetalert2'

export default function Module() {

  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);

  const [modules, setModules] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      setLoadingSkeletonButton(true);
      try {
        const unsubscribeModules = onSnapshot(
          collection(db, "modules"),
          async (modulesSnapshot) => {
            const trainingSnapshot = await getDocs(collection(db, "trainings"));
  
            const modulesList = modulesSnapshot.docs.map((doc) => {
              const moduleData = doc.data();
              const trainingId = moduleData.module_training;
              const trainingData = trainingSnapshot.docs.find((trainDoc) => trainDoc.id === trainingId).data();
  
              return {
                module_id : doc.id,
                ...moduleData,
                training : trainingData
              };
            });
            
            setModules(modulesList);
            setLoadingSkeletonButton(false);
          }
        );
        return () => {
          unsubscribeModules();
        };
      } catch (error) {
        console.log(error);
        setLoadingSkeletonButton(false);
      }
    };
    fetchModules();
  }, []);
  
  const handleDelete = async(id) => {
    Swal.fire({
      title: 'Deletion', text: 'Do you want to delete this Module?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Delete', cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        try {
            deleteDoc(doc(db, "modules", id));
            setModules(modules.filter((item) => item.id !== id));
            Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'Module deleted successfully',showConfirmButton: true})
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
        <h1>List Of Modules</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a>Home</a>
            </li>
            <li class="breadcrumb-item active">Modules</li>
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
                      <Link to= "/Add-Module" style={{borderRadius: "5px",padding: "5px"}} class="btn btn-outline-primary float-right w-80 mt-4" >
                        New
                      </Link>
                    </div>
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr>
                        <th className="p-3 border-top-left-radius-5 border-bottom-left-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            Module id
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Module name
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Module Pdf
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            Training
                        </th>     
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            Position
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
                            {modules && modules.map((module) => (
                                <tr>
                                    <td className="vertical-align-middle">{module.module_id}</td>
                                    <td className="vertical-align-middle">{module.module_name}</td>
                                    <td className="vertical-align-middle">
                                        <Link to={`/View-Module/${module.module_id}`}>
                                            <span style={{ padding: "10px" }} class="badge bg-info text-dark"><i class="fa fa-eye"></i> See pdf</span>
                                        </Link>
                                    </td>
                                    <td className="vertical-align-middle">{module.training.training_name}</td>
                                    <td className="vertical-align-middle">{module.module_position}</td>
                                    <td className="vertical-align-middle">
                                        <Link to={`/Update-Module/${module.module_id}`} className="btn btn-outline-warning" style={{ borderRadius: "5px", padding: "5px" }}>Update</Link>
                                    </td>
                                    <td className="vertical-align-middle">
                                        <a onClick={() => handleDelete(module.module_id)} className="btn btn-outline-danger" style={{ borderRadius: "5px", padding: "5px" }}>Delete</a>
                                    </td>
                                </tr>      
                            ))}
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

