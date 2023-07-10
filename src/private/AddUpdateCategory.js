import React, { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db, storage } from "../firebase-config";
import { useParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const initialState = { category_name : "", category_description : ""}

export default function AddUpdateCategory() {

  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);

  const [loadinginput, setLoadingInput] = useState(false);

  const [fileimg,setFileImg] = useState(null);

  const [progressfileimg,setProgressFileImg] = useState(null);
  
  const formRef = useRef();
  
  const [datacategory,setDataCategory] = useState(initialState);

  const [errors,setErrors] = useState({});

  const [success,setSucces] = useState("");

  const {category_name,category_description} = datacategory;

  const {category_id} = useParams();

  useEffect(() => {
    const fetchCategoryId = async () => {
        const docRef = doc(db , "categories", category_id);
        setLoadingInput(true)
        const snapshot = await getDoc(docRef);
        if(snapshot.exists()){
            setDataCategory({...snapshot.data()});
            setLoadingInput(false);
        }
        else{
        console.log("ce document n'existe pas");
        }
    };
    category_id && fetchCategoryId();
  }, [category_id]);

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
            setDataCategory((prev) => ({ ...prev, category_img: downloadURL }));
            setErrors(errors);
          });
        }
      );
    };
  
    fileimg && uploadFileImg();
  }, [fileimg]);

  const handleChange = (e) => {
    setDataCategory({ ...datacategory,[e.target.name] : e.target.value })
  }

  const validate = () => {
    let errors = {};
    if (!category_name || category_name.trim() === "") {
      errors.category_name  = "Category Name is required";
    }
    if (!category_description || category_description.trim() === "") {
      errors.category_description  = "Category Description is required";
    }
    if (!fileimg) {
      errors.fileimg  = "Category Image is required";
    }    
    return errors;                
  }
  
  const handleAddCategory = async(e) => {
    e.preventDefault();
    let errors = validate();
    if(Object.keys(errors).length) return setErrors(errors);
    setLoadingSubmitButton(true);
    if (!category_id) {
      try 
      {
          const query_category_name_InCollection = await getDocs(query(collection(db, 'categories'), where('category_name', '==', datacategory.category_name)));
      
          if (!query_category_name_InCollection.empty) {
              errors.category_nameInCollection = "This training category already exists";
              setErrors(errors)
          }
          else{
              await addDoc(collection(db, "categories"), {
                  ...datacategory,
                  timeStamp: serverTimestamp(),
              });
              setSucces("Category added success !!");
              setTimeout(() => { setSucces('');}, 3000);
              setErrors(errors)
              setDataCategory(initialState);
              setFileImg(null);
              setProgressFileImg(null);
          }
      } catch (error) {
          errors.error = "An error occurred while executing the program";
          setErrors(errors)
      }
    }
    else{
        try 
        {
          await updateDoc(doc(db, "categories",category_id), {
              ...datacategory,
              timeStamp: serverTimestamp(),
          });
          setSucces("Category Updated success !!");
          setTimeout(() => { setSucces('');}, 3000);
          setErrors(errors);
          setFileImg(null);
          setProgressFileImg(null);
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
          <h1>{ category_id ? "Update Category": "Create a New Category" }</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a>Home</a>
              </li>
              <li class="breadcrumb-item">Categories</li>
              <li class="breadcrumb-item active">
                {category_id ? `Update / ${category_id}`  : "New"}
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
                    <div class="col-md-12">
                        <div class="form-floating">
                            <input type="text" disabled={loadinginput ? 'disabled' : ''} value={category_name} onChange={handleChange} class="form-control text-size-17" id="floatingName" name="category_name"/>
                            <label for="floatingName" className="text-size-17">Name</label>
                        </div>
                        {errors.category_name ? <span className="text-danger">{errors.category_name}</span> : null}
                        {errors.category_nameInCollection ? <span className="text-danger">{errors.category_nameInCollection}</span> : null}
                    </div>
                    <div class="col-12">
                        <div class="form-floating mb-3 mt-3">
                            <textarea value={category_description} disabled={loadinginput ? 'disabled' : ''} onChange={handleChange} class="form-control text-size-17" name="category_description" id="floatingTextarea" style={{height:" 300px;"}}></textarea>
                            <label for="floatingTextarea" className="text-size-17">Description</label>
                            {errors.category_description ? <span className="text-danger">{errors.category_description}</span> : null}
                        </div>
                    </div>
                    <div class="col-12">
                        <label class="form-label ">Choose Image</label>
                        <input type="file" disabled={loadinginput ? 'disabled' : ''} onChange={(e) => setFileImg(e.target.files[0])} class="form-control padding-10"/>
                        {progressfileimg ? <div class="progress"> <div class="progress-bar" role="progressbar" style={{width: `${progressfileimg}%` }} aria-valuemin="0" aria-valuemax="100">Uplaod {progressfileimg}%</div></div> : null}
                        {errors.fileimg ? <span className="text-danger">{errors.fileimg}</span> : null}
                        {errors.error_img ? <span className="text-danger">{errors.error_img}</span> : null}
                    </div>                     
                    <div class="text-center">
                      <button type="submit" onClick={handleAddCategory} class="btn btn-primary" style={{borderRadius: "5px",padding: "7px"}}>
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
