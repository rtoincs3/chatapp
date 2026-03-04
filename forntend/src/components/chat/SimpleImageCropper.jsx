import React, { useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button, ButtonGroup } from 'react-bootstrap';

export default function SimpleImageCropper({ imageSrc , onCropComplete, onCancel }) {
    const [crop, setCrop] = useState();
    const [aspect, setAspect] = useState(undefined); // Default to Square (1:1)
    const [imgRef, setImgRef] = useState(null);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        setImgRef(e.currentTarget);
        
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 50 }, 1, width, height),
            width, height
        );
        setCrop(initialCrop);
    }

    async function handleSave() {
        if (imgRef && crop) { 
            const canvas = document.createElement('canvas');
            const pixelCrop = convertToPixelCrop(crop, imgRef.width, imgRef.height);
            const scaleX = imgRef.naturalWidth / imgRef.width;
            const scaleY = imgRef.naturalHeight / imgRef.height;

            canvas.width = pixelCrop.width * scaleX;
            canvas.height = pixelCrop.height * scaleY;
            const ctx = canvas.getContext('2d');;

            ctx.drawImage(
                imgRef,
                pixelCrop.x * scaleX, pixelCrop.y * scaleY,
                pixelCrop.width * scaleX, pixelCrop.height * scaleY,
                0, 0, canvas.width, canvas.height
            );

            canvas.toBlob((blob) => {
                const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
                onCropComplete(file);
            }, 'image/jpeg');
        }
    }

    return (
        <div className="text-center">
            <div className="mb-3">
                <ButtonGroup size="sm">
                    <Button variant={aspect === 1 ? "primary" : "outline-primary"} onClick={() => setAspect(1)}>Round</Button>
                    <Button variant={!aspect ? "primary" : "outline-primary"} onClick={() => setAspect(undefined)}>Free Style</Button>
                </ButtonGroup>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '10px', width: '100%' }}>
                <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={aspect} circularCrop={aspect === 1}>
                    <img src={imageSrc} onLoad={onImageLoad} style={{ maxWidth: '100%', height:"auto" }} alt="Crop" />
                </ReactCrop>
            </div>

            <div className="mt-3">
                <Button variant="secondary" onClick={onCancel} className="me-2">Cancel</Button>
                <Button variant="success" onClick={handleSave}>Save Crop</Button>
            </div>
        </div>
    );
}

