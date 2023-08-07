import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Link } from 'react-router-dom'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase-config'
import SkeletonTable from '../components/SkeletonTable'
import Swal from 'sweetalert2'
import Sample_User from "../Sample_User_Icon.png"
import { Button, Modal } from 'react-bootstrap';

export default function Subscription() {

  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);

  const [subscriptions, setSubscriptions] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [selectedSubscription, setSelectedSubscription] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const filtered = subscriptions.filter((subscription) =>
      subscription.order_id_transaction.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingSkeletonButton(true);
      try {
        const unsubscribeOrders = onSnapshot(
          query(collection(db, "orders"), orderBy("order_timeStamp", "desc")),
          async (ordersSnapshot) => {
            const ordersList = [];
  
            for (const doc of ordersSnapshot.docs) {
              const orderData = doc.data();
              const orderId = doc.id;
              const querySnapshot = await getDocs(query(collection(db, "carts"), where("cart_order", "==", orderId)));
  
              if (!querySnapshot.empty) {
                const cartData = querySnapshot.docs[0].data();
                ordersList.push({
                  order_id: orderId,
                  ...orderData,
                  cartData: cartData
                });
              }
            }
  
            setSubscriptions(ordersList);
            setLoadingSkeletonButton(false);
          }
        );
  
        return () => {
          unsubscribeOrders();
        };
      } catch (error) {
        console.log(error);
        setLoadingSkeletonButton(false);
      }
    };

    const changeStateNotifications = async () => {
        try {
          const querySnapshot = await getDocs(query(collection(db,"notifications"),where("notification_location","==","app-web")));

          querySnapshot.forEach( (document) => {
            const data = document.data();
            const dataId = document.id;

            updateDoc(doc(db, "notifications",dataId), {
                notification_state: "read",
            });
            
          });
        } catch (error) {
          console.log('Une erreur s\'est produite :', error);
        }
      };
  
      changeStateNotifications() && fetchOrders();
  }, []);
  
  console.log(subscriptions);

  const ChangeStatesubscriptionToDisable  = async(id,user_state,userId) => {
    Swal.fire({
      title: 'Do you want to deactivate this Subscription ?', icon: 'question',showCancelButton: true, confirmButtonColor: '#3085d6',confirmButtonText: 'Disable', cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if(user_state !== "idle")
        {
          try {
              let state = "idle";
              const newData = { cart_state: "asset" };

              updateDocumentsByQuery("carts", "cart_order", id, newData);
    
              await updateDoc(doc(db, "orders", id), {
                order_state: state
              });

              let notification_content = "Vous avez recu une notification, Votre souscription a été rejetée";
              let notification_state = "not_read";
              let notification_location = "app-mobile";
  
              await addDoc(collection(db, "notifications"), {
                  notification_learner : userId,
                  notification_content : notification_content,
                  notification_state : notification_state,
                  notification_location : notification_location,
                  notification_timeStamp: serverTimestamp(),
              });

              Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This subscription has been deactivated',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
        }
        else{
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This subscription is already deactivated',showConfirmButton: true,confirmButtonColor: '#3085d6',})
        }
      }
    });
  };

  const updateDocumentsByQuery = async (collectionPath, queryField, queryValue, newData) => {
    try {
      const q = query(collection(db, collectionPath), where(queryField, "==", queryValue));
      const querySnapshot = await getDocs(q);
  
      for (const doc of querySnapshot.docs) {
        await updateDoc(doc.ref, newData);
      }
  
      console.log("Update successful");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const ChangeStatesubscriptionToEnable = async (id, order_state, userId) => {
    Swal.fire({
      title: 'Do you want to activate this Subscription ?',icon: 'question',showCancelButton: true,confirmButtonColor: '#3085d6',confirmButtonText: 'Enable',cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (order_state !== "asset") {
          try {
            const state = "asset";

            const newData = { cart_state: "asset" };

            updateDocumentsByQuery("carts", "cart_order", id, newData);
  
            await updateDoc(doc(db, "orders", id), {
              order_state: state
            });

            let notification_content = "Vous avez recu une notification, Votre souscription a été confirmée";
            let notification_state = "not_read";
            let notification_location = "app-mobile";

            await addDoc(collection(db, "notifications"), {
                notification_learner : userId,
                notification_content : notification_content,
                notification_state : notification_state,
                notification_location : notification_location,
                notification_timeStamp: serverTimestamp(),
            });
  
            Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'This subscription has been activated',showConfirmButton: true});
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6'});
          }
        } else {
          Swal.fire({position: 'top-right',icon: 'warning',title: 'Information',text: 'This subscription is already activated',showConfirmButton: true,confirmButtonColor: '#3085d6'});
        }
      }
    });
  };

  function formatAmount(amount, decimalPlaces = 2) {
    if (isNaN(amount)) {
      return "Invalid amount";
    }
    const formattedAmount = amount.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedAmount;
  }

  function convertTimestampToDatetime(timestamp) {
    const date = timestamp.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
    return formattedDatetime;
  }

  const handleModalOpen = async (userId,orderId) => {
    try {

      const chatRef = collection(db, 'carts');
      const querySnapshot = await getDocs(query(chatRef, where('cart_order', '==', orderId), where('cart_user', '==', userId)));
      
      let subscriptionsList = [];
      for (const docSnap of querySnapshot.docs) {
        const cartData = docSnap.data();
        const trainingId = cartData.cart_training;

        const trainingDocRef = doc(db, "trainings", trainingId);
        const trainingDocSnap = await getDoc(trainingDocRef);

        if (trainingDocSnap.exists()) {
          const trainingData = trainingDocSnap.data();
          subscriptionsList.push({ ...cartData, training: trainingData });
        }
      }

      if (subscriptionsList.length > 0) {
        setSelectedSubscription(subscriptionsList);
      }
      
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        setSelectedUser({ user_id : userSnapshot.id, ...userSnapshot.data() });
      }

      setShowModal(true);

    } catch (error) {
      console.log(error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };
  
    
  return (
    <>
    <NavBar onSearch={handleSearch} />
    <SideBar />
    <main id="main" class="main">
      <div class="pagetitle">
        <h1>List Of Suscriptions</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a>Home</a>
            </li>
            <li class="breadcrumb-item active">Suscriptions</li>
          </ol>
        </nav>
      </div>
      <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ height: "77vh", overflowY : "scroll",scrollBehavior : "inherit" }}>
                <div class="card-body">
                  <div className="row">
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr>
                        <th className="p-3 border-top-left-radius-5 border-bottom-left-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                            Transaction Id
                        </th>                         
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Account Number
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          State
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Phone
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Amount
                        </th>    
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Created At
                        </th> 
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Action
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
                    {loadingskeletonbutton ? <>{SkeletonTable(7,9)}</>:
                    <>
                      {filteredSubscriptions && filteredSubscriptions.map((subscription) => {
                        let classState = "";
                        let contentState = "";
                        if (subscription.order_state === "asset") {classState = "bg-info text-dark";contentState = "Enable";} 
                        else if (subscription.order_state === "idle") { classState = "bg-danger text-white";contentState = "Disable";}
                        else{ classState = "bg-warning text-white";contentState = "Waiting-For"; }                      
                            return (
                                <tr>
                                    <td className="vertical-align-middle">{subscription.order_id_transaction}</td>
                                    <td className="vertical-align-middle">{subscription.order_number_account}</td>
                                    <td className="vertical-align-middle"><span className={`badge rounded-pill ${classState}`} style={{ padding: "10px" }} >{contentState}</span></td>
                                    <td className="vertical-align-middle">{subscription.order_number_phone}</td>
                                    {/* subscription.cartData.cart_user */}
                                    <td className="vertical-align-middle">{formatAmount(subscription.order_amout_transaction)} XFA</td>
                                    <td className="vertical-align-middle">{convertTimestampToDatetime(subscription.order_timeStamp)}</td>
                                    <td className="vertical-align-middle">
                                        <a onClick={() => handleModalOpen(subscription.cartData.cart_user,subscription.order_id)} className="btn btn-outline-primary" style={{ borderRadius: "5px", padding: "5px" }}><i className='bi bi-eye-fill'></i> View</a>
                                    </td>
                                    <td className="vertical-align-middle">
                                        <a onClick={() => ChangeStatesubscriptionToEnable(subscription.order_id,subscription.order_state,subscription.cartData.cart_user)} className="btn btn-outline-info" style={{ borderRadius: "5px", padding: "5px" }}>Enable</a>
                                    </td>
                                    <td className="vertical-align-middle">
                                        <a onClick={() => ChangeStatesubscriptionToDisable(subscription.order_id,subscription.order_state,subscription.cartData.cart_user)} className="btn btn-outline-danger" style={{ borderRadius: "5px", padding: "5px" }}>Disable</a>
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
          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Detail Subscription</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{ fontSize : "22px", fontWeight : "bold", color : "grey" }}>
                  Details Cart
                </p>
                <p>
                  <div style={{ paddingLeft : "15px" }}>
                    {selectedSubscription && selectedSubscription.map((Training) => {
                      return (
                      <>
                        <li>
                          <span>{Training.training.training_name} : {Training.training.training_price} XFA</span>
                        </li><br/>
                      </>
                    )
                    })}
                  </div>
                </p>
                <hr/>
                <p style={{ fontSize : "22px", fontWeight : "bold", color : "grey" }}>
                  Details Learner
                </p>
                <p>
                  <div style={{ paddingLeft : "15px" }}>
                    {selectedUser ? (
                    <>
                      <li>
                        <span>Ful name :</span> {selectedUser.user_fulname}
                      </li><br/>
                      <li>
                        <span>Email :</span> {selectedUser.user_email}
                      </li><br/>
                      <li>
                        <span>Phone :</span> {selectedUser.user_phone}
                      </li><br/>
                    </>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                </p>
            </Modal.Body>
            <Modal.Footer>
              <button className='btn btn-md btn-light' variant="secondary" onClick={handleModalClose}>
                  Close
              </button>
            </Modal.Footer>
          </Modal>
        </section>
    </main>
    <Footer />
  </>
  )
}