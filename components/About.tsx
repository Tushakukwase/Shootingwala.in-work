import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../app/about/about.css';

// Inline SVG Icons
const CameraIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 4H12C7.58172 4 4 7.58172 4 12V36C4 40.4183 7.58172 44 12 44H36C40.4183 44 44 40.4183 44 36V12C44 7.58172 40.4183 4 36 4H24Z" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 24L18 34L40 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SparkIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4V44M4 24H44M10 10L38 38M38 10L10 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 40C4 31.1634 12.0294 24 24 24C35.9706 24 44 31.1634 44 40" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 40L12 28L24 36L44 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 42L4 26C2 23 4 12 12 12C16 12 20 14 24 18C28 14 32 12 36 12C44 12 46 23 44 26L24 42Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
  </svg>
);

const ShootingWalaAbout = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const scaleInOnHover = {
    whileHover: { scale: 1.05 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="hero-title"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            About ShootingWala
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            India's most convenient platform to book professional photographers.
          </motion.p>
        </motion.div>

        {/* Floating SVG Illustration */}
        <motion.div
          className="hero-illustration"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke="#0066FF" strokeWidth="2" opacity="0.3"/>
            <circle cx="60" cy="60" r="45" stroke="#0066FF" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="60" cy="60" r="8" fill="#0066FF"/>
            <path d="M60 20L65 50L95 55L65 60L60 90L55 60L25 55L55 50Z" fill="#0066FF" opacity="0.2"/>
          </svg>
        </motion.div>
      </section>

      {/* Company Description */}
      <section className="description-section">
        <motion.div
          className="description-content"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 variants={fadeInUp} className="section-title">
            Who We Are
          </motion.h2>
          <motion.p variants={fadeInUp} className="description-text">
            ShootingWala is India's trusted platform to book professional photographers and videographers quickly and affordably. From weddings and events to product and portfolio shoots, we connect users with verified artists.
          </motion.p>
          <motion.p variants={fadeInUp} className="description-text">
            We provide fast booking, transparent pricing, and complete support throughout your creative journey. Our mission is to make professional photography accessible to everyone.
          </motion.p>
          <motion.p variants={fadeInUp} className="description-text">
            With a network of skilled photographers and videographers, we ensure quality, reliability, and exceptional service on every project.
          </motion.p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why Choose ShootingWala
        </motion.h2>
        <motion.div
          className="features-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Feature 1 */}
          <motion.div
            className="feature-card"
            variants={fadeInUp}
            {...scaleInOnHover}
            onMouseEnter={() => setHoveredFeature(0)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className={`feature-icon ${hoveredFeature === 0 ? 'active' : ''}`}>
              <CheckIcon />
            </div>
            <h3>Verified Professionals</h3>
            <p>All photographers are verified and rated by our community for quality assurance.</p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="feature-card"
            variants={fadeInUp}
            {...scaleInOnHover}
            onMouseEnter={() => setHoveredFeature(1)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className={`feature-icon ${hoveredFeature === 1 ? 'active' : ''}`}>
              <SparkIcon />
            </div>
            <h3>Instant Booking</h3>
            <p>Book your photographer in minutes with real-time availability and instant confirmation.</p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="feature-card"
            variants={fadeInUp}
            {...scaleInOnHover}
            onMouseEnter={() => setHoveredFeature(2)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className={`feature-icon ${hoveredFeature === 2 ? 'active' : ''}`}>
              <TrendIcon />
            </div>
            <h3>Transparent Pricing</h3>
            <p>No hidden charges. Know exactly what you're paying for before confirming your booking.</p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            className="feature-card"
            variants={fadeInUp}
            {...scaleInOnHover}
            onMouseEnter={() => setHoveredFeature(3)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className={`feature-icon ${hoveredFeature === 3 ? 'active' : ''}`}>
              <HeartIcon />
            </div>
            <h3>24/7 Support</h3>
            <p>Our dedicated support team is always available to help you with any questions or issues.</p>
          </motion.div>

          {/* Feature 5 */}
          <motion.div
            className="feature-card"
            variants={fadeInUp}
            {...scaleInOnHover}
            onMouseEnter={() => setHoveredFeature(4)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className={`feature-icon ${hoveredFeature === 4 ? 'active' : ''}`}>
              <CameraIcon />
            </div>
            <h3>All Types of Shoots</h3>
            <p>From weddings to events, products to portfolios—we've got photographers for everything.</p>
          </motion.div>

          {/* Feature 6 */}
          <motion.div
            className="feature-card"
            variants={fadeInUp}
            {...scaleInOnHover}
            onMouseEnter={() => setHoveredFeature(5)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className={`feature-icon ${hoveredFeature === 5 ? 'active' : ''}`}>
              <UserIcon />
            </div>
            <h3>Community Built</h3>
            <p>Join thousands of satisfied users who have found their perfect photographer on ShootingWala.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Our Process Section */}
      <section className="process-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How We Work
        </motion.h2>
        <motion.div
          className="process-container"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {[
            { step: 'Book', desc: 'Browse and select from verified photographers' },
            { step: 'Confirm', desc: 'Confirm details and payment' },
            { step: 'Shoot', desc: 'Photographer arrives and captures your moments' },
            { step: 'Deliver', desc: 'Receive edited photos within agreed timeframe' },
          ].map((item, index) => (
            <motion.div key={index} className="process-step" variants={fadeInUp}>
              <div className="step-number">{index + 1}</div>
              <h3>{item.step}</h3>
              <p>{item.desc}</p>
              {index < 3 && <div className="step-arrow">→</div>}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <motion.div
          className="contact-content"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 variants={fadeInUp} className="section-title">
            Get in Touch
          </motion.h2>
          <motion.p variants={fadeInUp} className="contact-intro">
            Have questions? We'd love to hear from you. Contact us anytime.
          </motion.p>
          <motion.div className="contact-details" variants={staggerContainer}>
            <motion.a
              href="tel:+912269645750"
              className="contact-link"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <span className="contact-icon">📞</span>
              <div>
                <div className="contact-label">Phone</div>
                <div className="contact-value">+91 2269645750</div>
              </div>
            </motion.a>
            <motion.a
              href="mailto:mail@shootingwala.in"
              className="contact-link"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <span className="contact-icon">✉️</span>
              <div>
                <div className="contact-label">Email</div>
                <div className="contact-value">mail@shootingwala.in</div>
              </div>
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default ShootingWalaAbout;