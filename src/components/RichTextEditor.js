import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Barra de ferramentas enxuta: o site já cuida das cores e fontes
const modules = {
    toolbar: [
        [{ header: [2, 3, 4, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
    ],
};

const RichTextEditor = ({ value, onChange, height = 260, placeholder }) => (
    <div className='rte' style={{ '--rte-h': `${height}px` }}>
        <ReactQuill theme="snow" value={value || ''} onChange={onChange} modules={modules} placeholder={placeholder} />
    </div>
);

export default RichTextEditor;
