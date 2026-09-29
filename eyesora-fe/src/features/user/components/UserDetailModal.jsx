const UserDetailModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-gray-900">Thông tin người dùng</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700 cursor-pointer">
                        <X size={18}/>
                    </button>
                </div>

                <div className="space-y-4 text-xs">
                    <InfoRow label="Họ và Tên" value={user.fullName} />
                    <InfoRow label="Tên đăng nhập" value={user.username} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Cơ sở" value={user.facilityName} />
                    <div className="flex justify-between items-center pt-2 border-b border-gray-100 pb-3">
                        <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Vai trò</span>
                        <div className="flex flex-wrap gap-1">
                            {user.roles?.map(role => (
                                <span key={role} className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-bold text-[10px] uppercase tracking-wide">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">{label}</span>
        <span className="font-bold text-gray-900 text-right">{value || 'N/A'}</span>
    </div>
);

export default UserDetailModal;