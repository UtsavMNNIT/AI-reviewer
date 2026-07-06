package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.ResumeDownload;
import com.utsav.aiInterview.dto.ResumeResponse;
import com.utsav.aiInterview.exception.BadRequestException;
import com.utsav.aiInterview.exception.ResourceNotFoundException;
import com.utsav.aiInterview.model.Resume;
import com.utsav.aiInterview.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Resume management service — upload, retrieval, download and deletion.
 */
@Service
@RequiredArgsConstructor
public class ResumeService {

    private static final String PDF_CONTENT_TYPE = "application/pdf";

    private final ResumeRepository resumeRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Stores an uploaded PDF, extracts its text and persists the metadata.
     */
    public ResumeResponse upload(MultipartFile file, String userEmail) {
        validatePdf(file);

        String originalFilename = file.getOriginalFilename();
        String storedFilename = UUID.randomUUID() + ".pdf";

        Path uploadPath = Paths.get(uploadDir);
        Path targetPath = uploadPath.resolve(storedFilename);

        byte[] bytes;
        try {
            bytes = file.getBytes();
            Files.createDirectories(uploadPath);
            Files.write(targetPath, bytes);
        } catch (IOException ex) {
            throw new UncheckedIOException("Failed to store uploaded file", ex);
        }

        String extractedText = extractText(bytes);

        Resume resume = Resume.builder()
                .userEmail(userEmail)
                .originalFilename(originalFilename)
                .storedFilename(storedFilename)
                .filePath(targetPath.toString())
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
        Resume resume = findOwned(id, userEmail);
        try {
            Files.deleteIfExists(Paths.get(resume.getFilePath()));
        } catch (IOException ex) {
            throw new UncheckedIOException("Failed to delete stored file", ex);
        }
        resumeRepository.delete(resume);
    }

    public ResumeDownload loadFileForDownload(String id, String userEmail) {
        Resume resume = findOwned(id, userEmail);
        Path path = Paths.get(resume.getFilePath());
        Resource resource;
        try {
            resource = new UrlResource(path.toUri());
        } catch (IOException ex) {
            throw new UncheckedIOException("Failed to read stored file", ex);
        }
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("Stored file not found for resume: " + id);
        }
        return new ResumeDownload(resource, resume.getOriginalFilename(), resume.getContentType());
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
