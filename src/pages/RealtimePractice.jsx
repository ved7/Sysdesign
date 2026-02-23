import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Copy, Pause, Play, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import '@excalidraw/excalidraw/index.css';
import { questions } from '../data/questions';

const ExcalidrawCanvas = lazy(() =>
  import('@excalidraw/excalidraw').then((module) => ({ default: module.Excalidraw })),
);

const PRACTICE_SECTIONS = [
  { id: 'requirements', title: 'Requirements', hint: 'Clarify functional + non-functional requirements and constraints.' },
  { id: 'apis', title: 'APIs', hint: 'Define critical APIs, request/response shape, and idempotency behavior.' },
  { id: 'highLevelDesign', title: 'High-Level Design', hint: 'List services, data flow, and request path from client to storage.' },
  { id: 'dataModel', title: 'Data Model', hint: 'Core entities, indexes, partition keys, and consistency needs.' },
  { id: 'scaling', title: 'Scaling Plan', hint: 'Read/write scaling, cache strategy, sharding, and traffic spikes.' },
  { id: 'reliability', title: 'Reliability & Failures', hint: 'Timeouts, retries, failover, DLQ, and graceful degradation.' },
  { id: 'tradeoffs', title: 'Trade-Offs', hint: 'Document choices with reasons: consistency vs availability, cost vs latency.' },
  { id: 'deepDive', title: 'Deep Dive', hint: 'Pick one subsystem and explain internals (e.g., matching, feed fanout).' },
];

const DRAFT_PREFIX = 'live-practice-v1:';
const AI_KEY_STORAGE = 'live-practice:openrouter-key';
const AI_MODEL_STORAGE = 'live-practice:openrouter-model';
const DEFAULT_AI_MODEL = 'google/gemini-2.0-flash-thinking-exp:free';
const DEFAULT_BOARD_SCENE = {
  elements: [],
  appState: {
    viewBackgroundColor: '#ffffff',
  },
};

const STOPWORDS = new Set([
  'a', 'an', 'and', 'or', 'to', 'the', 'of', 'in', 'on', 'for', 'with', 'as', 'at', 'by', 'from', 'is', 'are',
  'be', 'can', 'should', 'that', 'this', 'it', 'into', 'under', 'over', 'very', 'high', 'low', 'user', 'users',
  'support', 'system', 'service', 'design',
]);

const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const createDefaultSections = (question) => {
  const requirementsText = question?.requirements?.length
    ? question.requirements.map((req) => `- ${req}`).join('\n')
    : '';

  return {
    requirements: requirementsText,
    apis: '',
    highLevelDesign: '',
    dataModel: '',
    scaling: '',
    reliability: '',
    tradeoffs: '',
    deepDive: '',
  };
};

const getTokenSet = (text) =>
  new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token && token.length > 2 && !STOPWORDS.has(token)),
  );

const buildDraftDocument = (sections) =>
  PRACTICE_SECTIONS.map((section) => `## ${section.title}\n${sections[section.id] || ''}`.trim()).join('\n\n');

