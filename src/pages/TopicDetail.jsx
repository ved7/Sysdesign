import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import LoadBalancerAnim from '../components/visualizations/LoadBalancerAnim';
import ReadabilityProgressBar from '../components/ui/ReadabilityProgressBar';

const getBadgeClass = (difficulty) => {
  const key = difficulty.toLowerCase();
  if (key.includes('basic')) return 'badge basic';
  if (key.includes('intermediate')) return 'badge intermediate';
  return 'badge advanced';
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

const TopicDetail = () => {
  const { topicId } = useParams();

  const topic = curriculum
    .flatMap((module) => module.topics)
    .find((entry) => entry.id === topicId);

  const enrichedContent = useMemo(() => (topic ? addIdsToHeadings(topic.content) : ''), [topic]);
  const headings = useMemo(() => extractHeadings(enrichedContent), [enrichedContent]);
  const readingTime = useMemo(() => (topic ? getReadingTime(topic.content) : 0), [topic]);

  if (!topic) {
    return (
      <div className="container page-shell">
        <h2 className="page-title" style={{ fontSize: '2rem' }}>Topic not found</h2>
        <Link to="/topics" className="section-link">
          Back to topics
        </Link>
      </div>
    );
  }

  return (
    <article className="readable-page">
      <ReadabilityProgressBar />

      <div className="container page-shell narrow">
        <Link to="/topics" className="back-link">
          <ArrowLeft size={17} />
          Back to Curriculum
        </Link>

        <motion.div
          className="readable-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <header className="readable-header">
            <span className={getBadgeClass(topic.difficulty)}>{topic.difficulty} topic</span>
            <h1 className="detail-title">{topic.title}</h1>
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
              <div className="panel visual-wrap">
                {topic.id === 'load-balancing' ? (
                  <LoadBalancerAnim />
                ) : (
                  <div className="visual-placeholder">Interactive visualization coming soon.</div>
                )}
              </div>

              <div className="content-body" dangerouslySetInnerHTML={{ __html: enrichedContent }} />
            </div>
          </div>
        </motion.div>
      </div>
    </article>
  );
};

export default TopicDetail;
