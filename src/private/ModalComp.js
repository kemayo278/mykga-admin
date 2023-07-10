import React from "react";

export const ModalComp = () => {
  return (
    <div className="position-fixed top-0 vw-100 vh-100">
      <div className="w-100 h-100 bg-dark bg-opacity-75">
        <div
          className="position-absolute top-50 start-50 translate-middle"
          style={{ minWidth: "400px" }}
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Sign In</h5>
                <button type="button" class="close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form
                  className="sign-up-form"
                >
                  <div class="mb-3">
                    <label for="" class="form-label" className="form-label">
                      Email Adress
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      name="email"
                      id="signUpEmail"
                      required
                      placeholder=""
                    />
                  </div>
                  <div class="mb-3">
                    <label for="" class="form-label" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      class="form-control"
                      name="pwd"
                      id="signUpPwd"
                      required
                      placeholder=""
                    />
                  </div>
                  <p className="text-danger mt-1"></p>
                  <button type="submit" class="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