const runLocalReview = (question, sections) => {
  const sectionEntries = PRACTICE_SECTIONS.map((section) => ({
    ...section,
    value: (sections[section.id] || '').trim(),
  }));

  const answeredSections = sectionEntries.filter((entry) => entry.value.length > 0);
  const missingSections = sectionEntries.filter((entry) => entry.value.length === 0).map((entry) => entry.title);

  const fullAnswer = buildDraftDocument(sections);
  const wordCount = fullAnswer.split(/\s+/).filter(Boolean).length;
  const answerTokens = getTokenSet(fullAnswer);

  const requirementCoverage = (question?.requirements || []).filter((requirement) => {
    const requirementTokens = Array.from(getTokenSet(requirement));
    if (!requirementTokens.length) return false;
    return requirementTokens.some((token) => answerTokens.has(token));
  });

  const architectureTokens = ['cache', 'queue', 'replication', 'sharding', 'latency', 'throughput', 'availability'];
  const architectureHits = architectureTokens.filter((token) => answerTokens.has(token));

  const sectionScore = Math.round((answeredSections.length / PRACTICE_SECTIONS.length) * 35);
  const depthScore = Math.min(30, Math.round((wordCount / 600) * 30));
  const requirementScore = question?.requirements?.length
    ? Math.round((requirementCoverage.length / question.requirements.length) * 35)
    : 20;

  const score = Math.max(0, Math.min(100, sectionScore + depthScore + requirementScore));

  const strengths = [];
  if (answeredSections.length >= 6) strengths.push('Good section coverage across the interview framework.');
  if (wordCount >= 350) strengths.push('Answer depth is strong enough for a realistic interview round.');
  if (architectureHits.length >= 3) strengths.push('Architecture vocabulary includes key distributed-system patterns.');
  if (requirementCoverage.length >= Math.max(1, Math.floor((question?.requirements?.length || 0) * 0.6))) {
    strengths.push('Most prompt requirements are referenced in your solution.');
  }
  if (!strengths.length) strengths.push('You have a workable foundation to iterate from.');

  const improvements = [];
  if (missingSections.length) improvements.push(`Fill missing sections: ${missingSections.slice(0, 4).join(', ')}.`);
  if (wordCount < 250) improvements.push('Add more concrete detail: APIs, datastore decisions, and failure handling.');
  if (requirementCoverage.length < (question?.requirements?.length || 0)) {
    improvements.push('Map every listed requirement to an explicit design decision.');
  }
  if (!answerTokens.has('tradeoff') && !answerTokens.has('tradeoffs') && !answerTokens.has('trade')) {
    improvements.push('Include explicit trade-offs to strengthen interview reasoning.');
  }
  if (!answerTokens.has('capacity') && !answerTokens.has('qps')) {
    improvements.push('Add quick capacity estimates (traffic, storage, and peak assumptions).');
  }

  return {
    score,
    wordCount,
    strengths,
    improvements,
    requirementCoverage: `${requirementCoverage.length}/${question?.requirements?.length || 0}`,
  };
};

class DiagramErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="studio-board-loading">Excalidraw failed to load.</div>;
    }
    return this.props.children;
  }
}

