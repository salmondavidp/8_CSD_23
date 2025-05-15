import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaseAgreement from './LeaseAgreement';
import RentalAgreement from './RentalAgreement';
import './DocDraft.css';

const DocDraft = () => {
  const [selectedDocument, setSelectedDocument] = useState("");
  const navigate = useNavigate();

  const handleSelection = (e) => {
    setSelectedDocument(e.target.value);
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="doc-draft-container">
      <h1 className="title">Legal Document Generator</h1>

      <button className="home-button" onClick={goHome}>Home</button>

      <select
        value={selectedDocument}
        onChange={handleSelection}
        className="document-select"
      >
        <option value="">Select a Document</option>
        <option value="lease">Lease Agreement</option>
        <option value="Rental">Rental Agreement</option>
      </select>

      <div className="form-container">
        {selectedDocument === "lease" && <LeaseAgreement />}
        {selectedDocument === "Rental" && <RentalAgreement />}
      </div>
    </div>
  );
};

export default DocDraft;
