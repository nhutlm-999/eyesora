import { useState, useCallback } from 'react';
import axiosClient from '../../../shared/axios/axiosClient.js';

export default function useRecordDetail() {
    const [isOpen, setIsOpen] = useState(false);
    const [record, setRecord] = useState(null);

    const open = useCallback(async (row) => {
        try {
            const res = await axiosClient.get(`/eye-exam-records/${row.examId}`);
            setRecord(res.data);
            setIsOpen(true);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết hồ sơ khám mắt:', error);
            alert('Lỗi khi tải chi tiết hồ sơ khám mắt');
        }
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    return { isOpen, record, open, close };
}
