package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.ResumeResponse;
import com.utsav.aiInterview.exception.BadRequestException;
import com.utsav.aiInterview.exception.ResourceNotFoundException;
import com.utsav.aiInterview.model.Resume;
import com.utsav.aiInterview.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * Resume management service — upload, retrieval, download and deletion.
 */
@Service
@RequiredArgsConstructor
public class ResumeService {

    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final ResumeRepository resumeRepository;

    /**
     * Extracts the text from an uploaded PDF and persists it with metadata.
     * The raw PDF is not stored — only the extracted text (which is all the
     * interview flow needs) is kept in MongoDB.
     */
    public ResumeResponse upload(MultipartFile file, String userEmail) {
        validatePdf(file);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("Unable to read the uploaded file");
        }

        String extractedText = extractText(bytes);

        Resume resume = Resume.builder()
                .userEmail(userEmail)
                .originalFilename(file.getOriginalFilename())
                .contentType(PDF_CONTENT_TYPE)
                .fileSize(file.getSize())
                .extractedText(extractedText)
                .uploadedAt(Instant.now())
                .build();

        return toResponse(resumeRepository.save(resume));
    }

    public ResumeResponse getById(String id, String userEmail) {
        return toResponse(findOwned(id, userEmail));
    }

    public List<ResumeResponse> listForUser(String userEmail) {
        return resumeRepository.findByUserEmail(userEmail).stream()
                .map(this::toResponse)
                .toList();
    }

    public void delete(String id, String userEmail) {
        resumeRepository.delete(findOwned(id, userEmail));
    }

    private Resume findOwned(String id, String userEmail) {
        return resumeRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + id));
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        boolean isPdf = PDF_CONTENT_TYPE.equalsIgnoreCase(contentType)
                || (filename != null && filename.toLowerCase().endsWith(".pdf"));
        if (!isPdf) {
            throw new BadRequestException("Only PDF files are allowed");
        }
    }

    private String extractText(byte[] bytes) {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException ex) {
            throw new BadRequestException("Unable to read the PDF file");
        }
    }

    private ResumeResponse toResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getOriginalFilename(),
                resume.getContentType(),
                resume.getFileSize(),
                resume.getExtractedText(),
                resume.getUploadedAt());
    }
}
