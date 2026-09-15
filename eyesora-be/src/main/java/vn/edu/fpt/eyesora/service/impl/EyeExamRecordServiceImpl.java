package vn.edu.fpt.eyesora.service.impl;

import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.eyesora.dto.request.EyeExamRecordRequest;
import vn.edu.fpt.eyesora.dto.request.EyeExamRecordUpdateRequest;
import vn.edu.fpt.eyesora.dto.response.ExcelImportResponse;
import vn.edu.fpt.eyesora.dto.response.EyeExamRecordResponse;
import vn.edu.fpt.eyesora.dto.response.RowError;
import vn.edu.fpt.eyesora.entity.*;
import vn.edu.fpt.eyesora.exceptions.ResourceNotFoundException;
import vn.edu.fpt.eyesora.repository.*;
import vn.edu.fpt.eyesora.service.IEyeExamRecordService;
import vn.edu.fpt.eyesora.util.SecurityUtil;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EyeExamRecordServiceImpl implements IEyeExamRecordService {

    private static final DateTimeFormatter DATE_FORMATTER = new DateTimeFormatterBuilder()
            .appendPattern("dd/MM/yyyy")
            .toFormatter();
    ;
    private final EyeExamRecordRepository eyeExamRecordRepository;
    private final CampaignRepository campaignRepository;
    private final ClassesRepository classesRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final WardRepository wardRepository;

    @Override
    @Transactional
    public Page<EyeExamRecordResponse> getExamRecords(String keyword, String facilityId, String campaignId, Pageable pageable) {

        User currentUser = SecurityUtil.getCurrentUser();
        String finalFacilityId;

        if (currentUser != null) {
            boolean isFacilityAdmin = currentUser.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_FACILITY_ADMIN"));

            if (isFacilityAdmin) {
                finalFacilityId = currentUser.getFacility().getId();
            } else {
                finalFacilityId = facilityId;
            }
        } else {
            finalFacilityId = facilityId;
        }


        Specification<EyeExamRecord> spec = (root, query, criteriaBuilder) -> {
            if (Long.class != query.getResultType()) {
                Fetch<EyeExamRecord, Classes> classFetch = root.fetch("classesField", JoinType.LEFT);
                classFetch.fetch("facility", JoinType.LEFT);
                root.fetch("patient", JoinType.LEFT);
                root.fetch("campaign", JoinType.LEFT);
                root.fetch("examiner", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("isDeleted"), false));

            if (finalFacilityId != null && !finalFacilityId.isBlank()) {
                predicates.add(criteriaBuilder.equal(
                        root.get("classesField").get("facility").get("id"), finalFacilityId.trim()
                ));
            }
            if (campaignId != null && !campaignId.isBlank()) {
                predicates.add(criteriaBuilder.equal(
                        root.get("campaign").get("campaignId"), campaignId.trim()
                ));
            }

            if (keyword != null && !keyword.isBlank()) {
                String likePattern = "%" + keyword.trim().toLowerCase() + "%";

                Predicate searchPatient = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("patient").get("patientName")), likePattern);

                Predicate searchClass = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("classesField").get("className")), likePattern);

                Predicate searchCampaign = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("campaign").get("campaignTitle")), likePattern);

                Predicate globalSearchPredicate = criteriaBuilder.or(searchPatient, searchClass, searchCampaign);
                predicates.add(globalSearchPredicate);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<EyeExamRecord> recordsPage = eyeExamRecordRepository.findAll(spec, pageable);
        return recordsPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public EyeExamRecordResponse updateExamRecord(
            String examId,
            EyeExamRecordUpdateRequest request) {

        EyeExamRecord entity = eyeExamRecordRepository.findById(examId)
                .filter(record -> !Boolean.TRUE.equals(record.getIsDeleted()))
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy phiếu kiểm tra thị lực, ID: " + examId)
                );

        entity.setVaLeftWithoutGlasses(request.vaLeftWithoutGlasses());
        entity.setVaRightWithoutGlasses(request.vaRightWithoutGlasses());
        entity.setVaLeftOldGlasses(request.vaLeftOldGlasses());
        entity.setVaRightOldGlasses(request.vaRightOldGlasses());
        entity.setVaLeftPinhole(request.vaLeftPinhole());
        entity.setVaRightPinhole(request.vaRightPinhole());
        entity.setSphLeft(request.sphLeft() != null ? request.sphLeft() : 0f);
        entity.setSphRight(request.sphRight() != null ? request.sphRight() : 0f);
        entity.setCylLeft(request.cylLeft() != null ? request.cylLeft() : 0f);
        entity.setCylRight(request.cylRight() != null ? request.cylRight() : 0f);
        entity.setAxisLeft(request.axisLeft());
        entity.setAxisRight(request.axisRight());
        entity.setVaLeftWithGlasses(request.vaLeftWithGlasses());
        entity.setVaRightWithGlasses(request.vaRightWithGlasses());
        entity.setPdLeft(request.pdLeft());
        entity.setPdRight(request.pdRight());

        EyeExamRecord updatedEntity = eyeExamRecordRepository.save(entity);

        return mapToResponse(updatedEntity);
    }

    @Override
    @Transactional
    public EyeExamRecordResponse createExamRecord(EyeExamRecordRequest request) {
        EyeExamRecord entity = new EyeExamRecord();

        ExamCampaign campaign = null;
        if (request.campaignId() != null && !request.campaignId().isBlank()) {
            campaign = campaignRepository.findById(request.campaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chiến dịch: " + request.campaignId()));
            entity.setCampaign(campaign);
        }

        Classes patientClass = null;
        if (request.classId() != null && !request.classId().isBlank()) {
            patientClass = classesRepository.findById(request.classId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp: " + request.classId()));
            entity.setClassesField(patientClass);
        }

        if (request.examinerId() != null && !request.examinerId().isBlank()) {
            entity.setExaminer(userRepository.getReferenceById(request.examinerId()));
        }

        Patient patient;
        if (request.patientId() != null && !request.patientId().isBlank()) {
            patient = patientRepository.findById(request.patientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bệnh nhân với ID: " + request.patientId()));
        } else {
            if (request.newPatientName() == null || request.newPatientName().isBlank()) {
                throw new IllegalArgumentException("Tên bệnh nhân mới không được để trống khi tạo mới.");
            }
            if (request.newPatientDob() == null) {
                throw new IllegalArgumentException("Ngày sinh của bệnh nhân mới không được để trống.");
            }
            if (request.newPatientGender() == null || request.newPatientGender().isBlank()) {
                throw new IllegalArgumentException("Giới tính của bệnh nhân mới không được để trống.");
            }
            if (request.newPatientWardId() == null || request.newPatientWardId().isBlank()) {
                throw new IllegalArgumentException("Mã phường/xã (Ward ID) của bệnh nhân mới không được để trống.");
            }

            if (campaign != null && campaign.getStatus() == ExamCampaign.CampaignStatus.LOCKED) {
                throw new vn.edu.fpt.eyesora.exceptions.BusinessException("Chiến dịch đã bị khóa, không thể tạo thêm bệnh nhân mới!");
            }

            // Tìm thông tin phường xã
            Ward patientWard = wardRepository.findById(request.newPatientWardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phường/xã với ID: " + request.newPatientWardId()));

            Patient newPatient = new Patient();
            newPatient.setPatientName(request.newPatientName().trim());
            newPatient.setDob(request.newPatientDob());
            newPatient.setParentPhone(request.newPatientParentPhone());

            try {
                newPatient.setGender(Patient.Gender.valueOf(request.newPatientGender().toUpperCase()));
            } catch (Exception e) {
                throw new IllegalArgumentException("Giới tính không hợp lệ. Phải là MALE, FEMALE hoặc OTHER.");
            }

            // Đồng bộ các thực thể liên kết (Campaign, Facility, Class, Ward)
//            newPatient.setExamCampaign(campaign);
//            newPatient.setClasses(patientClass);
            newPatient.setWard(patientWard);

            if (patientClass != null && patientClass.getFacility() != null) {
                newPatient.setFacility(patientClass.getFacility());
            }

            newPatient.setIsDeleted(false);
            patient = patientRepository.save(newPatient);
        }

        entity.setPatient(patient);
        entity.setIsDeleted(false);
        entity.setVaLeftWithoutGlasses(request.vaLeftWithoutGlasses());
        entity.setVaRightWithoutGlasses(request.vaRightWithoutGlasses());
        entity.setVaLeftOldGlasses(request.vaLeftOldGlasses());
        entity.setVaRightOldGlasses(request.vaRightOldGlasses());
        entity.setVaLeftPinhole(request.vaLeftPinhole());
        entity.setVaRightPinhole(request.vaRightPinhole());
        entity.setSphLeft(request.sphLeft() != null ? request.sphLeft() : 0f);
        entity.setSphRight(request.sphRight() != null ? request.sphRight() : 0f);
        entity.setCylLeft(request.cylLeft() != null ? request.cylLeft() : 0f);
        entity.setCylRight(request.cylRight() != null ? request.cylRight() : 0f);
        entity.setAxisLeft(request.axisLeft());
        entity.setAxisRight(request.axisRight());
        entity.setVaLeftWithGlasses(request.vaLeftWithGlasses());
        entity.setVaRightWithGlasses(request.vaRightWithGlasses());
        entity.setPdLeft(request.pdLeft());
        entity.setPdRight(request.pdRight());

        EyeExamRecord savedEntity = eyeExamRecordRepository.save(entity);

        return mapToResponse(savedEntity);
    }

    @Override
    @Transactional
    public EyeExamRecordResponse getExamRecordDetail(String examId) {
        EyeExamRecord eyeExamRecord = eyeExamRecordRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ khám mắt"));
        return mapToResponse(eyeExamRecord);
    }

    @Override
    @Transactional
    public void deleteExamRecord(String examId) {
        EyeExamRecord entity = eyeExamRecordRepository.findById(examId)
                .filter(record -> !Boolean.TRUE.equals(record.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hoặc đã bị xóa hồ sơ khám mắt với ID: " + examId));

        entity.setIsDeleted(true);
        eyeExamRecordRepository.save(entity);
    }

    @Override
    public List<EyeExamRecordResponse> getByPatientId(String patientId) {
        return this.eyeExamRecordRepository.findByPatient_PatientId(patientId)
                .stream().filter(record -> !Boolean.TRUE.equals(record.getIsDeleted()))
                .map(this::mapToResponse).toList();
    }

    @Override
    @Transactional
    public ExcelImportResponse importExamRecordsFromExcel(MultipartFile file, String campaignId, String examinerId, String facilityId) {
        List<RowError> errorList = new ArrayList<>();
        List<EyeExamRecord> recordsToSave = new ArrayList<>();
        int totalRows = 0;

        // 1. Kiểm tra và lấy Facility
        if (facilityId == null || facilityId.isBlank()) {
            throw new IllegalArgumentException("Mã cơ sở (Facility ID) không được để trống.");
        }
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cơ sở/trường học với ID: " + facilityId));

        // 2. Khởi tạo campagin & examiner
        ExamCampaign campaign = campaignId != null ? campaignRepository.findById(campaignId).orElse(null) : null;
        User examiner = examinerId != null ? userRepository.findById(examinerId).orElse(null) : null;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            totalRows = Math.max(sheet.getPhysicalNumberOfRows() - 1, 0);

            Map<String, Classes> classCache = new HashMap<>();
            Map<String, Patient> patientCache = new HashMap<>();

            // 1. TỰ ĐỘNG TÌM DÒNG TIÊU ĐỀ CHÍNH
            int headerRowIndex = -1;
            for (int i = 0; i <= Math.min(sheet.getLastRowNum(), 10); i++) { // Quét tối đa 10 dòng đầu
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Kiểm tra xem dòng này có chứa chữ "STT" hay "HỌ VÀ TÊN" không
                String firstCellText = getCellValueAsString(row.getCell(0)).trim().toUpperCase();
                String secondCellText = getCellValueAsString(row.getCell(1)).trim().toUpperCase();

                if (firstCellText.contains("STT") || secondCellText.contains("HỌ VÀ TÊN") || secondCellText.contains("HO VA TEN")) {
                    headerRowIndex = i;
                    break;
                }
            }

            // Nếu không tìm thấy tiêu đề bằng từ khóa, fallback mặc định bỏ qua 4 dòng đầu theo cấu trúc file của bạn
            int startRowIndex = (headerRowIndex != -1) ? (headerRowIndex + 1) : 4;

            // Vì file mẫu của bạn có tiêu đề lồng nhau (2-3 dòng tiêu đề phụ bên dưới chữ STT),
            // ta cần kiểm tra thêm cho đến khi gặp dòng có dữ liệu thật (Cột STT phải là số)
            while (startRowIndex <= sheet.getLastRowNum()) {
                Row row = sheet.getRow(startRowIndex);
                if (row != null && isDataRow(row)) {
                    break; // Đã tìm thấy dòng dữ liệu thật đầu tiên!
                }
                startRowIndex++;
            }

            for (int i = startRowIndex; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                List<String> localErrors = new ArrayList<>();

                EyeExamRecord record = parseRowToEntitySafe(row, campaign, examiner, facility, classCache, patientCache, localErrors);

                if (!localErrors.isEmpty()) {
                    errorList.add(new RowError(i + 1, String.join(", ", localErrors)));
                } else if (record != null) {
                    recordsToSave.add(record);
                }
            }

            // Thực hiện Batch Insert an toàn
            if (!recordsToSave.isEmpty()) {
                eyeExamRecordRepository.saveAll(recordsToSave);
            }

        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống khi xử lý file Excel: " + e.getMessage());
        }

        return new ExcelImportResponse(
                totalRows,
                recordsToSave.size(),
                errorList.size(),
                errorList
        );
    }




    private EyeExamRecord parseRowToEntitySafe(Row row, ExamCampaign campaign, User examiner, Facility facility,
                                               Map<String, Classes> classCache,
                                               Map<String, Patient> patientCache,
                                               List<String> localErrors) {

        // 1. XỬ LÝ LỚP HỌC THEO CƠ SỞ
        String className = getCellValueAsString(row.getCell(3));
        if (className.isEmpty()) {
            localErrors.add("Tên lớp (Class Name) không được để trống");
            return null;
        }

        Classes clazz = classCache.get(className);
        if (clazz == null) {
            clazz = classesRepository.findByClassNameAndFacility(className, facility).orElse(null);

            if (clazz == null) {
                Classes newClass = new Classes();
                newClass.setClassName(className);
                newClass.setFacility(facility);

                try {
                    // Lấy tất cả các chữ số đầu tiên của tên lớp (Ví dụ: "10A1" -> "10", "6B" -> "6")
                    String gradeNumbers = className.replaceAll("^(\\d+).*$", "$1");
                    newClass.setGrade(Integer.parseInt(gradeNumbers));
                } catch (Exception e) {
                    newClass.setGrade(99); // Đặt một giá trị mặc định tạm thời để không bị lỗi NOT NULL
                }
//                newClass.updateSchoolYear();

                clazz = classesRepository.save(newClass);
            }
            classCache.put(className, clazz);
        }

        // 2. XỬ LÝ THÔNG TIN BỆNH NHAN
        String patientName = getCellValueAsString(row.getCell(1)).trim();
        String genderStr = getCellValueAsString(row.getCell(2)).trim();

        if (patientName.isEmpty()) {
            localErrors.add("Tên học sinh không được để trống");
            return null;
        }

        Patient.Gender gender = Patient.Gender.OTHER;
        if (genderStr.equalsIgnoreCase("1") || genderStr.equalsIgnoreCase("nam")) {
            gender = Patient.Gender.MALE;
        } else if (genderStr.equalsIgnoreCase("0") || genderStr.equalsIgnoreCase("nữ")) {
            gender = Patient.Gender.FEMALE;
        }

        String patientCacheKey = String.format("%s_%s_%s", patientName.toLowerCase(), gender.name(), clazz.getId());

        Patient patient = patientCache.get(patientCacheKey);
        if (patient == null) {
            Optional<Patient> existingPatient = patientRepository.findByPatientNameAndGenderAndClassId(patientName, gender, clazz.getId());

            if (existingPatient.isPresent()) {
                patient = existingPatient.get();
            } else {
                Patient newPatient = new Patient();
                newPatient.setPatientName(patientName);
                newPatient.setGender(gender);
//                newPatient.setClasses(clazz);
                newPatient.setFacility(facility);
                newPatient.setIsDeleted(false);
//                newPatient.setExamCampaign(campaign);
                patient = patientRepository.save(newPatient);
            }
            patientCache.put(patientCacheKey, patient);
        }

        // 3. KHỞI TẠO HOẶC CẬP NHẬT RECORD
        EyeExamRecord record = null;

        if (campaign != null && patient.getPatientId() != null) {
            record = eyeExamRecordRepository.findByPatientAndCampaign(patient, campaign).orElse(null);
        }

        if (record == null) {
            record = new EyeExamRecord();
            record.setCampaign(campaign);
            record.setPatient(patient);
            record.setClassesField(clazz);
            record.setIsDeleted(false);
        } else {
            // Nếu đã tồn tại và bạn muốn cho phép ghi đè/cập nhật,
            record.setClassesField(clazz);
        }

        record.setExamDate(LocalDate.now());


        // 4. ĐỌC THÔNG SỐ THỊ LỰC & KHÚC XẠ
        try {
            // --- THỊ LỰC KHÔNG KÍNH ---
            // Cột 4 (MP), Cột 5 (MT)
            record.setVaRightWithoutGlasses(parseVaToFloat(row.getCell(4)));
            record.setVaLeftWithoutGlasses(parseVaToFloat(row.getCell(5)));

            // --- CÓ KÍNH CŨ ---
            // Cột 6 (MP), Cột 7 (MT)
            record.setVaRightOldGlasses(parseVaToFloat(row.getCell(6)));
            record.setVaLeftOldGlasses(parseVaToFloat(row.getCell(7)));

            // --- KÍNH LỖ ---
            // Cột 8 (MP), Cột 9 (MT)
            record.setVaRightPinhole(parseVaToFloat(row.getCell(8)));
            record.setVaLeftPinhole(parseVaToFloat(row.getCell(9)));

            // --- ĐỘ CẦU (SPH) ---
            // Cột 10 (MP), Cột 11 (MT)
            record.setSphRight(parseDiopterToFloat(row.getCell(10)));
            record.setSphLeft(parseDiopterToFloat(row.getCell(11)));

            // --- ĐỘ TRỤ (CYL) ---
            // Cột 12 (MP), Cột 13 (MT)
            record.setCylRight(parseDiopterToFloat(row.getCell(12)));
            record.setCylLeft(parseDiopterToFloat(row.getCell(13)));

            // --- TRỤC (AXIS) ---
            // Cột 14 (MP), Cột 15 (MT)
            record.setAxisRight(getCellValueAsInteger(row.getCell(14)));
            record.setAxisLeft(getCellValueAsInteger(row.getCell(15)));

            // --- TLCK (Thị lực có kính mới) ---
            // Cột 16 (MP), Cột 17 (MT)
            record.setVaRightWithGlasses(parseVaToFloat(row.getCell(16)));
            record.setVaLeftWithGlasses(parseVaToFloat(row.getCell(17)));

            System.out.println(record.getVaRightWithoutGlasses() + " - " + record.getVaLeftWithoutGlasses());

        } catch (Exception e) {
            localErrors.add("Lỗi xử lý dữ liệu các cột mắt: " + e.getMessage());
            return null;
        }

        return record;
    }

    /**
     * Kiểm tra xem dòng này có phải là dòng chứa dữ liệu học sinh thật hay không.
     * Điều kiện: Ô STT (Cột 0) phải chứa dữ liệu số nguyên hợp lệ.
     */
    private boolean isDataRow(Row row) {
        Cell firstCell = row.getCell(0);
        if (firstCell == null || firstCell.getCellType() == CellType.BLANK) {
            return false;
        }

        if (firstCell.getCellType() == CellType.NUMERIC) {
            return true; // Định dạng ô là Number -> Chắc chắn là dòng dữ liệu (STT)
        }

        if (firstCell.getCellType() == CellType.STRING) {
            String value = firstCell.getStringCellValue().trim();
            // Kiểm tra xem chuỗi có phải là số hay không (ví dụ: "77")
            return value.matches("^\\d+$");
        }

        return false;
    }

    /**
     * Helper 1: Chuẩn hóa ĐỘ CẦU / ĐỘ TRỤ (Xử lý -150 -> -1.5, -3.25 -> -3.25, PLANO -> 0.0)
     */
    private Float parseDiopterToFloat(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return 0.0f;
        }

        // 1. KIỂM TRA KIỂU DỮ LIỆU CỦA Ô (BAO GỒM CẢ Ô CÔNG THỨC)
        CellType cellType = cell.getCellType();

        // Nếu ô chứa công thức (ví dụ: =--300), ta lấy kiểu dữ liệu của KẾT QUẢ công thức
        if (cellType == CellType.FORMULA) {
            cellType = cell.getCachedFormulaResultType();
        }

        // 2. XỬ LÝ NẾU KẾT QUẢ LÀ SỐ (NUMERIC)
        if (cellType == CellType.NUMERIC) {
            double val = cell.getNumericCellValue();
            if (Math.abs(val) >= 25) {
                return (float) (val / 100.0);
            }
            return (float) val;
        }

        // 3. XỬ LÝ NẾU KẾT QUẢ LÀ CHUỖI (STRING)
        String cellValue = "";
        if (cellType == CellType.STRING) {
            cellValue = cell.getStringCellValue().trim().toUpperCase();
        } else {
            // Fallback dùng DataFormatter nếu rơi vào các kiểu định dạng lạ khác
            DataFormatter formatter = new DataFormatter();
            cellValue = formatter.formatCellValue(cell).trim().toUpperCase();
        }

        if (cellValue.isEmpty() || cellValue.equals("_") || cellValue.equals("-")) {
            return 0.0f;
        }
        if (cellValue.contains("PLANO")) {
            return 0.0f;
        }

        try {
            long minusCount = cellValue.chars().filter(ch -> ch == '-').count();
            boolean isNegative = (minusCount % 2 != 0);

            // Lọc sạch các ký tự lạ, giữ lại số và dấu chấm thập phân
            String cleanValue = cellValue.replaceAll("[^0-9.]", "");

            if (cleanValue.isEmpty()) {
                return 0.0f;
            }

            double val = Double.parseDouble(cleanValue);

            if (isNegative) {
                val = -val;
            }
            if (Math.abs(val) >= 25) {
                return (float) (val / 100.0);
            }
            return (float) val;
        } catch (NumberFormatException e) {
            return 0.0f;
        }
    }

    /**
     * Helper 2: Chuẩn hóa THỊ LỰC (Xử lý phân số dạng "4/10" -> 0.4. Nếu gặp chữ như "2M ĐNT" trả về null hoặc 0)
     */
    private Float parseVaToFloat(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            return (float) cell.getNumericCellValue();
        }

        String cellValue = cell.getStringCellValue().trim();
        if (cellValue.isEmpty() || cellValue.equals("_") || cellValue.equals("-")) {
            return null;
        }

        // Xử lý chuỗi dạng phân số "04/10" hoặc "4/10"
        if (cellValue.contains("/")) {
            try {
                String[] parts = cellValue.split("/");
                float tuSo = Float.parseFloat(parts[0].trim());
                float mauSo = Float.parseFloat(parts[1].trim());
                return tuSo / mauSo; // Ví dụ: 4 / 10 = 0.4f
            } catch (Exception e) {
                return 0.0f; // Không parse được (ví dụ format lỗi)
            }
        }

        // Xử lý trường hợp chữ "2M ĐNT" -> Vì DB của bạn đang để Float nên bắt buộc phải quy ước trả về một số
        // Hoặc tốt nhất là sửa trường VA trong DB thành String để lưu trọn vẹn chữ "2M ĐNT"
        if (cellValue.toUpperCase().contains("ĐNT") || cellValue.toUpperCase().contains("ST")) {
            return 0.05f; // Quy ước y khoa tạm thời cho đếm ngón tay (hoặc để null)
        }

        try {
            return Float.parseFloat(cellValue);
        } catch (NumberFormatException e) {
            return 0.0f;
        }
    }


    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.format("%.0f", cell.getNumericCellValue()); // Tránh bị biến thành số mũ e+
        }
        return cell.getStringCellValue().trim();
    }

    private Float getCellValueAsFloat(Cell cell, String requiredErrorMessage) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            if (requiredErrorMessage != null) throw new IllegalArgumentException(requiredErrorMessage);
            return null;
        }
        try {
            return (float) cell.getNumericCellValue();
        } catch (Exception e) {
            throw new IllegalArgumentException("Định dạng số không hợp lệ tại ô " + cell.getAddress());
        }
    }

    private Integer getCellValueAsInteger(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }

        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            }

            String value = cell.toString().trim();

            if (value.isEmpty() || "_".equals(value) || "-".equals(value)) {
                return null;
            }

            // Chỉ chứa số
            if (value.matches("-?\\d+")) {
                return Integer.parseInt(value);
            }

            // Chứa chữ + số -> lấy số đầu tiên
            Matcher matcher = Pattern.compile("-?\\d+").matcher(value);
            if (matcher.find()) {
                return Integer.parseInt(matcher.group());
            }

            throw new IllegalArgumentException();
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Định dạng số nguyên không hợp lệ tại ô " + cell.getAddress());
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private String generateDynamicDiagnosis(float sphL, float cylL, float sphR, float cylR) {
        if (sphL == 0 && cylL == 0 && sphR == 0 && cylR == 0) return "Mắt bình thường";
        StringBuilder sb = new StringBuilder();
        if (sphL < 0 || cylL < 0) sb.append("Mắt trái có dấu hiệu cận/loạn thị. ");
        if (sphR < 0 || cylR < 0) sb.append("Mắt phải có dấu hiệu cận/loạn thị. ");
        return sb.toString().trim();
    }

    private EyeExamRecordResponse mapToResponse(EyeExamRecord entity) {
        String facilityName = null;
        if (entity.getClassesField() != null && entity.getClassesField().getFacility() != null) {
            facilityName = entity.getClassesField().getFacility().getFacilityName(); // Đổi thành .getName() nếu biến là name
        }

        return EyeExamRecordResponse.builder()
                .examId(entity.getExamId())
                .examDate(entity.getExamDate())
                .campaignTitle(entity.getCampaign() != null ? entity.getCampaign().getCampaignTitle() : null)
                .patientName(entity.getPatient() != null ? entity.getPatient().getPatientName() : null)
                .gender(entity.getPatient() != null && entity.getPatient().getGender() != null
                        ? entity.getPatient().getGender().name()
                        : null)
                .className(entity.getClassesField() != null ? entity.getClassesField().getClassName() : null)
                .facilityName(facilityName)
                .examinerName(entity.getExaminer() != null ? entity.getExaminer().getFull_name() : null)
                .vaLeftWithoutGlasses(entity.getVaLeftWithoutGlasses())
                .vaRightWithoutGlasses(entity.getVaRightWithoutGlasses())
                .vaLeftOldGlasses(entity.getVaLeftOldGlasses())
                .vaRightOldGlasses(entity.getVaRightOldGlasses())
                .vaLeftPinhole(entity.getVaLeftPinhole())
                .vaRightPinhole(entity.getVaRightPinhole())
                .vaLeftWithGlasses(entity.getVaLeftWithGlasses())
                .vaRightWithGlasses(entity.getVaRightWithGlasses())
                .sphLeft(entity.getSphLeft())
                .sphRight(entity.getSphRight())
                .cylLeft(entity.getCylLeft())
                .cylRight(entity.getCylRight())
                .axisLeft(entity.getAxisLeft())
                .axisRight(entity.getAxisRight())
                .pdLeft(entity.getPdLeft())
                .pdRight(entity.getPdRight())

                .build();
    }
}