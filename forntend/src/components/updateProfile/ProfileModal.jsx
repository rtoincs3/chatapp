import React from 'react'

function ProfileModal() {
    return (
        <>
            <Modal show={modalShow2} onHide={handleModalClose2}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant='danger' onClick={handleCloseAlert} dismissible >{error}</Alert>
                    )}
                    {error ? '' : "Are You Sure Want to Delete Account"}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose2}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmitDelete}>
                        Delete Account
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ProfileModal