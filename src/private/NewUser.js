import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const initialState = { user_fulname : "",user_email : "", user_password : "",user_address : "", user_phone : "", user_country : "", user_about : "",user_type: "Admin", user_state : "active" }

export default function NewUser() {
  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);
  const inputs = useRef([]);
  const [file, setFile] = useState("");
  const [namefile, setNameFile] = useState("");
  const [data,setData] = useState(initialState);
  const [errors,setErrors] = useState({});
  const [progressfile,setProgressFile] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUserId = async () => {
         const docRef = doc(db,"users",id);
         const snapshot = await getDoc(docRef);
         if(snapshot.exists()){
            setData({...snapshot.data()});
        }
        else{
        console.log("ce document n'existe pas");
        }
    };
    id && fetchUserId();
  }, [id]);

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgressFile(progress);
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
          console.log("ERROR");
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("INSERT FILE : ");
            setData((prev) => ({ ...prev, file_url:downloadURL }))
            setNameFile(downloadURL);
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  console.log(namefile);

  const {user_fulname,user_email,user_password,user_address,user_phone,user_country} = data;

  const handleChange = (e) => {
    setData({ ...data,[e.target.name] : e.target.value })
  }

  const validate = () => {
    let errors = {};
    if (!user_fulname) {
      errors.user_fulname  = "Ful name is required";
    }
    if (!user_email) {
      errors.user_email  = "Email is required";
    }
    if (!user_password) {
      errors.user_password  = "Password is required";
    }
    if (!user_address) {
      errors.user_address  = "Address is required";
    }   
    if (!user_phone) {
      errors.user_phone  = "Phone is required";
    }
    if (!user_country) {
      errors.user_country  = "Country is required";
    }    
    return errors;                
  }

  const handleAdd = async(e) => {
    e.preventDefault();
    let errors = validate();
    console.log(errors);
    if(Object.keys(errors).length) return setErrors(errors);
    setLoadingSubmitButton(true);

    if (!id) {
      try {
        const newuser = await createUserWithEmailAndPassword(
          auth,data.user_email,data.user_password
        );
        await setDoc(doc(db, "users", newuser.user.uid), {
          ...data,
          timeStamp: serverTimestamp(),
        });
        console.log("GOOD-SAVE");
      } catch (error) {
        console.log("ERROR -------");
        console.log(error);
      }
    }
    else{
      try {
        await updateDoc(doc(db, "users", id), {
          ...data,
          timeStamp: serverTimestamp(),
        });
        console.log("GOOD-UPDATE");
        navigate("/Users");
      } catch (error) {
        console.log("ERROR -------");
        console.log(error);
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
          <h1>Users</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a href="index.html">Home</a>
              </li>
              <li class="breadcrumb-item active">Users</li>
            </ol>
          </nav>
        </div>
        <section class="section">
          <div class="row">
            <div class="col-lg-12">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">{ id? "Update a user": "Insert a new user" }</h5>

                  <form class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Full name</label>
                      <input
                        type="text"
                        class="form-control"
                        name="user_fulname"
                        value={user_fulname}
                        onChange={handleChange}
                        autoFocus
                      />
                      {errors.user_fulname ? <span className="text-danger">{errors.user_fulname}</span> : null}
                    </div>
                    <div class="col-12">
                      <label class="form-label">Email</label>
                      <input
                        type="email"
                        class="form-control"
                        name="user_email"
                        onChange={handleChange}
                        value={user_email}
                      />
                      {errors.user_email ? <span className="text-danger">{errors.user_email}</span> : null}
                    </div>
                    <div class="col-12">
                      <label class="form-label">Password</label>
                      <input
                        type="password"
                        class="form-control"
                        name="user_password"
                        onChange={handleChange}
                        value={user_password}
                      />
                      {errors.user_password ? <span className="text-danger">{errors.user_password}</span> : null}
                    </div>
                    <div class="col-12">
                      <label class="form-label">Address</label>
                      <input
                        type="text"
                        class="form-control"
                        name="user_address"
                        onChange={handleChange}
                        value={user_address}
                        placeholder="1234 Main St"
                      />
                      {errors.user_address ? <span className="text-danger">{errors.user_address}</span> : null}
                    </div>
                    <div class="col-12">
                      <label class="form-label">Country</label>
                      <input
                        type="text"
                        class="form-control"
                        name="user_country"
                        onChange={handleChange}
                        value={user_country}
                      />
                      {errors.user_country ? <span className="text-danger">{errors.user_country}</span> : null}
                    </div>                    
                    <div class="col-12">
                      <label class="form-label">Phone</label>
                      <input
                        type="text"
                        class="form-control"
                        name="user_phone"
                        onChange={handleChange}
                        value={user_phone}
                        placeholder="+237 698585585"
                      />
                      {errors.user_phone ? <span className="text-danger">{errors.user_phone}</span> : null}
                    </div>
                    <div class="col-12">
                      <label class="form-label">File</label>
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        class="form-control"
                        // onChange={handleChange}
                      />
                    </div>
                    <div class="text-center">
                      <button
                        type="button"
                        disabled = {progressfile !== null && progressfile < 100}
                        class="btn btn-primary"
                        onClick={handleAdd}
                      >
                        {loadingsubmitbutton && (
                          <i class="fa fa-refresh fa-spin"></i>
                        )}{" "}
                        Submit
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
