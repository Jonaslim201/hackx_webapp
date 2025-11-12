// src/components/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ForenStickSection } from './ForenStickSection';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/editor');
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#050716',
        overflowX: 'hidden',
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'radial-gradient(circle at 50% 0%, #243B8F 0%, #050716 45%, #050716 100%)',
          position: 'relative',
        }}
      >
        {/* Background glows */}
        

        {/* Background glows - CENTERED */}
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(43, 127, 255, 0.4) 0%, rgba(43, 127, 255, 0.1) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }} />
          <div style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(152, 16, 250, 0.35) 0%, rgba(152, 16, 250, 0.15) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }} />
        </div>

        {/* Main centered column */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 16px',
              marginBottom: '32px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#22D3EE' }} />
            <span style={{ fontSize: '14px', color: '#D1D5DC' }}>
              Next-Gen Crime Scene Documentation
            </span>
          </div>

          {/* Hero heading */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 400,
              lineHeight: '90px',
              color: 'white',
              margin: '0 0 8px 0',
            }}
          >
            Map Crime Scenes with
          </h1>

          <h1
            style={{
              fontSize: '72px',
              fontWeight: 400,
              lineHeight: '90px',
              margin: '0 0 24px 0',
              background: 'linear-gradient(90deg, #00D3F2 0%, #2B7FFF 40%, #B54CFF 75%, #F15BFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Precision &amp; Speed
          </h1>

          {/* Description */}
          <p
            style={{
              maxWidth: '762px',
              fontSize: '20px',
              lineHeight: '28px',
              color: '#D1D5DC',
              margin: '0 0 40px 0',
            }}
          >
            Portable LiDAR-based evidence mapping system that automatically generates
            accurate 2D floor-plan sketches with marked evidence points. Scan, process,
            and document crime scenes in minutes.
          </p>

          {/* CTA buttons */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '64px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Try It Out */}
            <button
              onClick={handleGetStarted}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 500,
                background: 'white',
                color: '#101828',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <span>Try It Out</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3.33337 8H12.6667"
                  stroke="#101828"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 3.33331L12.6667 7.99998L8 12.6666"
                  stroke="#101828"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Watch Demo */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 500,
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M3.33337 3.33336C3.3333 3.09876 3.39514 2.86829 3.51263 2.66522C3.63012 2.46216 3.79911 2.29369 4.00254 2.17683C4.20597 2.05996 4.43663 1.99885 4.67123 1.99964C4.90584 2.00044 5.13608 2.06312 5.33871 2.18136L13.3367 6.8467C13.5385 6.96382 13.7061 7.13186 13.8227 7.33403C13.9392 7.5362 14.0007 7.76543 14.0009 7.99879C14.0011 8.23215 13.94 8.46148 13.8238 8.66385C13.7076 8.86623 13.5403 9.03456 13.3387 9.15203L5.33871 13.8187C5.13608 13.9369 4.90584 13.9996 4.67123 14.0004C4.43663 14.0012 4.20597 13.9401 4.00254 13.8232C3.79911 13.7064 3.63012 13.5379 3.51263 13.3348C3.39514 13.1318 3.3333 12.9013 3.33337 12.6667V3.33336Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Stats: THREE CARDS IN A ROW */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              width: '100%',
              maxWidth: '960px',
            }}
          >
            {[
              { value: '1.5cm', label: 'Accuracy Rate', from: '#00D3F2', to: '#155DFC' },
              { value: '10x', label: 'Faster Processing', from: '#C27AFF', to: '#E60076' },
              { value: '>10min', label: 'Average Scan Time', from: '#51A2FF', to: '#0092B8' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '32px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 400,
                    marginBottom: '12px',
                    background: `linear-gradient(90deg, ${stat.from} 0%, ${stat.to} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <p style={{ fontSize: '16px', color: '#99A1AF', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Section */}
      <ForenStickSection />
    </div>
  );
};

export default LandingPage;