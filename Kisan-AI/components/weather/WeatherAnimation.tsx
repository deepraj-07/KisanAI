"use client";

import React, { useMemo } from "react";

type WeatherAnimationProps = {
  weatherCode: number;
  size?: number;
};

function classify(code: number): "clear" | "partly" | "fog" | "drizzle" | "rain" | "snow" | "thunder" {
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "partly";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 95 && code <= 99) return "thunder";
  return "partly";
}

export default function WeatherAnimation({ weatherCode, size = 120 }: WeatherAnimationProps) {
  const mode = useMemo(() => classify(weatherCode), [weatherCode]);

  return (
    <div className="weather-anim" style={{ width: size, height: size }}>
      {(mode === "clear" || mode === "partly") && (
        <div className="sun-wrap">
          <div className="sun-core" />
          <div className="sun-rays" />
        </div>
      )}

      {mode === "partly" && <div className="cloud cloud-main" />}

      {mode === "fog" && (
        <div className="fog-wrap">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="fog-line" style={{ animationDelay: `${i * 0.25}s` }} />
          ))}
        </div>
      )}

      {mode === "drizzle" && (
        <div className="rain-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="drizzle-dot" style={{ left: `${10 + i * 10}%`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}

      {(mode === "rain" || mode === "thunder") && (
        <div className="rain-wrap">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="rain-line" style={{ left: `${12 + i * 11}%`, animationDelay: `${i * 0.2}s` }} />
          ))}
          <div className="splash" />
        </div>
      )}

      {mode === "snow" && (
        <div className="snow-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="snow-dot" style={{ left: `${10 + i * 10}%`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      )}

      {mode === "thunder" && <div className="lightning" />}

      <style jsx>{`
        .weather-anim {
          position: relative;
          margin: 0 auto;
          border-radius: 16px;
          background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0));
          overflow: hidden;
        }
        .sun-wrap {
          position: absolute;
          top: 18%;
          left: 24%;
          width: 56%;
          height: 56%;
        }
        .sun-core {
          position: absolute;
          inset: 22%;
          background: #f4c430;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(244, 196, 48, 0.6);
        }
        .sun-rays {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px dashed rgba(244, 196, 48, 0.7);
          animation: sunRotate 10s linear infinite;
        }
        .cloud {
          position: absolute;
          width: 56%;
          height: 26%;
          border-radius: 999px;
          background: #b8a99a;
          box-shadow: 0 0 14px rgba(184, 169, 154, 0.2);
          animation: cloudMove 5s ease-in-out infinite;
        }
        .cloud-main {
          left: 28%;
          top: 48%;
        }
        .fog-wrap {
          position: absolute;
          inset: 20% 10%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
        .fog-line {
          display: block;
          height: 4px;
          border-radius: 8px;
          background: rgba(184, 169, 154, 0.8);
          animation: fogPulse 2s ease-in-out infinite;
        }
        .rain-wrap,
        .snow-wrap {
          position: absolute;
          inset: 14% 10%;
        }
        .drizzle-dot {
          position: absolute;
          top: -8px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #93c5fd;
          animation: drizzleFall 1.8s linear infinite;
        }
        .rain-line {
          position: absolute;
          top: -14px;
          width: 2px;
          height: 16px;
          border-radius: 2px;
          background: #60a5fa;
          animation: rainFall 1s linear infinite;
        }
        .splash {
          position: absolute;
          bottom: 10%;
          left: 20%;
          width: 60%;
          height: 2px;
          background: rgba(96, 165, 250, 0.7);
          border-radius: 99px;
          animation: splashBlink 1s linear infinite;
        }
        .snow-dot {
          position: absolute;
          top: -10px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #e2e8f0;
          animation: snowFall 3.2s ease-in-out infinite;
        }
        .lightning {
          position: absolute;
          top: 24%;
          left: 48%;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 6px solid transparent;
          border-top: 24px solid #facc15;
          transform: rotate(16deg);
          filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));
          animation: lightningFlash 1.2s steps(1) infinite;
        }
        @keyframes sunRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rainFall {
          from { transform: translateY(-20px); opacity: 1; }
          to { transform: translateY(105px); opacity: 0; }
        }
        @keyframes drizzleFall {
          from { transform: translate(-6px, -10px); opacity: 1; }
          to { transform: translate(16px, 100px); opacity: 0; }
        }
        @keyframes cloudMove {
          0% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(-10px); }
        }
        @keyframes fogPulse {
          0%, 100% { opacity: 0.3; transform: translateX(0); }
          50% { opacity: 0.9; transform: translateX(8px); }
        }
        @keyframes snowFall {
          0% { transform: translate(0, -10px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(8px, 105px); opacity: 0; }
        }
        @keyframes lightningFlash {
          0%, 85%, 100% { opacity: 0; }
          86%, 90% { opacity: 1; }
        }
        @keyframes splashBlink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
