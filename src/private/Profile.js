import React, { useContext, useEffect, useRef, useState } from 'react'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase-config';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Swal from 'sweetalert2';
import "sweetalert2/dist/sweetalert2.css";

export default function Profile() {

  const {currentUser} = useContext(AuthContext);

  const [currentuser,setCurrentUser] = useState({});

  const [selectedImage, setSelectedImage] = useState(null);

  const [progressfileimg,setProgressFileImg] = useState(null);

  const [fileurl,setFileUrl] = useState(null);

  const [errors,setErrors] = useState({});

  const [loadingsubmitpassword, setLoadingSubmitPassword] = useState(false);

  const [loadingsubmituser, setLoadingSubmitUser] = useState(false);

  const [loadingsubmitnewuser, setLoadingSubmitNewUser] = useState(false);

  const [loadingskeletonimg, setLoadingSkeletonImg] = useState(false);

  const [successpassword,setSuccessPassword] = useState("");

  const [successuser,setSuccessUser] = useState("");

  const [successnewuser,setSuccessNewUser] = useState("");

  const inputpasswords = useRef([]);

  const inputusers = useRef([]);

  const inputnewusers = useRef([]);

  const formRef = useRef();

  const newuserRef = useRef();

  const addInputsPassword = el => {
    if (el && !inputpasswords.current.includes(el)) {
      inputpasswords.current.push(el)
    }
  }

  const addInputsUser = el => {
    if (el && !inputusers.current.includes(el)) {
      inputusers.current.push(el)
    }
  }

  const addInputsnewUser = el => {
    if (el && !inputnewusers.current.includes(el)) {
      inputnewusers.current.push(el)
    }
  }  

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
        const docRef = doc(db , "users", currentUser.uid);
        setLoadingSkeletonImg(true);
        const snapshot = await getDoc(docRef);
        if(snapshot.exists()){
          let currentuserData = snapshot.data();
          let currentuserFulname = currentuserData.user_fulname;
          let currentuserImg = currentuserData.user_img;
          let currentuserAbout = currentuserData.user_about;
          if (currentuserFulname.length > 10 ) {
            currentuserFulname = currentuserFulname.substr(0, 11);
          }
          if(!currentuserImg || currentuserImg === "" || currentuserImg === "null"){
            let fileurl = "https://kokitechgroup.cm/iconuser.png";
            currentuserImg = fileurl;
          }
          if(!currentuserAbout || currentuserAbout === "" || currentuserAbout === "null"){
            let about = "Sunt est soluta temporibus accusantium neque nam maiores cumque temporibus. Tempora libero non est unde veniam est qui dolor. Ut sunt iure rerum quae quisquam autem eveniet perspiciatis odit. Fuga sequi sed ea saepe at unde.";
            currentuserAbout = about;
          }          
          setCurrentUser({currentuserAbout : currentuserAbout,currentuserImg : currentuserImg,currentuserFulname : currentuserFulname ,...currentuserData});
          setLoadingSkeletonImg(false);
        }
        else{
          console.log("ce document n'existe pas");
          navigate("/");
        }
    };
    currentUser.uid && fetchCurrentUser();
  }, [currentUser.uid]);


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    const allowedFileImgTypes = ["image/jpeg", "image/png", "image/gif","image/bmp"]; // Types de fichiers autorisés
    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);

    // Vérifier si le type de fichier est autorisé
    if (!allowedFileImgTypes.includes(file.type)) {
      errors.error_img = "Image type not allowed";
      setProgressFileImg(null);
      setErrors(errors);
      return;
    }
    else{
      const uploadTask = uploadBytesResumable(storageRef, file);
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
          setErrors(errors);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFileUrl(downloadURL);
            setErrors(errors);
            console.log("INSERT IMAGE SUCCESS ");
          });
        }
      );      
    }
  
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setProgressFileImg(null);
    const inputElement = document.getElementById('uploadImage');
    if (inputElement) {
      inputElement.value = '';
    }
  };

  function capitalizeWords(text) {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const updateUser = async(event) => {
    event.preventDefault();
    const errors = {};

    if (inputusers.current[0].value.trim() === '') {
      errors.user_fulname = 'Full name is required';
    }  

    if (inputusers.current[1].value.trim() === '') {
      errors.user_about = 'About is required';
    }

    if (inputusers.current[2].value.trim() === '') {
      errors.user_country = 'Country is required';
    }    

    if (inputusers.current[3].value.trim() === '') {
      errors.user_address = 'Address is required';
    }   

    if (inputusers.current[4].value.trim() === '') {
      errors.user_phone = 'Phone is required';
    }       

    if (Object.keys(errors).length === 0) {
      if (!fileurl) {
        setLoadingSubmitUser(true);
        try {
          await updateDoc(doc(db, "users",currentUser.uid), {
              user_fulname: capitalizeWords(inputusers.current[0].value),
              user_about: inputusers.current[1].value,
              user_country: inputusers.current[2].value,
              user_address: inputusers.current[3].value,
              user_phone: inputusers.current[4].value,
              timeStamp: serverTimestamp(),
          });
          setSuccessUser("Informations Updated success !!");
          setLoadingSubmitUser(false);
          setProgressFileImg(null);
          setTimeout(() => { setSuccessUser('');}, 3000);
          setErrors(errors);
          navigate("/Profile")
        } catch (error) {
          errors.errorupdateuser = "An error occurred while executing the program";
          setErrors(errors);
          setLoadingSubmitUser(false);
        }
      }
      else{
        setLoadingSubmitUser(true);
        try {
          await updateDoc(doc(db, "users",currentUser.uid), {
              user_fulname: capitalizeWords(inputusers.current[0].value),
              user_about: inputusers.current[1].value,
              user_country: inputusers.current[2].value,
              user_address: inputusers.current[3].value,
              user_phone: inputusers.current[4].value,
              user_img : fileurl,
              timeStamp: serverTimestamp(),
          });
          setSuccessUser("Informations Updated success !!");
          setLoadingSubmitUser(false);
          setProgressFileImg(null);
          setTimeout(() => { setSuccessUser('');}, 3000);
          setErrors(errors);
        } catch (error) {
          errors.errorupdateuser = "An error occurred while executing the program";
          setErrors(errors);
          setLoadingSubmitUser(false);
        }
      }
    } else{
      setErrors(errors);
      setLoadingSubmitUser(false);
    }   
  }

  const changePassword = async(event) => {
    event.preventDefault();
    const errors = {};

    if (inputpasswords.current[0].value.trim() === '') {
      errors.currentpassword = 'Current Password is required';
    }  
    
    if (inputpasswords.current[1].value.trim() === '') {
      errors.newpassword = 'New Password is required';
    }  
    else if(inputpasswords.current[1].value.length < 6){
      errors.newpassword = 'New Password is required 6 characters Min';
    }      

    if (inputpasswords.current[2].value.trim() === '') {
      errors.repeatnewpassword = 'Repeat New Password';
    }

    if (inputpasswords.current[1].value.trim() !== inputpasswords.current[2].value.trim()) {
      errors.repeatnewpassword = 'passwords must be the same';
    }

    if (inputpasswords.current[0].value.trim() !== currentuser.user_password) {
      errors.incorrectcurrentpassword = 'Current Password is invalid';
    }
    
    if (Object.keys(errors).length === 0) {
      setLoadingSubmitPassword(true);
      try {

        const user = await signInWithEmailAndPassword(auth, currentuser.user_email, inputpasswords.current[0].value.trim());

        await updatePassword(user.user, inputpasswords.current[1].value.trim());

        await updateDoc(doc(db, "users",currentUser.uid), {
          user_password : inputpasswords.current[1].value.trim(),
          timeStamp: serverTimestamp(),
        });
        setSuccessPassword("Password changed successfully !!");
        setLoadingSubmitPassword(false);
        formRef.current.reset();
        setTimeout(() => { setSuccessPassword('');}, 6000);
        setErrors(errors);
      } catch (error) {
        errors.error = "An error occurred while executing the program";
        setErrors(errors);
        setLoadingSubmitPassword(false);
      }
    }else{
      setErrors(errors);
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addNewUser = async(event) => {
    event.preventDefault();
    const errors = {};

    if (inputnewusers.current[0].value.trim() === '') {
      errors.newuser_fulname = 'Full name is required';
    }  

    if (inputnewusers.current[1].value.trim() === '') {
      errors.newuser_email = 'Email address is required';
    } else if (!isValidEmail(inputnewusers.current[1].value.trim())) {
      errors.newuser_email = 'Email address format is not valid';
    }

    if (inputnewusers.current[2].value.trim() === '') {
      errors.newuser_type = 'Select type user';
    }    

    if (inputnewusers.current[3].value.trim() === '') {
      errors.newuser_country = 'Country is required';
    }   

    if (inputnewusers.current[4].value.trim() === '') {
      errors.newuser_address = 'Address is required';
    }

    if (inputnewusers.current[5].value.trim() === '') {
      errors.newuser_phone = 'Phone is required';
    }

    if (Object.keys(errors).length === 0) {
      let user_password = "123456";
      let user_state = "asset";
      setLoadingSubmitNewUser(true);
      try {
        const newuser = await createUserWithEmailAndPassword(
          auth,inputnewusers.current[1].value.trim(),user_password
        );
        await setDoc(doc(db, "users", newuser.user.uid), {
          user_fulname: capitalizeWords(inputnewusers.current[0].value.trim()),
          user_email: inputnewusers.current[1].value.trim(),
          user_type: inputnewusers.current[2].value.trim(),
          user_country: inputnewusers.current[3].value.trim(),
          user_address: inputnewusers.current[4].value.trim(),
          user_phone: inputnewusers.current[5].value.trim(),
          user_about: null,
          user_password: user_password,
          user_state: user_state,
          user_img : null,
          timeStamp: serverTimestamp(),
        });
        setErrors(errors);
        newuserRef.current.reset();
        setSuccessNewUser("User Added success !!");
        setLoadingSubmitNewUser(false);
        setTimeout(() => { setSuccessNewUser('');}, 4000);
      } catch (error) {
        errors.errornewuser = "An error occurred while executing the program";
        setErrors(errors);
        setLoadingSubmitNewUser(false);
      }
    }
    else{
      setErrors(errors);
      setLoadingSubmitNewUser(false);
    }   
  }

  return (
    <>
    <NavBar />
    <SideBar />
    <main id="main" class="main">
    <div class="pagetitle">
      <h1>Profile</h1>
      <nav>
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="index.html">Home</a></li>
          <li class="breadcrumb-item">Users</li>
          <li class="breadcrumb-item active">Profile</li>
        </ol>
      </nav>
    </div>

    <section class="section profile">
      <div class="row">
        <div class="col-xl-4">
          <div class="card">
            <div class="card-body profile-card pt-4 d-flex flex-column align-items-center">
              <img src={loadingskeletonimg ? "https://kokitechgroup.cm/iconuser.png" :currentuser.currentuserImg} style={{ height : "120px", width : "120px", objectFit : "cover"}} alt="Profile" class="rounded-circle"/>
              <h2>{currentuser.user_fulname}</h2>
              <h3>{currentuser.user_type}</h3>
            </div>
          </div>
        </div>

        <div class="col-xl-8">

          <div class="card">
            <div class="card-body pt-3">
              
              <ul class="nav nav-tabs nav-tabs-bordered">

                <li class="nav-item">
                  <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-overview">Overview</button>
                </li>

                <li class="nav-item">
                  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit">Edit Profile</button>
                </li>

                { currentuser.user_type == "Admin" ?
                <li class="nav-item">
                  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-settings">Settings</button>
                </li>
                : ""}

                <li class="nav-item">
                  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-change-password">Change Password</button>
                </li>

              </ul>
              <div class="tab-content pt-2">

                <div class="tab-pane fade show active profile-overview" id="profile-overview">
                  <h5 class="card-title">About</h5>
                  <p class="small fst-italic">{currentuser.currentuserAbout}</p>

                  <h5 class="card-title">Profile Details</h5>

                  <div class="row">
                    <div class="col-lg-3 col-md-4 label ">Full Name</div>
                    <div class="col-lg-9 col-md-8">{currentuser.user_fulname}</div>
                  </div>

                  <div class="row">
                    <div class="col-lg-3 col-md-4 label">Country</div>
                    <div class="col-lg-9 col-md-8">{currentuser.user_country}</div>
                  </div>

                  <div class="row">
                    <div class="col-lg-3 col-md-4 label">Address</div>
                    <div class="col-lg-9 col-md-8">{currentuser.user_address}</div>
                  </div>

                  <div class="row">
                    <div class="col-lg-3 col-md-4 label">Phone</div>
                    <div class="col-lg-9 col-md-8">{currentuser.user_phone}</div>
                  </div>

                  <div class="row">
                    <div class="col-lg-3 col-md-4 label">Email</div>
                    <div class="col-lg-9 col-md-8">{currentuser.user_email}</div>
                  </div>

                </div>

                <div class="tab-pane fade profile-edit pt-3" id="profile-edit">
                  <form>
                    {successuser ? <div class="alert alert-success alert-dismissible fade show" role="alert">
                          { successuser }
                          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>: null}  
                      {errors.errorupdateuser ? <div class="alert alert-warning alert-dismissible fade show" role="alert">
                          { errors.errorupdateuser }
                          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>: null} 

                      {errors.error_img ? <div class="alert alert-danger alert-dismissible fade show" role="alert">
                          { errors.error_img }
                          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>: null} 
                      

                    <div className="row mb-3">
                      <label htmlFor="profileImage" className="col-md-4 col-lg-3 col-form-label">Profile Image</label>
                      <div className="col-md-8 col-lg-9">
                        {selectedImage ? (
                          <img src={URL.createObjectURL(selectedImage)} alt="Profile" style={{ height : "120px",width : "120px" , objectFit : "cover"}} />
                        ) : (
                          <img src={currentuser.currentuserImg} alt="Profile" style={{ height : "120px",width : "120px", objectFit : "cover" }} />
                        )}
                        <div className="pt-2">
                          <label htmlFor="uploadImage" className="btn btn-primary btn-sm" title="Upload new profile image">
                            <i className="bi bi-upload" style={{ color : "white" }}></i>
                            <input type="file" id="uploadImage" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                          </label>
                          {selectedImage && (
                            <button className="btn btn-danger btn-sm" onClick={handleImageRemove} title="Remove my profile image">
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                        {progressfileimg ? <div class="progress"> <div class="progress-bar" role="progressbar" style={{width: `${progressfileimg}%` }} aria-valuemin="0" aria-valuemax="100">Uplaod {progressfileimg}%</div></div> : null}
                      </div>
                    </div>

                      <div class="row mb-3">
                        <label for="fullName" class="col-md-4 col-lg-3 col-form-label">Full Name</label>
                        <div class="col-md-8 col-lg-9">
                          <input name="user_fulname" ref={addInputsUser} type="text" class="form-control" id="fullName" defaultValue={currentuser.user_fulname}/>
                          {errors.user_fulname ? <span className="text-danger">{errors.user_fulname}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="about" class="col-md-4 col-lg-3 col-form-label">About</label>
                        <div class="col-md-8 col-lg-9">
                          <input name="user_about" ref={addInputsUser} type="text" style={{ padding : "15px" }} class="form-control" defaultValue={currentuser.currentuserAbout}/>
                          {errors.user_about ? <span className="text-danger">{errors.user_about}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="Country" class="col-md-4 col-lg-3 col-form-label">Country</label>
                        <div class="col-md-8 col-lg-9">
                          <input name="user_country" ref={addInputsUser}  type="text" class="form-control" id="Country" defaultValue={currentuser.user_country}/>
                          {errors.user_country ? <span className="text-danger">{errors.user_country}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="Address" class="col-md-4 col-lg-3 col-form-label">Address</label>
                        <div class="col-md-8 col-lg-9">
                          <input name="user_address" ref={addInputsUser} type="text" class="form-control" id="Address" defaultValue={currentuser.user_address}/>
                          {errors.user_address ? <span className="text-danger">{errors.user_address}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="Phone" class="col-md-4 col-lg-3 col-form-label">Phone</label>
                        <div class="col-md-8 col-lg-9">
                          <input name="user_phone" ref={addInputsUser} type="text" class="form-control" id="Phone" defaultValue={currentuser.user_phone}/>
                          {errors.user_phone ? <span className="text-danger">{errors.user_phone}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="Email" class="col-md-4 col-lg-3 col-form-label">Email</label>
                        <div class="col-md-8 col-lg-9">
                          <input name="email" disabled type="email" class="form-control" id="Email" defaultValue={currentuser.user_email}/>
                        </div>
                      </div>

                      <div class="text-center">
                        <button type="button" onClick={updateUser} class="btn btn-primary">
                          {loadingsubmituser ? <i class="fa fa-refresh fa-spin"></i> : null} Save Changes
                        </button>
                      </div>
                  </form>

                </div>

                <div class="tab-pane fade pt-3" id="profile-settings">
                  <form ref={newuserRef}>
                      <div class="row mb-3">
                        <h2>Add User</h2>
                      </div>
                      {successnewuser ? <div class="alert alert-success alert-dismissible fade show" role="alert">
                          { successnewuser }
                          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>: null}  
                      {errors.errornewuser ? <div class="alert alert-warning alert-dismissible fade show" role="alert">
                          { errors.errornewuser }
                          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                      </div>: null}                       
                      <div class="row mb-3">
                        <label for="fullName" class="col-md-4 col-lg-3 col-form-label">Full Name</label>
                        <div class="col-md-8 col-lg-9">
                          <input ref={addInputsnewUser} type="text" class="form-control"/>
                          {errors.newuser_fulname ? <span className="text-danger">{errors.newuser_fulname}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="Email" class="col-md-4 col-lg-3 col-form-label">Email</label>
                        <div class="col-md-8 col-lg-9">
                          <input type="email" ref={addInputsnewUser} class="form-control"/>
                          {errors.newuser_email ? <span className="text-danger">{errors.newuser_email}</span> : null}                          
                        </div>
                      </div>  

                      <div class="row mb-3">
                        <label for="Email" class="col-md-4 col-lg-3 col-form-label">Type</label>
                        <div class="col-md-8 col-lg-9">
                          <select ref={addInputsnewUser} class="form-select padding-10 text-size-17">
                            <option selected className="text-size-17" value="Teacher">Teacher</option>
                            <option className="text-size-17" value="Admin">Admin</option>
                          </select>   
                          {errors.newuser_type ? <span className="text-danger">{errors.newuser_type}</span> : null}                               
                        </div>
                      </div>                                                                  

                      <div class="row mb-3">
                        <label for="Country" class="col-md-4 col-lg-3 col-form-label">Country</label>
                        <div class="col-md-8 col-lg-9">
                          <input ref={addInputsnewUser}  type="text" class="form-control"/>
                          {errors.newuser_country ? <span className="text-danger">{errors.newuser_country}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="Address" class="col-md-4 col-lg-3 col-form-label">Address</label>
                        <div class="col-md-8 col-lg-9">
                          <input ref={addInputsnewUser} type="text" class="form-control"/>
                          {errors.newuser_address ? <span className="text-danger">{errors.newuser_address}</span> : null}
                        </div>
                      </div>

                      <div class="row mb-3">
                        <label for="Phone" class="col-md-4 col-lg-3 col-form-label">Phone</label>
                        <div class="col-md-8 col-lg-9">
                          <input ref={addInputsnewUser} type="text" class="form-control"/>
                          {errors.newuser_phone ? <span className="text-danger">{errors.newuser_phone}</span> : null}
                        </div>
                      </div>

                      <div class="text-center">
                        <button type="button" onClick={addNewUser} class="btn btn-primary">
                          {loadingsubmitnewuser ? <i class="fa fa-refresh fa-spin"></i> : null} Save
                        </button>
                      </div>
                  </form>

                </div>                

                <div class="tab-pane fade pt-3" id="profile-change-password">
                  <form ref={formRef}>
                    {successpassword ? <div class="alert alert-success alert-dismissible fade show" role="alert">
                        { successpassword }
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>: null}  
                    {errors.error ? <div class="alert alert-warning alert-dismissible fade show" role="alert">
                        { errors.error }
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>: null}            
                    {errors.incorrectcurrentpassword ? <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        { errors.incorrectcurrentpassword }
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>: null}                                           
                    <div class="row mb-3">
                      <label for="currentPassword" class="col-md-4 col-lg-3 col-form-label">Current Password</label>
                      <div class="col-md-8 col-lg-9">
                        <input ref={addInputsPassword} type="password" class="form-control text-size-17" id="currentPassword"/>
                        {errors.currentpassword ? <span className="text-danger">{errors.currentpassword}</span> : null}
                      </div>
                    </div>
                    <div class="row mb-3">
                      <label for="newPassword" class="col-md-4 col-lg-3 col-form-label">New Password</label>
                      <div class="col-md-8 col-lg-9">
                        <input ref={addInputsPassword} type="password" class="form-control text-size-17" id="newPassword"/>
                        {errors.newpassword ? <span className="text-danger">{errors.newpassword}</span> : null}
                      </div>
                    </div>
                    <div class="row mb-3">
                      <label for="renewPassword" class="col-md-4 col-lg-3 col-form-label">Re-enter New Password</label>
                      <div class="col-md-8 col-lg-9">
                        <input ref={addInputsPassword} type="password" class="form-control text-size-17" id="renewPassword"/>
                        {errors.repeatnewpassword ? <span className="text-danger">{errors.repeatnewpassword}</span> : null}
                      </div>
                    </div>
                    <div class="text-center">
                      <button type="button" onClick={changePassword} class="btn btn-primary">
                        {loadingsubmitpassword ? <i class="fa fa-refresh fa-spin"></i> : null} Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
    </main>
    {/* <Footer /> */}
  </>
  )
}
