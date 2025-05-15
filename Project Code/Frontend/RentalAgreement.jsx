import React, { useState, useRef } from "react";
import './frm.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialConditions = [
    "The lessee shall not sublet, assign, or part with the possession of the premises without the prior written consent of the lessor.",
    "The lessee shall not make any structural alterations to the premises without the prior written consent of the lessor.",
    "The lessee shall use the premises for residential purposes only and not for any commercial activities.",
    "The lessee agrees to pay all utility bills including electricity, water, and gas charges during the tenancy period.",
    "The lessor shall be responsible for any major repairs required for the premises, while minor repairs shall be the responsibility of the lessee.",
    "The lessee agrees to comply with all local laws, regulations, and building codes applicable to the premises.",
    "The lessee shall not engage in any illegal activities on the premises.",
    "Any damage caused to the property due to negligence or misuse by the lessee shall be repaired at the lessee's expense.",
    "The lessee shall allow the lessor or their agents to inspect the premises with reasonable notice during the tenancy.",
    "The lessee agrees to vacate the premises at the end of the lease term unless a new agreement is executed."
];


function RentalAgreementGenerator() {
   const [formData, setFormData] = useState({
           lessorName: "",
           lessorAddress: "",
           lesseeName: "",
           lesseeAddress: "",
           leaseTerm: "",
           leaseStartDate: "",
           monthlyRent: "",
           interestRate: "",
           municipalTaxes: "",
           noticePeriod: "",
           leaseEndDate: "",
           propertyDescription: "",
           leaseAgreementDate: "",
           jurisdiction: "",
           securityDeposit: "",
           incrementP: ""
       });
       const [conditions, setConditions] = useState(initialConditions);
       const [newCondition, setNewCondition] = useState("");
       const contentRef = useRef();
   
       const handleChange = (e) => {
           const { name, value } = e.target;
           setFormData((prevData) => ({
               ...prevData,
               [name]: value,
           }));
       };
   
       const handleAddCondition = () => {
           if (newCondition.trim() !== "") {
               setConditions([...conditions, newCondition]);
               setNewCondition("");
           }
       };
   
       const handleDeleteCondition = (index) => {
           const newConditions = [...conditions];
           newConditions.splice(index, 1);
           setConditions(newConditions);
       };
   
       const handleConditionChange = (index, value) => {
           const newConditions = [...conditions];
           newConditions[index] = value;
           setConditions(newConditions);
       };
   
       const onDragEnd = (result) => {
           if (!result.destination) {
               return;
           }
   
           const items = Array.from(conditions);
           const [reorderedItem] = items.splice(result.source.index, 1);
           items.splice(result.destination.index, 0, reorderedItem);
   
           setConditions(items);
       };
   
       const handlePrint = () => {
           const printContent = contentRef.current.innerHTML;
           const originalContent = document.body.innerHTML;
   
           document.body.innerHTML = printContent;
           window.print();
           document.body.innerHTML = originalContent;
       };
   
       return (
           <div className="p-6">
               
               <h1 className="text-2xl font-bold mb-4">Rental Agreement Form</h1>
   
               <div className="space-y-3 mb-4">
                   <input type="text" name="lessorName" placeholder="Lessor's Name" onChange={handleChange} className="border p-2 w-full" />
                   <input type="text" name="lessorAddress" placeholder="Lessor's Address" onChange={handleChange} className="border p-2 w-full" />
                   <input type="text" name="lesseeName" placeholder="Lessee's Name" onChange={handleChange} className="border p-2 w-full" />
                   <input type="text" name="lesseeAddress" placeholder="Lessee's Address" onChange={handleChange} className="border p-2 w-full" />
                   <input type="text" name="propertyDescription" placeholder="Description of the Property" onChange={handleChange} className="border p-2 w-full" />
                   <input type="Date" name="leaseAgreementDate" placeholder="Date of Lease Agreement" onChange={handleChange} className="border p-2 w-full" />
                   <input type="number" name="leaseTerm" placeholder="Lease Term (Years)" onChange={handleChange} className="border p-2 w-full" />
                   <input type="number" name="securityDeposit" placeholder="Security Deposit (Rs)" onChange={handleChange} className="border p-2 w-full" />
                   <input type="number" name="monthlyRent" placeholder="Monthly Rent (Rs)" onChange={handleChange} className="border p-2 w-full" />
                   <input type="number" name="incrementP" placeholder="Increment Percentage (%)" onChange={handleChange} className="border p-2 w-full" />
                   <input type="number" name="municipalTaxes" placeholder="Municipal Taxes (Rs)" onChange={handleChange} className="border p-2 w-full" />
                   <input type="number" name="noticePeriod" placeholder="Notice Period (Months)" onChange={handleChange} className="border p-2 w-full" />
                   <input type="text" name="jurisdiction" placeholder="Jurisdiction" onChange={handleChange} className="border p-2 w-full" />
               </div>
   
              
   
               <DragDropContext onDragEnd={onDragEnd}>
                   <Droppable droppableId="conditionsList">
                       {(provided) => (
                           <ul {...provided.droppableProps} ref={provided.innerRef} className="mb-4">
                               {conditions.map((condition, index) => (
                                   <Draggable key={index} draggableId={`condition-${index}`} index={index}>
                                       {(provided) => (
                                           <li
                                               ref={provided.innerRef}
                                               {...provided.draggableProps}
                                               className="flex items-center border rounded p-2 mb-2 bg-gray-100"
                                           >
                                               <span
                                                   className="mr-2 cursor-grab"
                                                   {...provided.dragHandleProps} // Apply dragHandleProps to the span
                                               >
                                                   &#x2261;
                                               </span>
                                               <input
                                                   type="text"
                                                   value={condition}
                                                   onChange={(e) => handleConditionChange(index, e.target.value)}
                                                   className="flex-grow p-1 border rounded mr-2"
                                               />
                                               <button
                                                   onClick={() => handleDeleteCondition(index)}
                                                   className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 w-auto"
                                               >
                                                   Delete
                                               </button>
                                           </li>
                                       )}
                                   </Draggable>
                               ))}
                               {provided.placeholder}
                           </ul>
                       )}
                   </Droppable>
               </DragDropContext>
                <div className="mb-4">
                   <input
                       type="text"
                       placeholder="Add new condition"
                       value={newCondition}
                       onChange={(e) => setNewCondition(e.target.value)}
                       className="border p-2 mr-2 w-full"
                   />
                   <button onClick={handleAddCondition} className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 w-auto">
                       Add Condition
                   </button>
               </div>
   
               <button onClick={handlePrint} className="mt-5 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-auto">
                   Preview & Download as PDF
               </button>
   
               <div ref={contentRef} className="mt-8 p-4 border rounded bg-white max-w-xl w-full">
                   <h2>RENTAL AGREEMENT</h2>
                   <p>This Agreement of Rent is made and executed on <strong>{formData.leaseAgreementDate || "[Date of Agreement]"}</strong> at <strong>{formData.jurisdiction || "[City]"}</strong> BY AND BETWEEN:-</p>
                   <p><strong>{formData.lessorName || "[LessorName]"}</strong></p>
                   <p><strong>{formData.lessorAddress || "[LessorAddress]"}</strong></p>
                   <p>Hereinafter called the "LESSOR" (which express wherever the context shall mean and include his heirs, executors, administrators, legal representatives, assigns, and nominees) of the One part AND IN FAVOUR OF:</p>
                   <p><strong>{formData.lesseeName || "[LesseeName]"}</strong></p>
                   <p><strong>{formData.lesseeAddress || "[LesseeAddress]"}</strong></p>
                   <p>Hereinafter called the "LESSEE" (which express wherever the context shall mean and include his heirs, executors, administrators, legal representatives, assigns, and nominees) of the other part.</p>
   
                   <p>Whereas the lessor is the sole and absolute owner of the scheduled premises and whereas the lessee approached the lessor to let out the said scheduled premises and the lessor has agreed to do so on the following terms and conditions mentioned hereunder.</p>
   
                   <h3 className="text-lg font-bold mt-4">NOW THIS RENT AGREEMENT WITNESSETH AS FOLLOWS:</h3>
                   <p>1. That in pursuance of the said agreement, the lessee has paid this day a sum of <strong>{formData.securityDeposit || "securityDeposit"}</strong> by way of cash to the lessor in the presence of the witnesses as Security Deposit, which sum the lessor hereby acknowledges for having received. The said sum is subject to be refunded without any interest at the time of lessee vacating and handing over the vacant possession to the lessor, in good and tenantable condition as at the time of occupation, i.e., only after the deduction of arrears of rents, electricity charges, and damages if any.</p>
                   <p>2. The duration of this agreement is for a period of Eleven (11) Months, commencing from <strong>{formData.leaseAgreementDate || "Date of Agreement"}</strong>. It can be renewed for a further period at the option of the lessee/lessor, and if they wish to continue further, a fresh agreement shall be made with an increment of <strong>{formData.incrementP || "[percentage]%"}</strong>% on the prevailing rent.</p>
                   <p>3. The monthly rent fixed at <strong>{formData.monthlyRent || "[MonthlyRent]"}</strong> per month is payable by the lessee to the lessor each month regularly and punctually on or before the 5th of each calendar month, without fail.</p>
   
                   {conditions.map((condition, index) => (
                       <p key={`condition-${index + 4}`}>{index + 4}. {condition}</p>
                   ))}
   
                   <p>IN WITNESS WHEREOF, the parties have executed this Rental Agreement on the date first above written.</p>
   
                   <p><strong>Lessor : ____________________</strong></p>
                   <p><strong>Lessee : ____________________</strong></p>
                   <p><strong>Witness: ____________________</strong></p>
                   <p><strong>Witness: ____________________</strong></p>
               </div>
           </div>
       );
   }

export default RentalAgreementGenerator;
