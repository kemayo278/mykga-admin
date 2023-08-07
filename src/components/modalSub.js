import React from 'react'
import { Button, Modal } from 'react-bootstrap';

const modalSub = ({ open, setOpen, id, }) => {
  return (
    // <Modal onc show={showModal} onHide={handleModalClose}>
    <Modal onClose= {() => setOpen(false)} onOpen={() => setOpen(true)} open={open}  >
        <Modal.Header closeButton>
            <Modal.Title>Detail Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p style={{ fontSize : "22px", fontWeight : "bold", color : "grey" }}>
                Details Cart
            </p>
            <p>
                <div style={{ paddingLeft : "15px" }}>
                <li>
                    <span>Specialiste Produit electronique : 123000 XFA</span>
                </li><br/>
                <li>
                    <span>Specialiste Produit electronique : 123000 XFA</span>
                </li>
                </div>
            </p>
            <hr/>
            <p style={{ fontSize : "22px", fontWeight : "bold", color : "grey" }}>
                Details Learner
            </p>
            <p>
                <div style={{ paddingLeft : "15px" }}>
                <li>
                    <span>Ful name :</span> Kemayo Tchatcho denis Junior
                </li><br/>
                <li>
                    <span>Email :</span> Kemayo@gmail.com
                </li><br/>
                <li>
                    <span>Phone :</span> 698495395
                </li><br/>
                </div>
            </p>
        </Modal.Body>
        <Modal.Footer>
            <button className='btn btn-md btn-light' variant="secondary" onClick={()=> setOpen(false)}>
                Close
            </button>
        </Modal.Footer>
    </Modal>
  )
}
