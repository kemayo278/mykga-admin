import React, { useContext, useRef, useState } from "react";
import UsePasswordToogle from "./components/UsePasswordToogle";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "./firebase-config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function SignIn() {
  const navigate = useNavigate();
  const {dispatch} = useContext(AuthContext);

  const [PasswordInputType, ToogleIcon] = UsePasswordToogle();
  const inputs = useRef([]);
  const [validationerror , setValidationError] = useState("");
  const [loadingsubmitbutton, setLoadingSubmitButton] = useState(false);
  const [errorauthentification,setErrorAuthentification] = useState(false)

  const addInputs = el => {
    if (el && !inputs.current.includes(el)) {
      inputs.current.push(el)
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleGoogleSignIn = () => {
    signInWithPopup(auth,provider).then((result) =>{
      const user = result.user;
      console.log(user);
    }).catch((error) => {
      console.log("ERROR",error);
    });
  }

  const handleForm = async (event) =>{
    event.preventDefault();
    const errors = {};
    const errorschecking = {};

    if (inputs.current[0].value.trim() === '') {
      errors.email = 'Email is required';
    } else if (!isValidEmail(inputs.current[0].value)) {
      errors.email = 'Email address format is not valid';
    }
    
    if (inputs.current[1].value.trim() === '') {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length === 0) {
      setLoadingSubmitButton(true);
        try {
          await signInWithEmailAndPassword(auth, inputs.current[0].value.trim(), inputs.current[1].value.trim()).then(async (userCredential) => {
            const user = userCredential.user;
    
            const checkuser_email_password = query(collection(db, "users"), where("user_email", "==", inputs.current[0].value.trim()),where("user_password", "==", inputs.current[1].value.trim()));
            const checkuser_email_passwordData = await getDocs(checkuser_email_password);         

            const checkuser_email_password_state = query(collection(db, "users"), where("user_email", "==", inputs.current[0].value.trim()),where("user_password", "==", inputs.current[1].value.trim()),where("user_state", "==", "asset"));
            const checkuser_email_password_stateData = await getDocs(checkuser_email_password_state);   

            if (checkuser_email_passwordData.docs.length < 1) {
              errorschecking.queryCheckuser_Email_Password = 'Email Address or Password Incorrect';
              setErrorAuthentification(errorschecking);
              setValidationError(errors);
              setLoadingSubmitButton(false);
            } else 
            {
              if (checkuser_email_password_stateData.docs.length < 1) {
                errorschecking.queryCheckuser_Email_Password = 'This account has been deactivated';
                setErrorAuthentification(errorschecking);
                setValidationError(errors);
                setLoadingSubmitButton(false);
              }
              else{
                dispatch({type:"LOGIN", payload:user})
                setLoadingSubmitButton(false);
                navigate('/Dashboard'); 
              }
            }
          })
        } catch (error) {
          errorschecking.queryCheckuser_Email_Password = 'Failed to Sign-In';
          setErrorAuthentification(errorschecking);
          setValidationError(errors);
          setLoadingSubmitButton(false);
        }
    } else {
      setValidationError(errors);
      setErrorAuthentification("");
      setLoadingSubmitButton(false);
    }
  }
  return (
    <main>
      <div class="container">
        <section class="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                <div class="d-flex justify-content-center py-4">
                  <a
                    href=""
                    class="logo d-flex align-items-center w-auto"
                  >
                    <img src="assets/img/logo.png" alt="" />
                    <span class="d-none d-lg-block">KGA ADMIN</span>
                  </a>
                </div>
                <div class="card mb-3">
                  <div class="card-body">
                    <div class="pt-4 pb-2">
                      <h5 class="card-title text-center pb-0 fs-4">
                        Login to Your Admin Account
                      </h5>
                      <p class="text-center small">
                        Enter your email adress & password to login
                      </p>
                    </div>

                    <form class="row g-3">
                      <div class="col-12">
                        <button
                          class="btn btn-lg btn-google btn-block btn-outline w-100"
                          onClick={handleGoogleSignIn}
                          type="button"
                        >
                          <img src="https://img.icons8.com/color/23/000000/google-logo.png"/>
                          SignIn Using Google
                        </button>
                      </div>                      
                      <div class="col-12">
                        <label class="form-label">
                          Email adress
                        </label>
                        <div class="input-group">
                          <span class="input-group-text" id="inputGroupPrepend">
                            <i class="fa fa-envelope icon"></i>
                          </span>
                          <input
                            type="email"
                            name="username"
                            class="form-control"
                            placeholder="enter your email adress"
                            ref={addInputs}
                            required
                          />
                          <div class="invalid-feedback">
                            Please enter your username.
                          </div>
                        </div>
                        {validationerror.email && <span className="text-danger">{validationerror.email}</span>}
                      </div>
                      <div class="col-12">
                        <label for="yourPassword" class="form-label">
                          Password
                        </label>
                        <div class="input-group">
                          <span class="input-group-text" id="inputGroupPrepend">
                            <i class="fa fa-key icon"></i>
                          </span>
                          <input
                            type={PasswordInputType}
                            name="password"
                            class="form-control"
                            placeholder="enter your password"
                            ref={addInputs}
                            required
                          />
                          <span className="password-toogle-icon">
                            {ToogleIcon}
                          </span>
                        </div>
                        {validationerror.password && <span className="text-danger">{validationerror.password}</span>}
                      </div>
                      {errorauthentification.queryCheckuser_Email_Password ? <span className="alert alert-danger">{errorauthentification.queryCheckuser_Email_Password}</span> : null}
                      {errorauthentification.queryCheckuser_State ? <span className="text-danger">{errorauthentification.queryCheckuser_State}</span> : null}
                      <div class="col-12">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            name="remember"
                            value="true"
                            id="rememberMe"
                          />
                          <label class="form-check-label" for="rememberMe">
                            Remember me
                          </label>
                        </div>
                      </div>
                      <div class="col-12">
                        <button onClick={handleForm} class="btn w-100 bg-0d569a text-white" type="button">
                          {loadingsubmitbutton ? <i class="fa fa-refresh fa-spin"></i> : null} Login
                        </button>
                      </div>
                      <div class="col-12">
                        <p class="small mb-0 float-right">
                          <a className="text-0d569a" href="pages-register.html">Forget Password ?</a>
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
