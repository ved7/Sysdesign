import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock } from 'lucide-react';
import { getBasicById, getAllBasicsCards } from '../data/basics';
import ReadabilityProgressBar from '../components/ui/ReadabilityProgressBar';

const BasicDetail = () => {
  const { cardId } = useParams();
  const card = getBasicById(cardId);
  const allCards = useMemo(() => getAllBasicsCards(), []);
  const cardIndex = allCards.findIndex((c) => c.id === cardId);
  const prevCard = cardIndex > 0 ? allCards[cardIndex - 1] : null;
  const nextCard = cardIndex >= 0 && cardIndex < allCards.length - 1 ? allCards[cardIndex + 1] : null;

  const readingTime = useMemo(() => {
    if (!card?.content) return 1;
    const text = card.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [card]);

  if (!card) {
    return (
      <div className="container page-shell">
        <h2 className="page-title" style={{ fontSize: '2rem' }}>Card not found</h2>
        <Link to="/basics" className="section-link">
          Back to Basics
        </Link>
      </div>
    );
  }

  return (
    <article className="readable-page">
      <ReadabilityProgressBar />

      <div className="container page-shell narrow">
        <Link to="/basics" className="back-link">
          <ArrowLeft size={17} />
          Back to Basics
        </Link>

        <motion.div
          className="readable-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <header className="readable-header">
            <span className="badge basic">{card.sectionTitle}</span>
            <h1 className="detail-title">{card.title}</h1>
            <div className="readable-meta">
              <span className="meta-item">
                <Clock size={14} />
                {readingTime} min read
              </span>
            </div>
          </header>

          <div className="readable-body">
            <div className="readable-content readable-content-single">
              <div className="content-body" dangerouslySetInnerHTML={{ __html: card.content }} />
            </div>
          </div>

          <nav className="basics-nav">
            {prevCard ? (
              <Link to={`/basics/${prevCard.id}`} className="basics-nav-link basics-nav-prev">
                <span className="basics-nav-label">Previous</span>
                <span className="basics-nav-title">{prevCard.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {nextCard ? (
              <Link to={`/basics/${nextCard.id}`} className="basics-nav-link basics-nav-next">
                <span className="basics-nav-label">Next</span>
                <span className="basics-nav-title">{nextCard.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </motion.div>
      </div>
    </article>
  );
};

export default BasicDetail;
