package vn.edu.fpt.eyesora.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.edu.fpt.eyesora.dto.request.ClassesRequest;
import vn.edu.fpt.eyesora.dto.response.ClassDetailResponse;
import vn.edu.fpt.eyesora.dto.response.ClassesResponse;

public interface IClassesService {
    Page<ClassesResponse> getAllClasses(Pageable pageable);
    ClassesResponse createClass(ClassesRequest req);
    ClassesResponse updateClass(String id, ClassesRequest req);
    ClassDetailResponse getClassDetail(String classId, Pageable pageable);
    ClassesResponse getClassById(String id);

    void deleteClass(String id);
}