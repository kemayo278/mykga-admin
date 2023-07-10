import React, { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../firebase-config";
import { useParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const initialState = {module_name : "", module_position : "", module_training : "", module_pdf : ""}

export default function AddUpdateModule() {

  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);

  const [loadinginput, setLoadingInput] = useState(false);
  
  const formRef = useRef();
  
  const [datamodule,setDataModule] = useState(initialState);

  const [errors,setErrors] = useState({});

  const [success,setSucces] = useState("");

  const {module_name, module_position, module_training, module_pdf } = datamodule;

  const [fileimg,setFileImg] = useState(null);

  const [progressfileimg,setProgressFileImg] = useState(null);

  const [trainings, setTrainings] = useState([]);

  const {module_id} = useParams();

  useEffect(() => {
    const fetchModuleId = async () => {
        const docRef = doc(db , "modules", module_id);
        setLoadingInput(true)
        const snapshot = await getDoc(docRef);
        if(snapshot.exists()){
            setDataModule({...snapshot.data()});
            setLoadingInput(false);
        }
        else{
            errors.error = "ce document n'existe pas";
            setErrors(errors);
            console.log("ce document n'existe pas");
        }
    };
    module_id && fetchModuleId();
  }, [module_id]);

  useEffect(() => {
    const uploadFileImg = () => {
      const allowedFileImgTypes = ["application/pdf"]; // Types de fichiers autorisés
      const name = new Date().getTime() + fileimg.name;
      const storageRef = ref(storage, name);
  
      // Vérifier si le type de fichier est autorisé
      if (!allowedFileImgTypes.includes(fileimg.type)) {
        errors.error_img = "Image type not allowed";
        setProgressFileImg(null);
        setErrors(errors)
        return;
      }
  
      const uploadTask = uploadBytesResumable(storageRef, fileimg);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgressFileImg(progress.toFixed(1));
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          errors.error_img = "An error occurred while downloading the image";
          setProgressFileImg(null);
          setErrors(errors)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("INSERT IMAGE SUCCESS ");
            setDataModule((prev) => ({ ...prev, module_pdf: downloadURL }));
            setErrors(errors);
          });
        }
      );
    };
  
    fileimg && uploadFileImg();
  }, [fileimg]);

  useEffect(() => {
    const fetchTraining = async () => {
        try {
          const unsubscribe = onSnapshot(
            query(collection(db, "trainings"), orderBy("timeStamp", "desc")),
            (snapShot) => {
              let list = [];
              snapShot.docs.forEach((doc) => {
                list.push({ training_id: doc.id, ...doc.data() });
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

  const handleChange = (e) => {
    setDataModule({ ...datamodule,[e.target.name] : e.target.value })
  }

  const validate = () => {
    let errors = {};
    if (!module_name || module_name.trim() === "") { errors.module_name  = "Module Name is required";}
    if (!module_position || module_position.trim() === "") {
        errors.module_position = "Module Position is required";
    } else if (!/^\d+$/.test(module_position)) {
        errors.module_position = "Training Price must contain only digits";
    }
    if (!module_training || module_training.trim() === "") { errors.module_training  = "Training is required";}
    return errors;                
  }
  
  const handleAddModule = async(e) => {
    e.preventDefault();
    let errors = validate();
    if(Object.keys(errors).length) return setErrors(errors);
    setLoadingSubmitButton(true);
    if (!module_id) {
      try {
        const query_module_name_InCollection = await getDocs(query(collection(db, 'modules'), where('module_name', '==', datamodule.module_name)));   
        if (!query_module_name_InCollection.empty) {
            errors.module_nameInCollection = "This module name already exists";
            setErrors(errors);
        }
        else {
          await addDoc(collection(db, "modules"), {
              ...datamodule,
              timeStamp: serverTimestamp(),
          });
          setSucces("Module added success !!");
          setTimeout(() => { setSucces('');}, 4000);
          formRef.current.reset();
          setFileImg(null);
          setErrors(errors);
          setProgressFileImg(null);
          setDataModule(initialState);
        } 
      } catch (error) {
        errors.error = "An error occurred while executing the program";
        setErrors(errors);
      }
    }
    else{
      try {
          await updateDoc(doc(db, "modules",module_id), {
              ...datamodule,
              timeStamp: serverTimestamp(),
          });
          setSucces("Module Updated success !!");
          setTimeout(() => { setSucces('');}, 4000);
          setFileImg(null);
          setErrors(errors);
          setProgressFileImg(null);
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
          <h1>{ module_id ? "Update Module": "Create a New Module" }</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a>Home</a>
              </li>
              <li class="breadcrumb-item">Modules</li>
              <li class="breadcrumb-item active">
                {module_id ? `Update / ${module_id}`  : "New"}
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
                        <label class="form-label ">Name</label>
                        <input type="text" value={module_name} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control padding-10" name="module_name"/>
                        {errors.module_name ? <span className="text-danger">{errors.module_name}</span> : null}
                        {errors.training_nameInCollection ? <span className="text-danger">{errors.training_nameInCollection}</span> : null}
                    </div>                      
                    <div class="col-6">
                        <label class="form-label">Order of classification</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text">position</span>
                            <input type="text" value={module_position} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control" name="module_position" style={{padding : "10px"}}/>
                        </div>
                        {errors.module_position ? <span className="text-danger">{errors.module_position}</span> : null}
                    </div>
                    <div class="col-6">
                        <label class="form-label">Training</label>
                        <div class="input-group mb-3">
                            <select disabled={loadinginput ? 'disabled' : ''} value={module_training} onChange={handleChange} class="form-select padding-10 text-size-17" name="module_training">
                              <option selected></option>
                              {trainings && trainings.map((training) => (
                                <>
                                  <option className="text-size-17" value={training.training_id}>{training.training_name}</option>
                                </>
                              ))}
                            </select>
                        </div>
                        {errors.module_training ? <span className="text-danger">{errors.module_training}</span> : null}
                    </div>                                      
                    <div class="col-12">
                        <label class="form-label ">Pdf</label>
                        <input type="file" disabled={loadinginput ? 'disabled' : ''} onChange={(e) => setFileImg(e.target.files[0])} class="form-control padding-10"/>
                        {progressfileimg ? <div class="progress"> <div class="progress-bar" role="progressbar" style={{width: `${progressfileimg}%` }} aria-valuemin="0" aria-valuemax="100">Uplaod {progressfileimg}%</div></div> : null}
                        {errors.fileimg ? <span className="text-danger">{errors.fileimg}</span> : null}
                        {errors.error_img ? <span className="text-danger">{errors.error_img}</span> : null}
                    </div>                                                       
                    <div class="text-center">
                      <button type="submit" onClick={handleAddModule} class="btn btn-primary" style={{borderRadius: "5px",padding: "7px"}}>
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

