import React, { useEffect, useState } from "react";
import "../App.css";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { Link } from "react-router-dom";
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { ModalComp } from "./ModalComp";

export default function User() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);
  const [user, setUser] = useState({});
  const rows = 3;
  const columns = 4;

  const elements = [];

  for (let i = 0; i < 7; i++) {
    elements.push(
      <tr class="tr">
        <td class="td">
          <div class="loader"></div>
        </td>
        <td class="td">
          <div class="loader"></div>
        </td>
        <td class="td">
          <div class="loader"></div>
        </td>
        <td class="td">
          <div class="loader"></div>
        </td>
        <td class="td">
          <div class="loader"></div>
        </td>
        <td class="td">
          <div class="loader"></div>
        </td>
        <td class="td">
          <div class="loader"></div>
        </td>
      </tr>
    );
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingSkeletonButton(true);
        const unsubscribe = onSnapshot(collection(db, "users"), (snapShot) => {
          let list = [];
          snapShot.docs.forEach((doc) => {
            list.push({ user_doc_id: doc.id, ...doc.data() });
          });
          setUsers(list);
          setLoadingSkeletonButton(false);
        });
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const modalElement = document.getElementById("myModal");
      if (modalElement) {
        modalElement.classList.add("show");
        modalElement.style.display = "block";
      }
    }, 1000);
  }, []);

  const deleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter((item) => item.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handeModal = (item) => {
    setOpen(true);
    setUser(item);
  };

  const [showModal, setShowModal] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCollectionName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(collectionName);
    // handleModalClose();
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
              <li class="breadcrumb-item">Users</li>
              <li class="breadcrumb-item active">New</li>
            </ol>
          </nav>
        </div>
        <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ height: "75vh" }}>
                <div class="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      {/* <br/><label>Filter : </label>
                      <select>
                        <option>
                          select
                        </option>
                      </select> */}
                    </div>
                    <div className="col-md-6">
                      {/* <br/><Link to="/New-User" style={{ float:"right" }} class="btn btn-outline-primary">New</Link> */}
                      <br />
                      <Link
                        style={{
                          borderRadius: "5px",
                          padding: "5px",
                          width: "80px",
                          float: "right",
                        }}
                        class="btn btn-outline-primary"
                        to="/New-User"
                      >
                        New
                      </Link>
                    </div>
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr style={{ padding: "27px" }}>
                        {/* <th><input class="form-check-input"type="checkbox"name="remember"value="true"id="rememberMe"/></th> */}
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                            borderTopLeftRadius: "5px",
                            borderBottomLeftRadius: "5px",
                          }}
                        >
                          #
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                          }}
                        >
                          Ful Name
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                          }}
                        >
                          Email
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                          }}
                        >
                          State
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                          }}
                        >
                          Phone
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                          }}
                        >
                          Address
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                          }}
                        >
                          &nbsp;
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                          }}
                        >
                          &nbsp;
                        </th>
                        <th
                          className="p-3"
                          scope="col"
                          style={{
                            fontSize: "17px",
                            backgroundColor: "#cfcfcf",
                            borderTopRightRadius: "5px",
                            borderBottomRightRadius: "5px",
                          }}
                        >
                          &nbsp;
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users && users.map((user) => (
                          <tr key={user.user_doc_id}>
                            {/* <td><input class="form-check-input"type="checkbox"name="remember"value="true"id="rememberMe"/></td> */}
                            <td className="vertical-align-middle">
                              {user.file_url != "" ? (
                                <Link to={user.file_url}>
                                  <img
                                    src={user.file_url}
                                    style={{ height: "50px", width: "50px" }}
                                  />
                                </Link>
                              ) : (
                                "Vide"
                              )}
                            </td>
                            <td className="vertical-align-middle">
                              {user.fulname} ddhjsds jhdsjhsd
                            </td>
                            <td className="vertical-align-middle">
                              {user.email}
                            </td>
                            <td className="vertical-align-middle">
                              <span class="badge rounded-pill bg-info text-dark">
                                Active
                              </span>
                            </td>
                            <td className="vertical-align-middle">
                              {user.phone}
                            </td>
                            <td className="vertical-align-middle">
                              {user.address}
                            </td>
                            <td className="vertical-align-middle">
                              <Link
                                to={`/Update-A-User/${user.user_doc_id}`}
                                className="btn btn-outline-info"
                                style={{ borderRadius: "5px", padding: "5px" }}
                              >
                                {" "}
                                Update{" "}
                              </Link>
                            </td>
                            <td className="vertical-align-middle">
                              <a
                                className="btn btn-outline-danger"
                                style={{ borderRadius: "5px", padding: "5px" }}
                                onClick={() => deleteUser(user.user_doc_id)}
                              >
                                {" "}
                                Delete{" "}
                              </a>
                            </td>
                            <td className="vertical-align-middle">
                              <a
                                className="btn btn-outline-warning"
                                style={{ borderRadius: "5px", padding: "5px" }}
                                data-bs-toggle="modal"
                                data-bs-target="#verticalycentered"
                                onClick={() => handeModal(user)}
                              >
                                View
                              </a>
                              {open && <ModalComp />}
                            </td>
                          </tr>
                        ))}
                      {loadingskeletonbutton && <>{elements}</>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* <div className='vw-100' style={{ top : "0px", position : "fixed", height : "100vh", maxWidth: "100%"}}>
            <div className='bg-dark bg-opacity-75' style={{ height : "100vh",width: "100%" }}>
              <div class="modal fade" id="myModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Vertically Centered</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div class="modal-body">
                      Non omnis incidunt qui sed occaecati magni asperiores est
                      mollitia. Soluta at et reprehenderit. Placeat autem numquam et
                      fuga numquam. Tempora in facere consequatur sit dolor ipsum.
                      Consequatur nemo amet incidunt est facilis. Dolorem neque
                      recusandae quo sit molestias sint dignissimos.
                    </div>
                    <div class="modal-footer">
                      <button
                        type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button type="button" class="btn btn-primary">
                        Save changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>    
            </div>                                                               */}
        </section>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
