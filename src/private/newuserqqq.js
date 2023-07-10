import React, { useEffect, useRef, useState } from "react";
import "../App.css";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default function NewUser() {
  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);
  const inputs = useRef([]);
  const [file, setFile] = useState("");
  const [namefile, setNameFile] = useState("");

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
            setNameFile(downloadURL);
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  console.log(namefile);

  const addInputs = (el) => {
    if (el && !inputs.current.includes(el)) {
      inputs.current.push(el);
    }
  };

  const HandleAdd = async (e) => {
    for (let index = 0; index < inputs.current.length; index++) {
      console.log(inputs.current[index].value.trim());
    }
    setLoadingSubmitButton(true);
    try {
      e.preventDefault();
      const newuser = await createUserWithEmailAndPassword(
        auth,
        inputs.current[1].value.trim(),
        inputs.current[2].value.trim()
      );
      await setDoc(doc(db, "users", newuser.user.uid), {
        fulname: inputs.current[0].value.trim(),
        email: inputs.current[1].value.trim(),
        password: inputs.current[2].value.trim(),
        address: inputs.current[3].value.trim(),
        phone: inputs.current[4].value.trim(),
        file_url : namefile,
        timeStamp: serverTimestamp(),
      });
      console.log("GOOD");
    } catch (error) {
      console.log("ERROR -------");
      console.log(error);
    }
    setLoadingSubmitButton(false);
  };
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
            <div class="col-lg-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Insert a new user</h5>

                  <form class="row g-3">
                    <div class="col-12">
                      <label class="form-label">Full name</label>
                      <input type="text" class="form-control" ref={addInputs} />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Email</label>
                      <input
                        type="email"
                        class="form-control"
                        ref={addInputs}
                      />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Password</label>
                      <input
                        type="password"
                        class="form-control"
                        ref={addInputs}
                      />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Address</label>
                      <input
                        type="text"
                        class="form-control"
                        ref={addInputs}
                        placeholder="1234 Main St"
                      />
                    </div>
                    <div class="col-12">
                      <label class="form-label">Phone</label>
                      <input
                        type="text"
                        class="form-control"
                        ref={addInputs}
                        placeholder="+237 698585585"
                      />
                    </div>
                    <div class="col-12">
                      <label class="form-label">File</label>
                      <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        class="form-control"
                        // ref={addInputs}
                      />
                    </div>
                    <div class="text-center">
                      <button
                        onClick={HandleAdd}
                        type="button"
                        class="btn btn-primary"
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
