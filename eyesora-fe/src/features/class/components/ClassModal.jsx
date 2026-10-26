const ClassModal = ({ onClose, selectedClass, formData, setFormData, onSave, facilities, errors = {} }) => {
    // console.log("DEBUG - formData.facilityId hiện tại:", formData.facilityId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-950">
                        {selectedClass ? "Edit Class" : "Create New Class"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="text-gray-500 font-black">✕</span>
                    </button>
                </div>

                <div className="space-y-4">
                    {[{ key: 'className', label: 'Class Name', ph: 'ENTER CLASS NAME' },
                        { key: 'grade', label: 'Grade Level', ph: '1-12' },
                        { key: 'schoolYear', label: 'School Year', ph: 'e.g., 2025-2026' }].map(field => (
                        <div key={field.key}>
                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 ml-1">
                                {field.label}
                            </label>
                            <input
                                className={`w-full p-3 border-2 rounded-xl font-bold text-gray-900 ${errors[field.key] ? 'border-red-500' : ''}`}
                                type={field.key === 'grade' ? 'number' : 'text'}
                                placeholder={field.ph}
                                value={formData[field.key] || ''}
                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                            />
                            {errors[field.key] && (
                                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors[field.key]}</p>
                            )}
                        </div>
                    ))}

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 ml-1">Facility</label>
                        <select
                            className={`w-full p-3 border-2 rounded-xl font-bold text-gray-900 bg-white ${errors.facilityId ? 'border-red-500' : ''}`}
                            value={formData.facilityId ? String(formData.facilityId) : ""}
                            onChange={(e) => {
                                console.log("Giá trị select vừa chọn:", e.target.value);
                                setFormData({...formData, facilityId: e.target.value});
                            }}
                        >
                            <option value="">SELECT FACILITY</option>
                            {facilities.map(f => (
                                <option key={f.id} value={String(f.id)}>
                                    {f.facilityName}
                                </option>
                            ))}
                        </select>
                        {errors.facilityId && (
                            <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.facilityId}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose}
                            className="flex-1 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-100">Cancel
                    </button>
                    <button onClick={onSave}
                            className="flex-[2] bg-blue-950 text-white py-4 rounded-2xl font-black hover:bg-blue-900">Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassModal;