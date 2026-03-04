import React, { useState } from 'react'
import { Button, ListGroup } from 'react-bootstrap'
import { FaPlus } from 'react-icons/fa'
import GroupCreateModal from './GroupCreateModal'

function GroupTab({ groups, onGroupClick, fetchGroups }) {
  const [modalShow, setModalShow] = useState(false)


return (
    <div className='d-flex flex-column h-100'>
      
      {/* 1. Show the Modal if active */}
      {modalShow ? (
        <GroupCreateModal setModalShow={setModalShow} fetchGroups={fetchGroups} />
      ) : (
        <>
          {/* 2. Show the "Create" Button only if modal is NOT active */}
          <div className='p-3 border-bottom bg-white sticky-top'>
            <Button 
              variant='outline-primary' 
              size='sm'
              className='w-100 d-flex align-items-center justify-content-center gap-2 py-2'
              style={{ borderRadius: '8px', fontWeight: '500' }}
              onClick={() => setModalShow(true)}
            >
              <FaPlus size={12} /> Create new Group
            </Button>
          </div>

          {/* 3. Handle Empty vs List State*/}
          {groups.length === 0 ? (
            <div className='text-center text-muted py-5 px-3'>
              <small className='d-block mb-3'>No groups joined yet.</small>
              <Button variant='primary' size='sm' onClick={() => setModalShow(true)}>
                Create First Group
              </Button>
            </div>
          ) : (
            <ListGroup variant='flush'>
              {groups.map((group) => (
                <ListGroup.Item 
                  key={group._id} 
                  action 
                  className='d-flex justify-content-between align-items-center py-3 px-3 border-bottom'
                  style={{ cursor: "pointer" }}
                  onClick={() => onGroupClick(group)}
                >
                  <div>
                    <div className='fw-bold'>{group.name}</div>
                    <small className='text-muted'>{group.participants?.length || 0} members</small>
                    
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </>
      )}
    </div>
  )
}

export default GroupTab