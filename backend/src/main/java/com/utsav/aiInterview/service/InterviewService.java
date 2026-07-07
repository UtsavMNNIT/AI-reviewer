package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.AnswerEvaluation;
import com.utsav.aiInterview.dto.CreateInterviewRequest;
import com.utsav.aiInterview.dto.EvaluationResponse;
import com.utsav.aiInterview.dto.GeneratedQuestion;
import com.utsav.aiInterview.dto.InterviewResponse;
import com.utsav.aiInterview.dto.NextQuestionResponse;
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
import java.util.ArrayList;
import java.util.List;

/**
 * Interview management service — creation (with AI-generated questions),
 * retrieval, lifecycle transitions and deletion. Interviews are scoped to
 * the authenticated user.
 */
@Service
@RequiredArgsConstructor
public class InterviewService {

    /** Number of questions asked over the course of an interview. */
    private static final int QUESTION_COUNT = 8;

    private final InterviewRepository interviewRepository;
    private final ResumeService resumeService;
    private final AIService aiService;

    /**
     * Creates an interview immediately, without questions. The questions are generated
     * one at a time during the session (see {@link #generateNextQuestion}) so the
     * candidate isn't kept waiting for a full batch. The resume must belong to the user.
     */
    public InterviewResponse create(CreateInterviewRequest request, String userEmail) {
        // Verify the resume exists and belongs to the user (fast, no AI call).
        resumeService.getById(request.resumeId(), userEmail);

        Interview interview = Interview.builder()
                .userEmail(userEmail)
                .resumeId(request.resumeId())
                .role(request.role())
                .difficulty(request.difficulty())
                .status(InterviewStatus.UPCOMING)
                .questions(new ArrayList<>())
                .createdAt(Instant.now())
                .build();

        return toResponse(interviewRepository.save(interview));
    }

    /**
     * Generates the next interview question via Gemini (grounded in the resume, role and
     * difficulty, avoiding already-asked questions), appends it to the interview and
     * returns it with its position. Throws once {@link #QUESTION_COUNT} is reached.
     */
    public NextQuestionResponse generateNextQuestion(String id, String userEmail) {
        Interview interview = findOwned(id, userEmail);

        List<Question> questions = interview.getQuestions();
        if (questions == null) {
            questions = new ArrayList<>();
            interview.setQuestions(questions);
        }
        if (questions.size() >= QUESTION_COUNT) {
            throw new BadRequestException("All questions have already been generated");
        }

        ResumeResponse resume = resumeService.getById(interview.getResumeId(), userEmail);
        List<String> alreadyAsked = questions.stream().map(Question::getQuestion).toList();

        GeneratedQuestion generated = aiService.generateNextQuestion(
                resume.extractedText(), interview.getRole(), interview.getDifficulty(), alreadyAsked);

        questions.add(Question.builder()
                .question(generated.question())
                .topic(generated.topic())
                .build());
        interviewRepository.save(interview);

        return new NextQuestionResponse(
                generated.question(), generated.topic(), questions.size(), QUESTION_COUNT);
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
                        .map(q -> new QuestionResponse(
                                q.getQuestion(),
                                q.getTopic(),
                                q.getAnswer(),
                                toEvaluationResponse(q.getEvaluation())))
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

    private EvaluationResponse toEvaluationResponse(Evaluation evaluation) {
        if (evaluation == null) {
            return null;
        }
        return new EvaluationResponse(
                evaluation.getScore(),
                evaluation.getSummary(),
                evaluation.getStrengths(),
                evaluation.getWeaknesses(),
                evaluation.getSuggestions());
    }
}
