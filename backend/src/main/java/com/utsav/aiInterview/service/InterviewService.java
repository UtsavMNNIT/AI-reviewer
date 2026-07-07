package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.AnswerEvaluation;
import com.utsav.aiInterview.dto.CreateInterviewRequest;
import com.utsav.aiInterview.dto.GeneratedQuestions;
import com.utsav.aiInterview.dto.InterviewResponse;
import com.utsav.aiInterview.dto.QuestionResponse;
import com.utsav.aiInterview.dto.ResumeResponse;
import com.utsav.aiInterview.exception.BadRequestException;
import com.utsav.aiInterview.exception.ResourceNotFoundException;
import com.utsav.aiInterview.model.Evaluation;
import com.utsav.aiInterview.model.Interview;
import com.utsav.aiInterview.model.InterviewStatus;
import com.utsav.aiInterview.model.Question;
import com.utsav.aiInterview.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Interview management service — creation (with AI-generated questions),
 * retrieval, lifecycle transitions and deletion. Interviews are scoped to
 * the authenticated user.
 */
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ResumeService resumeService;
    private final AIService aiService;

    /**
     * Creates an interview by generating questions via Gemini from the candidate's resume,
     * the chosen role and difficulty. The resume must belong to the requesting user.
     */
    public InterviewResponse create(CreateInterviewRequest request, String userEmail) {
        ResumeResponse resume = resumeService.getById(request.resumeId(), userEmail);

        GeneratedQuestions generated = aiService.generateInterviewQuestions(
                resume.extractedText(), request.role(), request.difficulty());

        List<Question> questions = generated.questions().stream()
                .map(item -> Question.builder()
                        .question(item.question())
                        .topic(item.topic())
                        .build())
                .toList();

        Interview interview = Interview.builder()
                .userEmail(userEmail)
                .resumeId(request.resumeId())
                .role(request.role())
                .difficulty(request.difficulty())
                .status(InterviewStatus.UPCOMING)
                .questions(questions)
                .createdAt(Instant.now())
                .build();

        return toResponse(interviewRepository.save(interview));
    }

    public InterviewResponse getById(String id, String userEmail) {
        return toResponse(findOwned(id, userEmail));
    }

    public List<InterviewResponse> listForUser(String userEmail) {
        return interviewRepository.findByUserEmail(userEmail).stream()
                .map(this::toResponse)
                .toList();
    }

    public void delete(String id, String userEmail) {
        interviewRepository.delete(findOwned(id, userEmail));
    }

    /**
     * Transitions an interview from UPCOMING to RUNNING.
     */
    public InterviewResponse start(String id, String userEmail) {
        Interview interview = findOwned(id, userEmail);
        if (interview.getStatus() != InterviewStatus.UPCOMING) {
            throw new BadRequestException(
                    "Interview cannot be started from status: " + interview.getStatus());
        }
        interview.setStatus(InterviewStatus.RUNNING);
        interview.setStartedAt(Instant.now());
        return toResponse(interviewRepository.save(interview));
    }

    /**
     * Transitions an interview from RUNNING to COMPLETED.
     */
    public InterviewResponse complete(String id, String userEmail) {
        Interview interview = findOwned(id, userEmail);
        if (interview.getStatus() != InterviewStatus.RUNNING) {
            throw new BadRequestException(
                    "Interview cannot be completed from status: " + interview.getStatus());
        }
        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setCompletedAt(Instant.now());
        return toResponse(interviewRepository.save(interview));
    }

    /**
     * Evaluates the candidate's answer to a question via Gemini, persists both the
     * answer and the evaluation on the interview, and returns the evaluation.
     */
    public AnswerEvaluation evaluateAnswer(String id, int questionIndex, String answer, String userEmail) {
        Interview interview = findOwned(id, userEmail);

        List<Question> questions = interview.getQuestions();
        if (questions == null || questionIndex < 0 || questionIndex >= questions.size()) {
            throw new BadRequestException("Invalid question index: " + questionIndex);
        }
        Question question = questions.get(questionIndex);

        AnswerEvaluation evaluation = aiService.evaluateAnswer(
                interview.getRole(), interview.getDifficulty(),
                question.getQuestion(), question.getTopic(), answer);

        question.setAnswer(answer);
        question.setEvaluation(Evaluation.builder()
                .score(evaluation.score())
                .summary(evaluation.summary())
                .strengths(evaluation.strengths())
                .weaknesses(evaluation.weaknesses())
                .suggestions(evaluation.suggestions())
                .build());

        interviewRepository.save(interview);
        return evaluation;
    }

    private Interview findOwned(String id, String userEmail) {
        return interviewRepository.findByIdAndUserEmail(id, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
    }

    private InterviewResponse toResponse(Interview interview) {
        List<QuestionResponse> questions = interview.getQuestions() == null
                ? List.of()
                : interview.getQuestions().stream()
                        .map(q -> new QuestionResponse(q.getQuestion(), q.getTopic()))
                        .toList();
        return new InterviewResponse(
                interview.getId(),
                interview.getResumeId(),
                interview.getRole(),
                interview.getDifficulty(),
                interview.getStatus(),
                questions,
                interview.getCreatedAt(),
                interview.getStartedAt(),
                interview.getCompletedAt());
    }
}
