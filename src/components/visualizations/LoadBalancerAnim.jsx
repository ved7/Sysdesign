import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, User } from 'lucide-react';

const LoadBalancerAnim = () => {
  const [requests, setRequests] = useState([]);
  const [servers, setServers] = useState([0, 0, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const targetServer = Math.floor(Math.random() * 3);

      setRequests((prev) => [...prev, { id, targetServer }]);
      setServers((prev) => {
        const next = [...prev];
        next[targetServer] += 1;
        return next;
      });

      setTimeout(() => {
        setRequests((prev) => prev.filter((request) => request.id !== id));
        setServers((prev) => {
          const next = [...prev];
          if (next[targetServer] > 0) next[targetServer] -= 1;
          return next;
        });
      }, 2000);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lb-scene">
      <div className="lb-node">LB</div>

      <div className="lb-client">
        <User size={30} color="var(--ink-muted)" />
        <span>Client</span>
      </div>

      <div className="lb-servers">
        {servers.map((count, index) => (
          <div key={index} className="lb-server-row">
            <Server size={22} color={count > 0 ? 'var(--success)' : 'var(--ink-muted)'} />
            <span>Server {index + 1}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {requests.map((request) => (
          <motion.div
            key={request.id}
            initial={{ x: 42, y: 150, opacity: 0 }}
            animate={{
              x: [42, 250, 462],
              y: [150, 150, 60 + request.targetServer * 62],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.5, ease: 'linear' }}
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            <div className="lb-request" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LoadBalancerAnim;
