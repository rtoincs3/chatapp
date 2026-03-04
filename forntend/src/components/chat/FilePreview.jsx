import React from 'react'

function FilePreview({ fileData, setFileData, fileInputRef }) {
    return (
        <div className="position-absolute bottom-100 start-0 mb-2 ms-3 p-2 bg-white border rounded shadow-lg d-flex align-items-center" style={{ zIndex: 100 }}>

            {/* If images is there preview image */}
            {fileData.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={URL.createObjectURL(fileData)} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "5px" }} />
            ) : <Paperclip size={20} />}

            {/* if image is not here preview file pdf name and size */}
            <div className="ms-2">
                <div className="small text-truncate fw-bold" style={{ maxWidth: '120px' }}>{fileData.name}</div>
                <div className="text-muted small">{(fileData.size / 1024).toFixed(1)} KB</div>
            </div>

            {/* for selct file close button */}
            <Button variant="link" className="text-danger ms-2 p-0" onClick={() => { setFileData(null); fileInputRef.current.value = ""; }}>
                <XLg size={16} />
            </Button>

        </div>
    )
}

export default FilePreview