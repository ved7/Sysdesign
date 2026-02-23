import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { questions } from '../data/questions';
import ReadabilityProgressBar from '../components/ui/ReadabilityProgressBar';

const getBadgeClass = (difficulty) => {
  const key = difficulty.toLowerCase();
  if (key.includes('easy')) return 'badge easy';
  if (key.includes('hard')) return 'badge hard';
  return 'badge intermediate';
};

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

const extractHeadings = (html) => {
  if (typeof document === 'undefined') return [];
  const div = document.createElement('div');
  div.innerHTML = html;
  return Array.from(div.querySelectorAll('h3')).map((h) => ({
    id: slugify(h.textContent),
    text: h.textContent,
  }));
};

const addIdsToHeadings = (html) => {
  return html.replace(/<h3>([^<]+)<\/h3>/g, (_, text) => {
    const id = slugify(text);
    return `<h3 id="${id}" class="content-heading">${text}</h3>`;
  });
};

const getReadingTime = (html) => {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const QuestionDetail = () => {
  const { questionId } = useParams();
  const question = questions.find((entry) => entry.id === questionId);

  const enrichedSolution = useMemo(() => (question ? addIdsToHeadings(question.solution) : ''), [question]);
  const headings = useMemo(() => extractHeadings(enrichedSolution), [enrichedSolution]);
  const readingTime = useMemo(() => {
    if (!question) return 0;
    const reqText = question.requirements.join(' ');
    const fullText = reqText + enrichedSolution;
    return getReadingTime(fullText);
  }, [question, enrichedSolution]);

  if (!question) {
    return (
      <div className="container page-shell">
        <h2 className="page-title" style={{ fontSize: '2rem' }}>Question not found</h2>
        <Link to="/practice" className="section-link">
          Back to practice
        </Link>
      </div>
    );
  }

  return (
    <article className="readable-page">
      <ReadabilityProgressBar />

      <div className="container page-shell narrow">
        <Link to="/practice" className="back-link">
          <ArrowLeft size={17} />
          Back to Questions
        </Link>

        <motion.div
          className="readable-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <header className="readable-header">
            <span className={getBadgeClass(question.difficulty)}>{question.difficulty}</span>
            <h1 className="detail-title">{question.title}</h1>
            <div className="readable-meta">
              <span className="meta-item">
                <Clock size={14} />
                {readingTime} min read
              </span>
              {headings.length > 0 && (
                <span className="meta-item">
                  <BookOpen size={14} />
                  {headings.length} sections
                </span>
              )}
            </div>
          </header>

          <div className="readable-body">
            {headings.length > 1 && (
              <aside className="readable-toc">
                <h4 className="toc-title">On this page</h4>
                <nav className="toc-nav">
                  {headings.map((h) => (
                    <a key={h.id} href={`#${h.id}`} className="toc-link">
                      {h.text}
                    </a>
                  ))}
                </nav>
              </aside>
            )}

            <div className="readable-content">
              <div className="panel requirements-panel">
                <h3 className="panel-heading">Requirements</h3>
                <ul className="requirements-list">
                  {question.requirements.map((req, index) => (
                    <li key={index}>
                      <CheckCircle size={17} color="var(--success)" style={{ minWidth: '17px', marginTop: '3px' }} />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="content-body" dangerouslySetInnerHTML={{ __html: enrichedSolution }} />
            </div>
          </div>
        </motion.div>
      </div>
    </article>
  );
};

export default QuestionDetail;
