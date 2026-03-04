import { useEffect, useRef, useState } from "react";
import { Button, Overlay } from "react-bootstrap";
import { ArrowCounterclockwise, Download, XLg, ZoomIn, ZoomOut } from "react-bootstrap-icons";

export default function ImageLightbox({ image, onClose }) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({x: 0, y: 0})
    const [isDragging, setIsDragging] = useState(false)

    // i want to close main div when esc keypress so we will give overlay to main div
    const overLayRef = useRef(null)
    useEffect(() => {
        if(overLayRef.current){
            const timer = setTimeout(() => {
                overLayRef.current.focus();
            }, 10)

            return () => clearTimeout(timer)
        }
    }, [])
    
    const dragStart = useRef({x: 0, y: 0})

    // Reset when image changes
    useEffect(() => {
        setScale(1)
        setPosition({x: 0, y: 0})
    }, [image])

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 2))
    const handleZoomOut = () => setScale(prev => {
        const newScale = Math.max(prev - 0.3, 1);
        if(newScale === 1) setPosition({x: 0, y: 0}); // Reset position if zoomed out to 1
        return newScale;
    })

    const handleWheel = (e) => {
        const delta = e.deltaY > 0 ? -0.15 : 0.15; // Adjusted for smoother scroll
        setScale((prev) => {
            const newScale = Math.min(Math.max(prev + delta, 1), 2)
            if(newScale === 1) setPosition({x: 0, y: 0})
            return newScale
        })
    }

    // Panning Logic 
    const handleMouseDown = (e) => {
        if(scale > 1){
            setIsDragging(true);
            // clientY 
            dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
        }
    };

    const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
        // 1. Calculate the new raw position
        let newX = e.clientX - dragStart.current.x;
        let newY = e.clientY - dragStart.current.y;

        // 2. Calculate Boundaries 
        // This prevents the image from moving more than its own width/height
        const maxX = (window.innerWidth * (scale - 1)) / 2;
        const maxY = (window.innerHeight * (scale - 1)) / 2;

        // 3. Clamp the values (Keep them between -max and +max)
        const clampedX = Math.max(Math.min(newX, maxX), -maxX);
        const clampedY = Math.max(Math.min(newY, maxY), -maxY);

        setPosition({ x: clampedX, y: clampedY });
    }
};


    const handleMouseUp = () => setIsDragging(false)

    const resetZoom = () => {
        setScale(1)
        setPosition({x: 0, y: 0})
    }

    const handleDownload = async () => {
        try {
            const response = await fetch(image)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            let splitImg = image.split("/").pop()
            let splitImg2 = splitImg.split("_")[0]
            link.href = url
            link.download = splitImg2 || "Download.jpg"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.log(error.message)
        }
    }

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ 
                zIndex: 9999, 
                backgroundColor: "rgba(0,0,0,0.9)", 
                overflow:"hidden", 
                cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : 'grab',
                outline: "none"
            }}
            tabIndex="-1"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            ref={overLayRef}
            onKeyDown={(e) => {
                if(e.key === "Escape"){
                    onClose(false)
                }
            }}
        >
            {/* Top Right Controls */}
            <div className="position-absolute top-0 end-0 m-5 d-flex gap-3" style={{zIndex: 99999}}>
                <Button variant="link" className="text-white p-0 border-0" onClick={handleDownload} title="Download Image"><Download size={28} /></Button>
                <Button variant="link" className="text-white p-0 border-0" onClick={() => onClose(false)} title="Close"><XLg size={30} /></Button>
            </div>

            {/* Image Wrapper */}
            <div style={{
                // Fixed transition (added 's' to 0.2s)
                transition: isDragging ? "none" : "transform 0.2s ease-out",
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                willChange: "transform"
            }}>
                <img
                    src={image}
                    className="img-fluid shadow-lg"
                    style={{ 
                        maxHeight: "90vh", 
                        maxWidth: "90vw", 
                        objectFit: "contain", 
                        borderRadius: 8, 
                        userSelect: "none", 
                        pointerEvents: "none" 
                    }}
                    alt="Full view"
                />
            </div>

            {/* Bottom Controls */}
            <div className="position-absolute bottom-0 end-0 m-5 d-flex gap-3" style={{zIndex: 99999}}>
                <Button variant="link" className="text-white p-0 border-0" onClick={resetZoom}><ArrowCounterclockwise size={24} /></Button>
                <Button variant="link" className="text-white p-0 border-0" onClick={handleZoomIn}><ZoomIn size={28} /></Button>
                <Button variant="link" className="text-white p-0 border-0" onClick={handleZoomOut}><ZoomOut size={28} /></Button>
            </div>

            {/* Zoom Indicator */}
            <div className="position-absolute bottom-0 mb-4 badge rounded-pill bg-dark bg-opacity-50 px-3 py-2 text-white">
                Zoom: {Math.round(scale * 100)}% {scale > 1 ? "| Hold & Drag to move" : "Use Mouse wheel"}
            </div>
        </div>
    );
}
