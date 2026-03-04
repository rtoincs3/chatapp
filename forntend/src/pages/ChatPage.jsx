
import { Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatScreen from "../components/chat/ChatScreen";
import { useState, useEffect } from "react";
import axiosApi from "../utils/api";
import GroupChatScreen from "../components/chat/groupChat/GroupChatScreen";
import UpdateUserProfile from "../components/UpdateUserProfile";

import io from "socket.io-client";


const SOCKET_URL = "http://localhost:4000";
const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});


function ChatPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [updateProfileModal, setUpdateProfileModal] = useState(false)
    const [fileData, setFileData] = useState(null)

    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleSelectedUser = (user) => {
        setSelectedUser(user)
        setSelectedGroup()
    }

    const handleSelectedGroup = (group) => {
        setSelectedGroup(group)
        setSelectedUser(null)
    }

    useEffect(() => {
        // START THE CONNECTION
        if (!socket.connected) socket.connect();

        const handleUserUpdate = (updatedData) => {
            console.log("User updated received in ChatPage:", updatedData);

            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u._id === updatedData._id
                        ? { ...u, name: updatedData.name, profilePic: updatedData.profilePic }
                        : u
                )
            );

            setSelectedUser((prevSelected) => {
                if (prevSelected?._id === updatedData._id) {
                    return { ...prevSelected, ...updatedData };
                }
                return prevSelected;
            });
        };

        socket.on("user_updated", handleUserUpdate);

        return () => {
            socket.off("user_updated", handleUserUpdate);
        };
    }, []); // Empty dependency array is fine here

    const fetchUsers = async () => {
        try {
            const res = await axiosApi.get("/auth/users");
            console.log("API Response Users:", res.data.users); // DEBUG: Check if new name is here

            // Use a spread to ensure a new array reference
            setUsers([...(res.data?.users || [])]);
        } catch (error) {
            console.error("Failed to fetch users:", error.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUsers();
            console.log("fetching user")
        }

    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            toast.error(error.message || "Logout failed", { position: "top-center" });
        }
    };

    //  Update profile modal
    const handleCloseModal = () => {
        setUpdateProfileModal(false)
        setFileData(null)
    }

    return (
        <div className="d-flex flex-column vh-100">
            {/* Top Bar */}
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
                <h5 className="mb-0">Chat App</h5>
                <h5 className="mb-0">{user?.name || "User"}</h5>
                <div className="d-flex">
                    <Button variant="outline-light"
                        size="sm"
                        onClick={() => setUpdateProfileModal(true)}>
                        Update Profile
                    </Button>
                    <UpdateUserProfile updateProfileModal={updateProfileModal} handleCloseModal={handleCloseModal} selectedUser={selectedUser}
                        fileData={fileData} setFileData={setFileData} fetchUsers={fetchUsers} />

                    <Button
                        variant="outline-light"
                        size="sm"
                        onClick={handleLogout}
                        className="mx-2"
                    >
                        Logout
                    </Button>
                    {/* <Link to="/update-profile" className="btn btn-light btn-sm">
                        Update Profile
                    </Link> */}


                </div>
            </div>

            {/* Main content – fills remaining height */}
            <div className="flex-grow-1 d-flex overflow-hidden">
                {/* Sidebar */}
                <ChatSidebar

                    users={users}
                    selectedUser={selectedUser}
                    onUserClick={handleSelectedUser}
                    allUsers={users}
                    selectedGroup={selectedGroup}
                    onGroupClick={handleSelectedGroup}
                    setUsers={setUsers}
                />

                {/* Chat area */}
                {selectedUser && (
                    <div className="flex-grow-1 d-flex flex-column overflow-hidden">
                        <ChatScreen selectedUser={selectedUser} isGroup={false} />
                    </div>
                )}
                {selectedGroup && (
                    <div className="flex-grow-1 d-flex flex-column overflow-hidden">
                        <GroupChatScreen selectedGroup={selectedGroup} isGroup={true} />
                    </div>
                )}

            </div>
        </div>
    );
}

export default ChatPage;
