const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, error }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
                <div className="text-xs text-gray-600 mb-4 leading-relaxed">{message}</div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-100 rounded-xl font-semibold text-xs text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-2.5 bg-gradient-to-l from-red-500 to-red-700 rounded-xl font-semibold text-xs text-white hover:from-red-600 hover:to-red-800 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmModal;