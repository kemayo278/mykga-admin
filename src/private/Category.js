import React, { useEffect, useState } from 'react'
import Footer from '../components/Footer'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase-config'
import SkeletonTable from '../components/SkeletonTable'
import Swal from 'sweetalert2'

export default function Category() {

  const [loadingskeletonbutton, setLoadingSkeletonButton] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
        setLoadingSkeletonButton(true);
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
              setLoadingSkeletonButton(false);
            }
          );
          return () => {
            unsubscribe();
          };
        } catch (error) {
          setLoadingSkeletonButton(true);
        }
        
        
    };
    fetchCategory();
  }, []);
  
  const handleDelete = async(id) => {
    Swal.fire({
      title: 'Deletion', text: 'Do you want to delete this Category?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#d33', confirmButtonText: 'Delete', cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        try {
            deleteDoc(doc(db, "categories", id));
            setCategories(categories.filter((item) => item.id !== id));
            Swal.fire({position: 'top-right',icon: 'success',title: 'Thanks you!',text: 'Category deleted successfully',showConfirmButton: true})
          } catch (error) {
            Swal.fire({position: 'top-right',icon: 'error',title: 'Oops!',text: 'An error occurred while executing the program',showConfirmButton: true,confirmButtonColor: '#3085d6',})
          }
      }
    });
  };
    
  return (
    <>
    <NavBar />
    <SideBar />
    <main id="main" class="main">
      <div class="pagetitle">
        <h1>List Of Categories</h1>
        <nav>
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a>Home</a>
            </li>
            <li class="breadcrumb-item active">Categories</li>
          </ol>
        </nav>
      </div>
      <section class="section dashboard">
          <div class="row">
            <div class="col-lg-12">
              <div class="card" style={{ height: "77vh" }}>
                <div class="card-body">
                  <div className="row">
                    <div className="col-md-6">
                    </div>
                    <div className="col-md-6">
                      <Link to= "/Add-Category" style={{borderRadius: "5px",padding: "5px"}} class="btn btn-outline-primary float-right w-80 mt-4" >
                        New
                      </Link>
                    </div>
                  </div>
                  <br />
                  <table id="example" class="table table-condensed">
                    <thead>
                      <tr>
                        <th className="p-3 border-top-left-radius-5 border-bottom-left-radius-5 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                        Category Image
                        </th>
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Category name
                        </th>                        
                        <th className="p-3 text-size-17 bg-cfcfcf" scope="col" style={{backgroundColor: "#cfcfcf",}}>
                          Category description
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
                    {categories && categories.map((category) => (
                        <tr>
                            <td className="vertical-align-middle">
                              <Link to={category.category_img}>
                                <img src={category.category_img} style={{ height: "50px", width: "50px", borderRadius: "10px" }} />
                              </Link>
                            </td>
                            <td className="vertical-align-middle">{category.category_name}</td>
                            <td title={category.category_description} className="vertical-align-middle cursor-pointer">{(category.categoryDescription)}</td>
                            <td className="vertical-align-middle">
                                <Link to={`/Update-Category/${category.category_id}`} className="btn btn-outline-warning" style={{ borderRadius: "5px", padding: "5px" }}>Update</Link>
                            </td>
                            <td className="vertical-align-middle">
                                <a onClick={() => handleDelete(category.category_id)} className="btn btn-outline-danger" style={{ borderRadius: "5px", padding: "5px" }}>Delete</a>
                            </td>
                        </tr>      
                    ))}
                    {loadingskeletonbutton && <>{SkeletonTable(7,5)}</>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
    </main>
    <Footer />
  </>
  )
}
