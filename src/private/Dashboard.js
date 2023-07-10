import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import NavBar from "../components/NavBar";
import { collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase-config";

export default function Dashboard() {

  const [counttraining, setCountTraining] = useState(0);
  const [countlearning, setCountLearner] = useState(0);
  const [countorder, setCountOrder] = useState(0);
  const [countamount, setAmountOrder] = useState(0);

  useEffect(() => {
    const getCountTraining = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'trainings'));
        const totalCount = querySnapshot.size;
        setCountTraining(totalCount);
      } catch (error) {
        console.error('Erreur lors du comptage des éléments de la collection:', error);
      }
    };

    const getCountLearner = async () => {
      try {
        const querySnapshot = query(collection(db,"users"),where("user_type","==","Learner"))
        const querySnapshotLearner = await getDocs(querySnapshot);
        const totalCountLearner = querySnapshotLearner.docs.length;
        setCountLearner(totalCountLearner);
      } catch (error) {
        console.error('Erreur lors du comptage des éléments de la collection:', error);
      }
    };

    const getCountOrder = async () => {
      try {
        const timestampValue = serverTimestamp();
        const querySnapshot = query(collection(db,"orders"))
        const querySnapshotOrder = await getDocs(querySnapshot);
        const totalCountOrder = querySnapshotOrder.docs.length;
        setCountOrder(totalCountOrder);
      } catch (error) {
        console.error('Erreur lors du comptage des éléments de la collection:', error);
      }
    };

    const getAmountOrder = async () => {
      try {
        const ordersRef = query(collection(db,"orders"), where("order_state", "==", "asset"))
        const ordersSnapshot = await getDocs(ordersRef);
    
        const totalSum = ordersSnapshot.docs.reduce((sum, doc) => {
          const orderData = doc.data();
          const orderSum = orderData.order_amout_transaction || 0; // Assurez-vous que le champ "somme" existe dans chaque document
          return sum + orderSum;
        }, 0);

        setAmountOrder(totalSum);
      } catch (error) {
        console.error('Erreur lors du comptage des éléments de la collection:', error);
      }
    };

    getCountLearner() && getCountTraining() && getCountOrder() && getAmountOrder();
  }, []);

  return (
    <>
      <NavBar />
      <SideBar />
      <main id="main" class="main">
        <div class="pagetitle">
          <h1>Dashboard</h1>
          <nav>
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a href="index.html">Home</a>
              </li>
              <li class="breadcrumb-item active">Dashboard</li>
            </ol>
          </nav>
        </div>
        <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="row">
                <div class="col-xxl-3 col-md-6">
                  <div class="card info-card sales-card">
                    <div class="card-body">
                      <h5 class="card-title">
                        Sales <span>| This Month</span>
                      </h5>

                      <div class="d-flex align-items-center">
                        <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i class="bi bi-cart"></i>
                        </div>
                        <div class="ps-3">
                          <h6>{countorder}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-xxl-3 col-md-6">
                  <div class="card info-card revenue-card">
                    <div class="card-body">
                      <h5 class="card-title">
                        Revenue <span>| This Month</span>
                      </h5>

                      <div class="d-flex align-items-center">
                        <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i class="bi bi-currency-dollar"></i>
                        </div>
                        <div class="ps-3">
                          <h6>{countamount} Xfa</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-xxl-3 col-xl-12">
                  <div class="card info-card customers-card">
                    <div class="card-body">
                      <h5 class="card-title">
                        Leaners <span>| This Year</span>
                      </h5>

                      <div class="d-flex align-items-center">
                        <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i class="bi bi-people"></i>
                        </div>
                        <div class="ps-3">
                          <h6>{countlearning}</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-xxl-3 col-md-6">
                  <div class="card info-card revenue-card">
                    <div class="card-body">
                      <h5 class="card-title">
                        Trainings
                      </h5>

                      <div class="d-flex align-items-center">
                        <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                          <i class="bi bi-journal-text"></i>
                        </div>
                        <div class="ps-3">
                          <h6>{counttraining}</h6>
                        </div>
                      </div>
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
  );
}
