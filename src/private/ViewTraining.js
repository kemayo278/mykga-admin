import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

export default function ViewTraining() {
  const { training_id } = useParams();

  const [datatraining, setDataTraining] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTraining = async () => {
      if (training_id) {
        setLoading(true);
        try {
          const trainingRef = doc(db, "trainings", training_id);
          const trainingSnapshot = await getDoc(trainingRef);

          if (trainingSnapshot.exists()) {
            const trainingData = {
              training_id: trainingSnapshot.id,
              ...trainingSnapshot.data(),
            };

            if (trainingData.training_category) {
              const categoryRef = doc(
                db,
                "categories",
                trainingData.training_category
              );
              const categorySnapshot = await getDoc(categoryRef);

              if (categorySnapshot.exists()) {
                const categoryData = {
                  category_id: categorySnapshot.id,
                  ...categorySnapshot.data(),
                };
                setDataTraining({ ...trainingData, category: categoryData });
                setLoading(true);
              } else {
                console.log("La catégorie associée n'existe pas");
                setDataTraining(trainingData);
              }
            } else {
              setDataTraining(trainingData);
            }
          } else {
            console.log("Ce document n'existe pas");
          }
        } catch (error) {
          console.log("Erreur lors de la récupération du document :", error);
          return;
        }
      }
    };

    fetchTraining();
  }, [training_id]);

  console.log(datatraining);
  

  return (
    <>
      <NavBar />
      <SideBar />
      {loading ? (
        <>
          <main id="main" class="main">
            <div class="pagetitle">
              <h1>
                {datatraining.training_name} ({datatraining.training_acronym})
              </h1>
              <nav>
                <ol class="breadcrumb">
                  <li class="breadcrumb-item">
                    <a>Home</a>
                  </li>
                  <li class="breadcrumb-item">Trainings</li>
                  <li class="breadcrumb-item active">View / {training_id}</li>
                </ol>
              </nav>
            </div>
            <section class="section">
              <div class="row align-items-top">
                <div className="col-6">
                  <div class="card mb-3">
                    <div class="row g-0">
                      <div class="col-12">
                        <img
                          src={datatraining.training_img}
                          class="img-fluid rounded-start"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Description</h5>
                      {datatraining.training_description}
                    </div>
                  </div>
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Category</h5>
                      {/* {datatraining} */}
                      Categpr shjjh
                    </div>
                  </div>
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Teacher</h5>
                      KEMAYO DENIS JUNIOR
                    </div>
                  </div>
                </div>
              </div>
              <div class="row align-items-top">
                <div className="col-3">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Cote</h5>
                      {datatraining.training_cote}
                    </div>
                  </div>
                </div>
                <div className="col-3">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Module number</h5>
                      {datatraining.training_modulenumber}
                    </div>
                  </div>
                </div>
                <div className="col-3">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Lesson number</h5>
                      {datatraining.training_lessonnumber}
                    </div>
                  </div>
                </div>
                <div className="col-3">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Acronym</h5>
                      {datatraining.training_acronym}
                    </div>
                  </div>
                </div>
              </div>
              <div class="row align-items-top">
                <div className="col-4">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Created At</h5>
                      {/* {datatraining.timeStamp} */}
                      12-Juin-2023
                    </div>
                  </div>
                </div>
                <div className="col-8">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">Link Web</h5>
                      {datatraining.training_link}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </>
      ) : null}
    </>
  );
}
