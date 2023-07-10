import React, { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../firebase-config";
import { useParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const initialState = { training_state :"waiting_for" ,training_name : "", training_price : "", training_category : "", training_teacher : "", training_cote : "", training_description : "", training_acronym : "", training_link : "", training_modulenumber : "", training_lessonnumber : ""}

export default function AddUpdateTraining() {

  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);

  const [loadinginput, setLoadingInput] = useState(false);
  
  const formRef = useRef();
  
  const [datatraining,setDataTraining] = useState(initialState);

  const [errors,setErrors] = useState({});

  const [success,setSucces] = useState("");

  const {training_name , training_price , training_category , training_teacher , training_cote , training_description, training_acronym, training_link , training_modulenumber , training_lessonnumber } = datatraining;

  const [fileimg,setFileImg] = useState(null);

  const [filevideo,setFileVideo] = useState(null);

  const [progressfileimg,setProgressFileImg] = useState(null);

  const [progressfilevideo,setProgressFileVideo] = useState(null);

  const [categories, setCategories] = useState([]);

  const [users, setUsers] = useState([]);

  const {training_id} = useParams();

  useEffect(() => {
    const fetchTrainingId = async () => {
        const docRef = doc(db , "trainings", training_id);
        setLoadingInput(true)
        const snapshot = await getDoc(docRef);
        if(snapshot.exists()){
            setDataTraining({...snapshot.data()});
            setLoadingInput(false)
        }
        else{
        console.log("ce document n'existe pas");
        }
    };
    training_id && fetchTrainingId();
  }, [training_id]);

  useEffect(() => {
    const uploadFileImg = () => {
      const allowedFileImgTypes = ["image/jpeg", "image/png", "image/gif","image/bmp"]; // Types de fichiers autorisés
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
            setDataTraining((prev) => ({ ...prev, training_img: downloadURL }));
            // setFileImg(null);
            setErrors(errors);
          });
        }
      );
    };
  
    fileimg && uploadFileImg();
  }, [fileimg]);
  

  useEffect(() => {
    const uploadFileVideo   = () => {
      const allowedFileVideoTypes = ["video/mp4", "video/quicktime"]; 
      const namevideo = new Date().getTime() + filevideo.name;
      const storageRef = ref(storage, namevideo);
      
      if (!allowedFileVideoTypes.includes(filevideo.type)) {
        errors.error_video = "Video type not allowed";
        setProgressFileVideo(null);
        setErrors(errors)
        return;
      }

      const uploadTask = uploadBytesResumable(storageRef, filevideo);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgressFileVideo(progress.toFixed(1));
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
          errors.error_video = "An error occurred while downloading the video";
          setProgressFileVideo(null);
          setErrors(errors)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("INSERT VIDEO SUCCES ");
            setDataTraining((prev) => ({ ...prev, training_video:downloadURL }))
          });
        }
      );
    };
    filevideo && uploadFileVideo();
  }, [filevideo]);

  useEffect(() => {
    const fetchCategory = async () => {
        try {
          const unsubscribe = onSnapshot(
            query(collection(db, "categories"), orderBy("timeStamp", "desc")),
            (snapShot) => {
              let list = [];
              snapShot.docs.forEach((doc) => {
                let categoryData = doc.data();
                let categoryDescription = categoryData.category_description;
                if (categoryDescription.length > 15 ) {
                    categoryDescription = categoryDescription.substr(0, 30); // Réduire à 15 caractères
                }
                list.push({ category_id: doc.id, categoryDescription: categoryDescription, ...categoryData });
              });
              setCategories(list);
            }
          );
          return () => {
            unsubscribe();
          };
        } catch (error) {
          errors.error = "An error occurred while executing the program fetching categories";
          setErrors(errors)
        }
        
        
    };
    const fetchUser = async () => {
      try {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapShot) => {
          let list = [];
          snapShot.docs.forEach((doc) => {
            list.push({ user_doc_id: doc.id, ...doc.data() });
          });
          setUsers(list);
        });
        return () => {
          unsubscribe();
        };
      } catch (error) {
        errors.error = "An error occurred while executing the program fetching users";
        setErrors(errors)
      }
    };    
    fetchUser() && fetchCategory();
  }, []);

  const handleChange = (e) => {
    setDataTraining({ ...datatraining,[e.target.name] : e.target.value })
  }

  const validate = () => {
    let errors = {};
    if (!training_name || training_name.trim() === "") { errors.training_name  = "Training Name is required";}
    if (!training_price || training_price.trim() === "") {
        errors.training_price = "Training Price is required";
    } else if (!/^\d+$/.test(training_price)) {
        errors.training_price = "Training Price must contain only digits";
    }
    if (!training_category || training_category.trim() === "") { errors.training_category  = "Training Category is required";}
    if (!training_teacher || training_teacher.trim() === "") { errors.training_teacher  = "Training Teacher is required";}
    if (!training_cote || training_cote.trim() === "") { errors.training_cote  = "Training Cote is required";}
    if (!training_description || training_description.trim() === "") { errors.training_description  = "Training Description is required";}
    if (!training_acronym || training_acronym.trim() === "") { errors.training_acronym  = "Training Acronym Number is required";}
    if (!training_link || training_link.trim() === "") { errors.training_link  = "Training Link Number is required";}
    if (!training_modulenumber || training_modulenumber.trim() === "") { errors.training_modulenumber  = "Training Module Number is required";}
    if (!training_lessonnumber || training_lessonnumber.trim() === "") { errors.training_lessonnumber  = "Training Lesson Number is required";}
    // if (!fileimg) { errors.fileimg  = "Hero Image is required";}
    // if (!filevideo) { errors.filevideo  = "Descriptive Video is required";}
    return errors;                
  }
  
  const handleAddTraining = async(e) => {
    e.preventDefault();
    let errors = validate();
    console.log(errors);
    if(Object.keys(errors).length) return setErrors(errors);
    setLoadingSubmitButton(true);
    if (!training_id) {
      try {
        const query_training_name_InCollection = await getDocs(query(collection(db, 'trainings'), where('training_name', '==', datatraining.training_name)));   
        if (!query_training_name_InCollection.empty) {
            errors.training_nameInCollection = "This training name already exists";
            setErrors(errors)
        }
        else {
          await addDoc(collection(db, "trainings"), {
              ...datatraining,
              timeStamp: serverTimestamp(),
          });
          setSucces("Training added success !!");
          setTimeout(() => { setSucces('');}, 6000);
          formRef.current.reset();
          setFileImg(null);
          setFileVideo(null);
          setErrors(errors);
          setProgressFileVideo(null);
          setProgressFileImg(null);
          setDataTraining(initialState);
        } 
      } catch (error) {
        errors.error = "An error occurred while executing the program";
        setErrors(errors);
      }
    }
    else{
      try {
          await updateDoc(doc(db, "trainings",training_id), {
              ...datatraining,
              timeStamp: serverTimestamp(),
          });
          setSucces("Training Updated success !!");
          setTimeout(() => { setSucces('');}, 6000);
          setFileVideo(null);
          setErrors(errors);
          setProgressFileVideo(null);
          setFileImg(null);
          setProgressFileImg(null);
        
      } catch (error) {
        errors.error = "An error occurred while executing the program";
        setErrors(errors);
      }
    }
    setLoadingSubmitButton(false);
  }

  console.log(training_id);

  return (
    <div>
      <NavBar />
      <SideBar />
      <main id="main" class="main">
        <div class="pagetitle">
          <h1>{ training_id ? "Update Training": "Create a New Training" }</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a>Home</a>
              </li>
              <li class="breadcrumb-item">Trainings</li>
              <li class="breadcrumb-item active">
                {training_id ? `Update / ${training_id}`  : "New"}
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
                        <input type="text" value={training_name} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control padding-10" name="training_name"/>
                        {errors.training_name ? <span className="text-danger">{errors.training_name}</span> : null}
                        {errors.training_nameInCollection ? <span className="text-danger">{errors.training_nameInCollection}</span> : null}
                    </div>                      
                    <div class="col-6">
                        <label class="form-label">Price</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text">FCFA</span>
                            <input type="text" value={training_price} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control" name="training_price" style={{padding : "10px"}}/>
                            <span class="input-group-text">.00</span>
                        </div>
                        {errors.training_price ? <span className="text-danger">{errors.training_price}</span> : null}
                    </div>
                    <div class="col-6">
                        <label class="form-label">Category</label>
                        <div class="input-group mb-3">
                            <select disabled={loadinginput ? 'disabled' : ''} value={training_category} onChange={handleChange} class="form-select padding-10 text-size-17" name="training_category">
                              <option selected></option>
                              {categories && categories.map((category) => (
                                <>
                                  <option className="text-size-17" value={category.category_id}>{category.category_name}</option>
                                </>
                              ))}
                            </select>
                        </div>
                        {errors.training_category ? <span className="text-danger">{errors.training_category}</span> : null}
                    </div>   
                    <div class="col-6">
                        <label class="form-label">Teacher</label>
                        <div class="input-group mb-3">
                            <select disabled={loadinginput ? 'disabled' : ''} value={training_teacher} onChange={handleChange} class="form-select padding-10" name="training_teacher">
                              <option selected></option>
                              {users && users.map((user) => (
                                <>
                                  <option value={user.user_doc_id}>{user.user_fulname}</option>                              
                                </>
                              ))}
                            </select>
                        </div>
                        {errors.training_teacher ? <span className="text-danger">{errors.training_teacher}</span> : null}
                    </div>                     
                    <div class="col-6">
                        <label class="form-label">Cote Number</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text">Cote</span>
                            <input disabled={loadinginput ? 'disabled' : ''} type="text" value={training_cote} onChange={handleChange} class="form-control" name="training_cote" style={{padding : "10px"}}/>
                        </div>
                        {errors.training_cote ? <span className="text-danger">{errors.training_cote}</span> : null}
                    </div>                                     
                    <div class="col-12">
                        <label class="form-label ">Description</label>
                        <textarea disabled={loadinginput ? 'disabled' : ''} class="form-control padding-10" onChange={handleChange} value={training_description} name="training_description">{training_description}</textarea>
                        {errors.training_description ? <span className="text-danger">{errors.training_description}</span> : null}
                    </div>   
                    <div class="col-6">
                        <label class="form-label">Acronym</label>
                        <div class="input-group mb-3">
                            <input type="text" value={training_acronym} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control" name="training_acronym" style={{padding : "10px"}}/>
                        </div>
                        {errors.training_acronym ? <span className="text-danger">{errors.training_acronym}</span> : null}
                    </div>
                    <div class="col-6">
                        <label class="form-label">Link Web</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text">Https:</span>
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} value={training_link} onChange={handleChange} class="form-control" name="training_link" style={{padding : "10px"}}/>
                        </div>
                        {errors.training_link ? <span className="text-danger">{errors.training_link}</span> : null}
                    </div>                                        
                    <div class="col-6">
                        <label class="form-label ">Hero Image</label>
                        <input type="file" disabled={loadinginput ? 'disabled' : ''} onChange={(e) => setFileImg(e.target.files[0])} class="form-control padding-10"/>
                        {progressfileimg ? <div class="progress"> <div class="progress-bar" role="progressbar" style={{width: `${progressfileimg}%` }} aria-valuemin="0" aria-valuemax="100">Uplaod {progressfileimg}%</div></div> : null}
                        {errors.fileimg ? <span className="text-danger">{errors.fileimg}</span> : null}
                        {errors.error_img ? <span className="text-danger">{errors.error_img}</span> : null}
                    </div>   
                    <div class="col-6">
                        <label class="form-label ">Descriptive Video</label>
                        <input type="file" disabled={loadinginput ? 'disabled' : ''} onChange={(e) => setFileVideo(e.target.files[0])} class="form-control padding-10"/>
                        {progressfilevideo ? <div class="progress"> <div class="progress-bar" role="progressbar" style={{width: `${progressfilevideo}%` }} aria-valuemin="0" aria-valuemax="100">Uplaod {progressfilevideo}%</div></div> : null}
                        {errors.filevideo ? <span className="text-danger">{errors.filevideo}</span> : null}
                        {errors.error_video ? <span className="text-danger">{errors.error_video}</span> : null}
                    </div>         
                    <div class="col-6">
                        <label class="form-label">Module Number</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text">Module(s)</span>
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} value={training_modulenumber} class="form-control padding-10" name="training_modulenumber"/>
                        </div>
                        {errors.training_modulenumber ? <span className="text-danger">{errors.training_modulenumber}</span> : null}
                    </div>
                    <div class="col-6">
                        <label class="form-label">Lesson Number</label>
                        <div class="input-group mb-3">
                            <span class="input-group-text">Lesson(s)</span>
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} value={training_lessonnumber} class="form-control padding-10" name="training_lessonnumber"/>
                        </div>
                        {errors.training_lessonnumber ? <span className="text-danger">{errors.training_lessonnumber}</span> : null}
                    </div>                                                        
                    <div class="text-center">
                      <button type="submit" onClick={handleAddTraining} class="btn btn-primary" style={{borderRadius: "5px",padding: "7px"}}>
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