const RealtimePractice = () => {
  const [selectedQuestionId, setSelectedQuestionId] = useState(questions[0]?.id || '');
  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedQuestionId) || questions[0],
    [selectedQuestionId],
  );

  const [sections, setSections] = useState(() => createDefaultSections(selectedQuestion));
  const [boardScene, setBoardScene] = useState(DEFAULT_BOARD_SCENE);
  const [boardInitialData, setBoardInitialData] = useState(DEFAULT_BOARD_SCENE);
  const [boardKey, setBoardKey] = useState(() => `${questions[0]?.id || 'board'}-initial`);
  const [excalidrawApi, setExcalidrawApi] = useState(null);
  const [useHostedBoard, setUseHostedBoard] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(PRACTICE_SECTIONS[0].id);
  const [statusText, setStatusText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [localReview, setLocalReview] = useState(null);
  const [aiReviewText, setAiReviewText] = useState('');
  const [aiError, setAiError] = useState('');
  const [isAiReviewLoading, setIsAiReviewLoading] = useState(false);
  const [isHydratedDraft, setIsHydratedDraft] = useState(false);
  const [aiKey, setAiKey] = useState(() => (typeof window === 'undefined' ? '' : window.localStorage.getItem(AI_KEY_STORAGE) || ''));
  const [aiModel, setAiModel] = useState(() => (typeof window === 'undefined' ? DEFAULT_AI_MODEL : window.localStorage.getItem(AI_MODEL_STORAGE) || DEFAULT_AI_MODEL));

  useEffect(() => {
    if (!selectedQuestion) return;
    const saved = window.localStorage.getItem(`${DRAFT_PREFIX}${selectedQuestion.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSections(parsed.sections || createDefaultSections(selectedQuestion));
        const scene = parsed.boardScene?.elements ? parsed.boardScene : DEFAULT_BOARD_SCENE;
        setBoardScene(scene);
        setBoardInitialData(scene);
      } catch {
        setSections(createDefaultSections(selectedQuestion));
        setBoardScene(DEFAULT_BOARD_SCENE);
        setBoardInitialData(DEFAULT_BOARD_SCENE);
      }
    } else {
      setSections(createDefaultSections(selectedQuestion));
      setBoardScene(DEFAULT_BOARD_SCENE);
      setBoardInitialData(DEFAULT_BOARD_SCENE);
    }
    setBoardKey(`${selectedQuestion.id}-${Date.now()}`);
    setExcalidrawApi(null);
    setUseHostedBoard(false);
    setLocalReview(null);
    setAiReviewText('');
    setAiError('');
    setElapsedSeconds(0);
    setIsTimerRunning(false);
    setIsHydratedDraft(true);
  }, [selectedQuestion]);

  useEffect(() => {
    if (!isHydratedDraft || !selectedQuestion) return undefined;
    const timer = window.setTimeout(() => {
      try {
        const payload = JSON.stringify({ sections, boardScene });
        window.localStorage.setItem(`${DRAFT_PREFIX}${selectedQuestion.id}`, payload);
      } catch {
        setStatusText('Autosave skipped: browser storage limit reached.');
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [boardScene, isHydratedDraft, sections, selectedQuestion]);

  useEffect(() => {
    window.localStorage.setItem(AI_KEY_STORAGE, aiKey);
  }, [aiKey]);

  useEffect(() => {
    window.localStorage.setItem(AI_MODEL_STORAGE, aiModel);
  }, [aiModel]);

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  const handleBoardChange = (elements, appState) => {
    setBoardScene({
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        gridSize: appState.gridSize,
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
        zoom: appState.zoom,
        theme: appState.theme,
      },
    });
  };

  const updateSection = (id, nextValue) => {
    setSections((prev) => ({ ...prev, [id]: nextValue }));
  };

  const pasteIntoSection = async (id) => {
    try {
      const pastedText = await navigator.clipboard.readText();
      if (!pastedText.trim()) {
        setStatusText('Clipboard is empty.');
        return;
      }
      setSections((prev) => ({
        ...prev,
        [id]: prev[id] ? `${prev[id].trim()}\n${pastedText}` : pastedText,
      }));
      setStatusText(`Pasted clipboard into ${PRACTICE_SECTIONS.find((section) => section.id === id)?.title || 'section'}.`);
    } catch {
      setStatusText('Clipboard read failed. Browser permission may be blocked.');
    }
  };

  const copyDraftToClipboard = async () => {
    try {
      const fullDraft = buildDraftDocument(sections);
      await navigator.clipboard.writeText(fullDraft);
      setStatusText('Draft copied to clipboard.');
    } catch {
      setStatusText('Clipboard write failed. Check browser permission.');
    }
  };

  const clearBoard = () => {
    if (useHostedBoard) {
      setStatusText('Hosted Excalidraw board cannot be cleared from this app.');
      return;
    }
    if (excalidrawApi) {
      excalidrawApi.updateScene({
        elements: [],
        appState: {
          viewBackgroundColor: '#ffffff',
        },
      });
    }
    setBoardScene(DEFAULT_BOARD_SCENE);
    setStatusText('Architecture board cleared.');
  };

  const boardInitialScene = useMemo(
    () => ({
      ...boardInitialData,
      appState: {
        viewBackgroundColor: '#ffffff',
        ...boardInitialData.appState,
      },
    }),
    [boardInitialData],
  );

  const boardUiOptions = useMemo(
    () => ({
      canvasActions: {
        saveAsImage: true,
        export: true,
        loadScene: false,
        saveToActiveFile: false,
      },
    }),
    [],
  );

  const runLocalReviewNow = () => {
    if (!selectedQuestion) return;
    setLocalReview(runLocalReview(selectedQuestion, sections));
    setStatusText('Local review completed.');
  };

  const runAiReviewNow = async () => {
    if (!selectedQuestion) return;
    if (!aiKey.trim()) {
      setAiError('Add an OpenRouter API key to run AI review.');
      return;
    }

    setAiError('');
    setIsAiReviewLoading(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${aiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'System Design Real-Time Practice',
        },
        body: JSON.stringify({
          model: aiModel.trim() || DEFAULT_AI_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You are an interview reviewer. Review system design answers. Provide: (1) strengths, (2) risks/gaps, (3) top 5 improvements, (4) missing edge cases.',
            },
            {
              role: 'user',
              content: [
                `Prompt: ${selectedQuestion.title}`,
                `Summary: ${selectedQuestion.summary}`,
                `Requirements:\n${selectedQuestion.requirements.map((req) => `- ${req}`).join('\n')}`,
                `Candidate Draft:\n${buildDraftDocument(sections)}`,
              ].join('\n\n'),
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message || 'AI review request failed.';
        throw new Error(message);
      }
      const feedback = data?.choices?.[0]?.message?.content || 'No feedback returned by the model.';
      setAiReviewText(feedback);
      setStatusText('AI review completed.');
    } catch (error) {
      setAiError(error.message || 'AI review failed.');
    } finally {
      setIsAiReviewLoading(false);
    }
  };

  if (!selectedQuestion) {
    return (
      <div className="container page-shell">
        <h2 className="page-title" style={{ fontSize: '2rem' }}>No practice questions found</h2>
      </div>
    );
  }

  return (
    <div className="container page-shell studio-page">
      <div className="studio-doc-layout">
        <section className="studio-doc-main">
          <section className="panel studio-doc-toolbar">
            <div className="studio-toolbar-row">
              <div className="studio-toolbar-field">
                <label htmlFor="live-question" className="studio-label">Design Prompt</label>
                <select
                  id="live-question"
                  className="studio-select"
                  value={selectedQuestion.id}
                  onChange={(event) => setSelectedQuestionId(event.target.value)}
                >
                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.title}
                    </option>
                  ))}
                </select>
              </div>
              <Link to={`/practice/${selectedQuestion.id}`} className="section-link">
                Open reference solution
              </Link>
            </div>

            <div className="studio-toolbar-row">
              <div className="studio-timer">
                <Clock size={15} />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>
              <div className="studio-timer-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsTimerRunning((running) => !running)}>
                  {isTimerRunning ? <Pause size={15} /> : <Play size={15} />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setElapsedSeconds(0);
                    setIsTimerRunning(false);
                  }}
                >
                  <RotateCcw size={15} />
                  Reset
                </button>
              </div>
              <div className="studio-main-actions">
                <button type="button" className="btn-secondary" onClick={() => pasteIntoSection(activeSectionId)}>
                  Paste to Active Section
                </button>
                <button type="button" className="btn-secondary" onClick={copyDraftToClipboard}>
                  <Copy size={15} />
                  Copy Draft
                </button>
                <button type="button" className="btn-primary" onClick={runLocalReviewNow}>
                  <Sparkles size={15} />
                  Local Review
                </button>
              </div>
            </div>
            {statusText ? <p className="studio-status">{statusText}</p> : null}
          </section>

          <section className="panel studio-doc-surface">
            <header className="studio-doc-header">
              <h1>{selectedQuestion.title}</h1>
              <span className={`badge ${selectedQuestion.difficulty.toLowerCase().includes('hard') ? 'hard' : selectedQuestion.difficulty.toLowerCase().includes('easy') ? 'easy' : 'intermediate'}`}>
                {selectedQuestion.difficulty}
              </span>
            </header>
            <p className="studio-doc-subtitle">{selectedQuestion.summary}</p>

            <div className="studio-doc-sections">
              {PRACTICE_SECTIONS.map((section) => (
                <article className="studio-doc-section" key={section.id}>
                  <div className="studio-doc-section-head">
                    <h3>{section.title}</h3>
                    <div className="studio-section-actions">
                      <button type="button" className="section-link" onClick={() => pasteIntoSection(section.id)}>
                        Paste
                      </button>
                      <button type="button" className="section-link" onClick={() => updateSection(section.id, '')}>
                        Clear
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={sections[section.id] || ''}
                    onFocus={() => setActiveSectionId(section.id)}
                    onChange={(event) => updateSection(section.id, event.target.value)}
                    placeholder={section.hint}
                    className="studio-doc-textarea"
                  />
                </article>
              ))}
            </div>
          </section>

          <section className="panel studio-diagram-panel">
            <div className="studio-heading-row">
              <h3 className="panel-heading">Architecture Board</h3>
              <div className="studio-board-actions">
                <button type="button" className="btn-secondary" onClick={clearBoard}>
                  <Trash2 size={14} />
                  Clear Board
                </button>
              </div>
            </div>

            <div className="studio-excalidraw-wrap">
              {useHostedBoard ? (
                <div className="studio-hosted-wrap">
                  <div className="studio-hosted-toolbar">
                    <span>Local Excalidraw is unavailable in this browser session.</span>
                    <a href="https://excalidraw.com/" target="_blank" rel="noreferrer" className="section-link">
                      Open hosted Excalidraw
                    </a>
                  </div>
                  <iframe
                    className="studio-excalidraw-iframe"
                    src="https://excalidraw.com/"
                    title="Hosted Excalidraw"
                  />
                </div>
              ) : (
                <DiagramErrorBoundary
                  onError={() => {
                    setUseHostedBoard(true);
                    setStatusText('Local Excalidraw failed. Switched to hosted Excalidraw.');
                  }}
                  fallback={<div className="studio-board-loading">Switching to hosted Excalidraw...</div>}
                >
                  <Suspense fallback={<div className="studio-board-loading">Loading Excalidraw canvas...</div>}>
                    <ExcalidrawCanvas
                      key={boardKey}
                      initialData={boardInitialScene}
                      onChange={handleBoardChange}
                      excalidrawAPI={setExcalidrawApi}
                      UIOptions={boardUiOptions}
                      viewModeEnabled={false}
                      zenModeEnabled={false}
                      gridModeEnabled={false}
                    />
                  </Suspense>
                </DiagramErrorBoundary>
              )}
            </div>
          </section>
        </section>

        <aside className="studio-side-rail">
          <section className="panel studio-side-panel">
            <div className="studio-heading-row">
              <h3 className="panel-heading">Prompt Specs</h3>
              <span className={`badge ${selectedQuestion.difficulty.toLowerCase().includes('hard') ? 'hard' : selectedQuestion.difficulty.toLowerCase().includes('easy') ? 'easy' : 'intermediate'}`}>
                {selectedQuestion.difficulty}
              </span>
            </div>
            <ul className="requirements-list">
              {selectedQuestion.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </section>

          <section className="panel studio-side-panel studio-review-panel">
            <h3 className="panel-heading">Review & Improvements</h3>
            {localReview ? (
              <div className="studio-review-block">
                <p><strong>Score:</strong> {localReview.score}/100</p>
                <p><strong>Word count:</strong> {localReview.wordCount}</p>
                <p><strong>Requirements covered:</strong> {localReview.requirementCoverage}</p>
                <p><strong>Strengths:</strong></p>
                <ul>
                  {localReview.strengths.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
                <p><strong>Areas to improve:</strong></p>
                <ul>
                  {localReview.improvements.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            ) : (
              <p className="card-text">Run local review to get instant feedback before AI review.</p>
            )}

            <div className="studio-ai-controls">
              <label htmlFor="ai-key" className="studio-label">OpenRouter API Key (optional)</label>
              <input
                id="ai-key"
                type="password"
                className="studio-input"
                placeholder="sk-or-v1-..."
                value={aiKey}
                onChange={(event) => setAiKey(event.target.value)}
              />
              <label htmlFor="ai-model" className="studio-label">Model</label>
              <input
                id="ai-model"
                type="text"
                className="studio-input"
                value={aiModel}
                onChange={(event) => setAiModel(event.target.value)}
              />
              <button type="button" className="btn-secondary" onClick={runAiReviewNow} disabled={isAiReviewLoading}>
                <Sparkles size={15} />
                {isAiReviewLoading ? 'Running AI Review...' : 'Run AI Review'}
              </button>
              <p className="studio-note">
                Free model tip: try <code>google/gemini-2.0-flash-thinking-exp:free</code> if available on your OpenRouter account.
              </p>
              {aiError ? <p className="studio-error">{aiError}</p> : null}
              {aiReviewText ? (
                <div className="studio-ai-output">
                  <h4>AI Feedback</h4>
                  <pre>{aiReviewText}</pre>
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      <Link to="/practice" className="back-link" style={{ marginTop: '1.5rem' }}>
        <ArrowLeft size={17} />
        Back to practice prompts
      </Link>
    </div>
  );
};

export default RealtimePractice;
