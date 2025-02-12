import React, { useState } from 'react';
import LeaseAgreement from './LeaseAgreement';


const Document = () => {
    const [selectedDocument, setSelectedDocument] = useState('');

    const handleSelection = (e) => {
        setSelectedDocument(e.target.value);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Legal Document Generator</h1>

            {/* Dropdown for selecting document */}
            <select value={selectedDocument} onChange={handleSelection}>
                <option value="">Select a Document</option>
                <option value="lease">Lease Agreement</option>
            </select>

            {/* Conditional Rendering of Document Forms */}
            <div style={{ marginTop: '20px' }}>
                {selectedDocument === 'lease' && <LeaseAgreement />}
            </div>
        </div>
    );
};

export default Document;
