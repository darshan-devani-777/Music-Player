import React from "react";

// LOADER
const Loader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
    }}
  >
    <div className="dot-ring">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className={`dot d${i + 1}`} />
      ))}
    </div>

    <style>
      {`
        .dot-ring {
          position: relative;
          width: 40px;
          height: 40px;
        }
        .dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          background: #9ca3af; /* gray */
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.3;
          animation: pulse 1.2s linear infinite;
        }

        /* position 12 dots around circle */
        .d1  { top: 5%; left: 50%; animation-delay: 0s; }
        .d2  { top: 15%; left: 75%; animation-delay: 0.1s; }
        .d3  { top: 35%; left: 90%; animation-delay: 0.2s; }
        .d4  { top: 60%; left: 90%; animation-delay: 0.3s; }
        .d5  { top: 80%; left: 75%; animation-delay: 0.4s; }
        .d6  { top: 90%; left: 50%; animation-delay: 0.5s; }
        .d7  { top: 80%; left: 25%; animation-delay: 0.6s; }
        .d8  { top: 60%; left: 10%; animation-delay: 0.7s; }
        .d9  { top: 35%; left: 10%; animation-delay: 0.8s; }
        .d10 { top: 15%; left: 25%; animation-delay: 0.9s; }
        .d11 { top: 5%; left: 50%; animation-delay: 1s; }
        .d12 { top: 5%; left: 50%; animation-delay: 1.1s; }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}
    </style>
  </div>
);

export default Loader;
