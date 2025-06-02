import React from "react"
import "./FileInput.scoped.css"

const FileInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({type, ...props}) => {
    return (
        <div className="root">
            <span className="label">Drag and drop or click to add file</span>
            <input
                type="file"
                onDragEnter={event => {
                    event.currentTarget.classList.add('dragover')
                }}
                onDragLeave={event => {                    
                    event.currentTarget.classList.remove('dragover')
                }}
                onDrop={event => {
                    event.currentTarget.classList.remove('dragover')
                }}
                {...props} />
        </div>
    )
}

export default FileInput
