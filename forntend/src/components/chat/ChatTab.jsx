// src/components/chat/ChatTab.jsx
import { ListGroup } from "react-bootstrap";


const BASE_IMAGE_URL = import.meta.env.VITE_BASE_URL_IMAGE;

function ChatTab({ filteredUsers, selectedUser, onUserClick, userOnline, typingUsers }) {
  return (
    <ListGroup variant="flush">
      {filteredUsers.length === 0 ? (
        <div className="text-center text-muted py-5">
          No users found
        </div>
      ) : (
        filteredUsers.map((contact) => (
          <ListGroup.Item
            key={contact._id}
            action
            active={selectedUser?._id === contact._id}
            onClick={() => onUserClick(contact)}
            className="d-flex justify-content-between align-items-center py-3 px-3 border-bottom"
            style={{ cursor: "pointer" }}
          >
            {/*  Profile Picture */}
            <div className="position-relative me-3">
              <img
                src={contact.profilePic ? `${BASE_IMAGE_URL}/${contact.profilePic}` : "/defaultavtar.png" }
                alt={contact.name}
                className="rounded-circle border"
                style={{ width: "45px", height: "45px", objectFit: "cover" }} />
            </div>

            {/* text details */}
            <div className="me-auto overflow-hidden">
              <div className="fw-bold text-truncate">
                {contact.name}
              </div>
              
              <small className="text-muted d-block text-truncate" style={{maxWidth: "200px"}}>
                {typingUsers.has(contact._id) ? "Typing...." : contact.mobNo}
              </small>
            
            </div>

            <div>{userOnline.has(contact._id) ? " 🟢" : ""}</div>


           
          </ListGroup.Item>
        ))
      )}
    </ListGroup>
  );
}

export default ChatTab;