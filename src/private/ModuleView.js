import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db } from '../firebase-config';
import { Document, Page } from 'react-pdf';

export default function ModuleView() {

  const [errors,setErrors] = useState({});

  const [loadingpage, setLoadingPage] = useState(false);

  const [module,setModule] = useState([]);

  const {module_id} = useParams();

  useEffect(() => {
    const fetchModuleId = async () => {
        setLoadingPage(true);
        const docRef = doc(db , "modules", module_id);
        const snapshot = await getDoc(docRef);
        if(snapshot.exists()){
            setModule({...snapshot.data()});
        }
        else{
            errors.error = "ce document n'existe pas";
            setErrors(errors);
            console.log("ce document n'existe pas");
        }
        setLoadingPage(false);
    };
    module_id && fetchModuleId();
  }, [module_id]);

  console.log(module);
    
  return (
    <>
    <NavBar />
    <SideBar />
    <main id="main" class="main">
      <div class="pagetitle">
        <h1>Module {module.module_position} : {module.module_name}</h1>
      </div>
      <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ height: "81vh" }}>
                <div class="card-body">
                <br />
                  <div className="row">
                    {loadingpage ? <>
                      <p className='text-center'>
                        <div class="spinner-border text-center" style={{width: "50px", height: "50px"}} role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </p></>:
                      <embed  src={module.module_pdf} style={{ height: "77vh" }} />
                    }
                  </div>
                  <br />
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
