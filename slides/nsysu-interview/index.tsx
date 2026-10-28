import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  type SlideTransition,
  Step,
  Steps,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import { animate, MotionConfig, motion, useAnimationFrame } from 'motion/react';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import awardCrossStrait from './assets/award-crossstrait.jpg';
import awardNational from './assets/award-national.jpg';
import clubLearn from './assets/club-learn.jpg';
import clubTeam from './assets/club-team.jpg';
import clubTogether from './assets/club-together.jpg';
import headshot from './assets/headshot.jpg';
import plusrepPoster from './assets/plusrep-poster.jpg';
import appPoster from './assets/zaoxingzhe-poster.jpg';

const appVideo = new URL('./assets/zaoxingzhe.mp4', import.meta.url).href;
const plusrepVideo = new URL('./assets/plusrep.mp4', import.meta.url).href;

// ─── Design tokens ───────────────────────────────────────────────────────────

export const design: DesignSystem = {
  palette: { bg: '#020c16', text: '#e7f5f9', accent: '#5fe3e0' },
  fonts: {
    display: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif',
    body: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif',
  },
  typeScale: { hero: 176, body: 32 },
  radius: 16,
};

const MONO = '"JetBrains Mono", "SF Mono", Menlo, Consolas, "Noto Sans TC", monospace';
const amber = '#ffc56e';
const muted = '#93b3c4';
const dim = 'rgba(147, 179, 196, 0.62)';
const line = 'rgba(95, 227, 224, 0.28)';
const panel = 'rgba(5, 28, 44, 0.62)';
const PAD = 120;
const EASE = [0.22, 1, 0.36, 1] as const;
// The cover's name and photo link here (also carried into the PDF/PPTX exports).
const SITE_URL = 'https://anson1eechun.github.io/nsysu-interview/s/nsysu-interview/';

// ─── Fonts + ambient keyframes (injected once per document) ─────────────────

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Noto+Sans+TC:wght@400;500;700;900&display=swap';
const FONT_LINK_ID = 'osd-webfont-nsysu-interview';
const STYLE_ID = 'osd-styles-nsysu-interview';
const css = `
@keyframes dv-sway { 0%,100% { transform: translateX(0) rotate(var(--r)); } 50% { transform: translateX(46px) rotate(calc(var(--r) + 4deg)); } }
@keyframes dv-float { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: var(--o); } 88% { opacity: var(--o); } 100% { transform: translateY(var(--dy)); opacity: 0; } }
@keyframes dv-glow { 0%,100% { opacity: 0.15; transform: scale(0.8); } 50% { opacity: 0.9; transform: scale(1.15); } }
@keyframes dv-spin { to { transform: rotate(360deg); } }
@keyframes dv-wave { to { transform: translateX(-960px); } }
@keyframes dv-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
@keyframes dv-nudge { 0%,100% { transform: translateX(0); opacity: 0.4; } 50% { transform: translateX(14px); opacity: 1; } }
@keyframes dv-shimmer { 0% { background-position: 160% 0; } 100% { background-position: -60% 0; } }
@keyframes dv-hatch { to { background-position: 28px 0; } }
`;
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

// ─── Motion helpers ──────────────────────────────────────────────────────────
// Every entrance is gated on useIsActivePage(): thumbnails, the overview grid,
// and print render the settled final state; only the live page plays.

const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Entrances blur in, but must settle on no filter at all: a lingering
// `blur(0px)` makes Chrome's PDF export rasterise the whole subtree.
const unblur = (live: boolean) =>
  live ? { filter: 'blur(0px)', transitionEnd: { filter: 'none' } } : {};

const Rise = ({
  delay = 0,
  y = 28,
  style,
  children,
}: {
  delay?: number;
  y?: number;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const live = useIsActivePage();
  return (
    <motion.div
      style={style}
      initial={live ? { opacity: 0, y, filter: 'blur(8px)' } : false}
      animate={{ opacity: 1, y: 0, ...unblur(live) }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

const SplitText = ({
  text,
  delay = 0,
  stagger = 0.035,
}: {
  text: string;
  delay?: number;
  stagger?: number;
}) => {
  const live = useIsActivePage();
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={live ? { opacity: 0, y: '0.45em', filter: 'blur(10px)' } : false}
          animate={{ opacity: 1, y: 0, ...unblur(live) }}
          transition={{ duration: 0.7, delay: delay + i * stagger, ease: EASE }}
        >
          {ch}
        </motion.span>
      ))}
    </>
  );
};

const CountUp = ({
  to,
  from = 0,
  decimals = 0,
  delay = 0,
  duration = 1.6,
}: {
  to: number;
  from?: number;
  decimals?: number;
  delay?: number;
  duration?: number;
}) => {
  const live = useIsActivePage();
  const [v, setV] = useState(live ? from : to);
  useEffect(() => {
    if (!live) return;
    const controls = animate(from, to, { duration, delay, ease: EASE, onUpdate: setV });
    return () => controls.stop();
  }, [live, from, to, delay, duration]);
  return <>{v.toFixed(decimals)}</>;
};

// <Step> only toggles `data-osd-step` on its wrapper; this hook lets motion
// components inside a step play their entrance at the moment it is revealed.
const useStepShown = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  useLayoutEffect(() => {
    const host = ref.current?.closest('[data-osd-step]');
    if (!host) return;
    const read = () => setShown(host.getAttribute('data-osd-step') !== 'pending');
    read();
    const mo = new MutationObserver(read);
    mo.observe(host, { attributes: true, attributeFilter: ['data-osd-step'] });
    return () => mo.disconnect();
  }, []);
  return [ref, shown] as const;
};

// ─── Ocean backdrop + depth gauge (shared by every page) ─────────────────────

const Ocean = ({ depth }: { depth: number }) => {
  const live = useIsActivePage();
  const k = Math.sqrt(Math.min(depth / 500, 1));
  const top = `color-mix(in srgb, #10607f ${Math.round((1 - k) * 100)}%, #04182a)`;
  const bottom = `color-mix(in srgb, #06273c ${Math.round((1 - k) * 100)}%, var(--osd-bg))`;
  const rayOpacity = 0.05 + 0.3 * (1 - k);
  const bubbles = k < 0.6;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: `linear-gradient(180deg, ${top} 0%, ${bottom} 78%)`,
      }}
    >
      {[
        { left: 120, w: 170, r: 20 },
        { left: 470, w: 260, r: 14 },
        { left: 860, w: 150, r: 18 },
        { left: 1210, w: 230, r: 11 },
        { left: 1580, w: 180, r: 15 },
      ].map((ray, i) => (
        <div
          key={`ray-${i}`}
          style={
            {
              position: 'absolute',
              top: -220,
              left: ray.left,
              width: ray.w,
              height: 1300,
              transformOrigin: 'top center',
              '--r': `${ray.r}deg`,
              transform: `rotate(${ray.r}deg)`,
              // Soft edges come from one radial gradient — no filter: blur (costly on
              // the thumbnail rail) and no mask-image (rasterised into huge PDF bitmaps).
              background:
                'radial-gradient(ellipse 50% 72% at 50% 0%, rgba(185,242,255,0.55), rgba(185,242,255,0) 100%)',
              opacity: rayOpacity,
              willChange: live ? 'transform' : undefined,
              animation: live ? `dv-sway ${11 + i * 2}s ease-in-out ${-i * 3}s infinite` : 'none',
            } as CSSProperties
          }
        />
      ))}
      {Array.from({ length: 30 }).map((_, i) => {
        const seed = i + depth * 7;
        const size = bubbles ? 4 + rand(seed) * 12 : 2 + rand(seed) * 4;
        const o = bubbles ? 0.25 + rand(seed + 3) * 0.35 : 0.2 + rand(seed + 3) * 0.45;
        return (
          <div
            key={`p-${i}`}
            style={
              {
                position: 'absolute',
                left: rand(seed + 1) * 1920,
                top: rand(seed + 2) * 1080,
                width: size,
                height: size,
                borderRadius: '50%',
                border: bubbles ? '1.5px solid rgba(200, 245, 255, 0.8)' : 'none',
                background: bubbles ? 'rgba(200, 245, 255, 0.08)' : 'rgba(210, 235, 245, 0.9)',
                '--o': o,
                '--dy': bubbles ? '-240px' : '90px',
                opacity: live ? 0 : o,
                animation: live
                  ? `dv-float ${(bubbles ? 9 : 22) + rand(seed + 4) * 12}s linear ${-rand(seed + 5) * 20}s infinite`
                  : 'none',
              } as CSSProperties
            }
          />
        );
      })}
      {k > 0.7 &&
        Array.from({ length: 9 }).map((_, i) => (
          <div
            key={`b-${i}`}
            style={{
              position: 'absolute',
              left: 200 + rand(i + 40) * 1520,
              top: 160 + rand(i + 50) * 760,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--osd-accent)',
              boxShadow: '0 0 18px 6px rgba(95, 227, 224, 0.55)',
              opacity: live ? 0.15 : 0.5,
              animation: live ? `dv-glow ${3 + rand(i + 60) * 4}s ease-in-out ${-rand(i) * 4}s infinite` : 'none',
            }}
          />
        ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 45%, rgba(0, 4, 10, 0.55) 100%)',
        }}
      />
    </div>
  );
};

const GAUGE_TOP = 170;
const GAUGE_H = 720;
const GAUGE_MAX = 500;
let lastDepth = 0;

const DepthGauge = ({ depth }: { depth: number }) => {
  const live = useIsActivePage();
  const [from] = useState(() => (live ? lastDepth : depth));
  useEffect(() => {
    if (live) lastDepth = depth;
  }, [live, depth]);
  const yOf = (d: number) => GAUGE_TOP + (d / GAUGE_MAX) * GAUGE_H;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          right: 56,
          top: 46,
          textAlign: 'right',
          fontFamily: MONO,
          color: muted,
        }}
      >
        <div style={{ fontSize: 16, letterSpacing: '0.3em', color: dim }}>DEPTH</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: 'var(--osd-accent)' }}>
          −<CountUp from={from} to={depth} duration={1.4} />
          <span style={{ fontSize: 18, marginLeft: 6, color: muted }}>m</span>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1866,
          top: GAUGE_TOP,
          width: 2,
          height: GAUGE_H,
          background: `linear-gradient(180deg, ${line}, rgba(95,227,224,0.06))`,
        }}
      />
      {[0, 100, 200, 300, 400, 500].map((d) => (
        <div
          key={d}
          style={{
            position: 'absolute',
            left: 1858,
            top: yOf(d),
            width: 18,
            height: 1.5,
            background: line,
          }}
        />
      ))}
      <motion.div
        style={{ position: 'absolute', left: 1846, width: 42, height: 2, background: 'var(--osd-accent)' }}
        initial={{ top: yOf(from) }}
        animate={{ top: yOf(depth) }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: -6,
            width: 0,
            height: 0,
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            borderLeft: '10px solid var(--osd-accent)',
          }}
        />
      </motion.div>
    </div>
  );
};

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: PAD,
        right: PAD,
        bottom: 38,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: MONO,
        fontSize: 22,
        color: dim,
      }}
    >
      <span>李鈞盛 ｜ 國立中山大學 海下科技研究所 碩士班甄試</span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Frame = ({ depth, children }: { depth: number; children: ReactNode }) => (
  <MotionConfig reducedMotion="user">
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--osd-bg)',
        color: 'var(--osd-text)',
        fontFamily: 'var(--osd-font-body)',
      }}
    >
      <Ocean depth={depth} />
      <DepthGauge depth={depth} />
      {children}
      <Footer />
    </div>
  </MotionConfig>
);

// The editor saves a text edit by following a plain `{prop}` back to the page's
// <Header prop="…"> call, so each piece of text sits alone in its own element.
const Header = ({ no, kicker, title, sub }: { no: string; kicker: string; title: string; sub?: string }) => {
  const live = useIsActivePage();
  return (
    <div style={{ position: 'absolute', left: PAD, top: 96, right: 260 }}>
      <Rise delay={0.05}>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.12em', color: 'var(--osd-accent)' }}>
          <span>{no}</span> <span style={{ color: dim }}>//</span> <span>{kicker}</span>
        </div>
      </Rise>
      <motion.div
        initial={live ? { opacity: 0, y: 24, filter: 'blur(10px)', clipPath: 'inset(-25% 100% -25% 0%)' } : false}
        animate={
          live
            ? {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                clipPath: 'inset(-25% 0% -25% 0%)',
                transitionEnd: { filter: 'none', clipPath: 'none' },
              }
            : {}
        }
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      >
        <h2
          style={{
            margin: '18px 0 0',
            fontFamily: 'var(--osd-font-display)',
            fontSize: 68,
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </h2>
      </motion.div>
      {sub && (
        <Rise delay={0.45}>
          <p style={{ margin: '14px 0 0', fontSize: 28, lineHeight: 1.5, color: muted }}>{sub}</p>
        </Rise>
      )}
    </div>
  );
};

const Chip = ({ children, tone = 'accent' }: { children: ReactNode; tone?: 'accent' | 'amber' }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 20px',
      borderRadius: 999,
      fontSize: 26,
      color: tone === 'amber' ? amber : 'var(--osd-accent)',
      border: `1.5px solid ${tone === 'amber' ? 'rgba(255,197,110,0.55)' : line}`,
      background: tone === 'amber' ? 'rgba(255,197,110,0.08)' : 'rgba(95,227,224,0.07)',
    }}
  >
    {children}
  </span>
);

// ─── 1. Cover ────────────────────────────────────────────────────────────────

const SurfaceWaves = () => {
  const live = useIsActivePage();
  const wave = (amp: number, len: number, y: number) => {
    let d = `M0 ${y}`;
    for (let x = 0; x <= 3840; x += len) {
      d += ` Q${x + len / 4} ${y - amp} ${x + len / 2} ${y} T${x + len} ${y}`;
    }
    return `${d} V0 H0 Z`;
  };
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 120, pointerEvents: 'none' }}>
      <svg
        width={3840}
        height={120}
        style={{ position: 'absolute', left: 0, top: 0, animation: live ? 'dv-wave 9s linear infinite' : 'none' }}
      >
        <path d={wave(14, 480, 74)} fill="rgba(170, 236, 255, 0.10)" />
      </svg>
      <svg
        width={3840}
        height={120}
        style={{
          position: 'absolute',
          left: -240,
          top: 0,
          animation: live ? 'dv-wave 14s linear infinite reverse' : 'none',
        }}
      >
        <path d={wave(10, 320, 56)} fill="rgba(170, 236, 255, 0.12)" />
        <path d={wave(10, 320, 56).split(' V0')[0]} fill="none" stroke="rgba(200,245,255,0.45)" strokeWidth={2} />
      </svg>
    </div>
  );
};

const Porthole = () => {
  const live = useIsActivePage();
  const cx = 1430;
  const cy = 520;
  return (
    <div style={{ position: 'absolute', left: cx - 300, top: cy - 300, width: 600, height: 600 }}>
      {live &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              inset: 70,
              borderRadius: '50%',
              border: '2px solid var(--osd-accent)',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.9, 1.45], opacity: [0.7, 0] }}
            transition={{ duration: 3.6, delay: 1 + i * 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        initial={live ? { opacity: 0, scale: 0.82, rotate: -20 } : false}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.3, delay: 0.2, ease: EASE }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 18,
            borderRadius: '50%',
            border: `2px dashed ${line}`,
            animation: live ? 'dv-spin 50s linear infinite' : 'none',
          }}
        />
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener"
          style={{
            position: 'absolute',
            inset: 56,
            display: 'block',
            borderRadius: '50%',
            padding: 18,
            background: 'linear-gradient(145deg, #4c6b7b, #142836 55%, #5b7f90)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 2px 6px rgba(255,255,255,0.35)',
          }}
        >
          <img
            src={headshot}
            alt="李鈞盛"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center 28%',
              display: 'block',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
            }}
          />
        </a>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <div
            key={a}
            style={{
              position: 'absolute',
              left: 300 + Math.cos((a * Math.PI) / 180) * 235 - 7,
              top: 300 + Math.sin((a * Math.PI) / 180) * 235 - 7,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #d6e6ee, #5d7c8c)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 74,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 42%)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </div>
  );
};

const Cover: Page = () => {
  const live = useIsActivePage();
  return (
    <Frame depth={0}>
      <SurfaceWaves />
      <div style={{ position: 'absolute', left: 160, top: 210, width: 980 }}>
        <Rise delay={0.1}>
          <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.1em', color: 'var(--osd-accent)' }}>國立中山大學 海下科技研究所</div>
        </Rise>
        <h1
          style={{
            margin: '24px 0 0',
            fontFamily: 'var(--osd-font-display)',
            fontSize: 'var(--osd-size-hero)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '0.08em',
          }}
        >
          <a href={SITE_URL} target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'none' }}>
            <SplitText text="李鈞盛" delay={0.3} stagger={0.14} />
          </a>
        </h1>
        <Rise delay={0.8}>
          <p style={{ margin: '16px 0 0', fontSize: 40, lineHeight: 1.4, color: muted }}>
            逢甲大學 資訊工程學系 四年級
          </p>
        </Rise>
        <motion.div
          style={{ height: 4, width: 120, marginTop: 36, background: 'var(--osd-accent)', transformOrigin: 'left' }}
          initial={live ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
        />
        <Rise delay={1.15}>
          <p style={{ margin: '36px 0 0', fontSize: 46, lineHeight: 1.5, fontWeight: 500 }}>
            讓 AI 在邊緣即時看懂世界，
          </p>
        </Rise>
        <Rise delay={1.4}>
          <p style={{ margin: 0, fontSize: 46, lineHeight: 1.5, fontWeight: 700, color: 'var(--osd-accent)' }}>
            下一站，走進海下。
          </p>
        </Rise>
        <Rise delay={1.7}>
          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            <Chip>邊緣 AI</Chip>
            <Chip>電腦視覺</Chip>
            <Chip>行動應用開發</Chip>
          </div>
        </Rise>
      </div>
      <Porthole />
      <motion.div
        style={{
          position: 'absolute',
          left: 1430 - 120,
          top: 880,
          width: 240,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 22,
          color: muted,
        }}
        initial={live ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <div>開始下潛</div>
        <div style={{ fontSize: 30, color: 'var(--osd-accent)', animation: live ? 'dv-bob 1.8s ease-in-out infinite' : 'none' }}>
          ↓
        </div>
      </motion.div>
    </Frame>
  );
};

// ─── Shared video frame (造星者 + 倍伴練) ────────────────────────────────────
// Live page autoplays muted; thumbnails and print show the poster only.
// `sound` adds a button that restarts the video with audio — a <button>, so
// the player's click-to-advance ignores it.

const VideoFrame = ({
  src,
  poster,
  alt,
  label,
  left,
  top,
  width,
  height,
  sound = false,
}: {
  src: string;
  poster: string;
  alt: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  sound?: boolean;
}) => {
  const live = useIsActivePage();
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    if (muted) {
      v.currentTime = 0;
      v.muted = false;
      void v.play();
    } else {
      v.muted = true;
    }
    setMuted(!muted);
  };
  return (
    <Rise
      delay={0.5}
      y={40}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        borderRadius: 24,
        border: '10px solid #0d2333',
        outline: `1px solid ${line}`,
        background: '#000',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(95,227,224,0.12)',
      }}
    >
      {live ? (
        <video
          ref={ref}
          src={src}
          poster={poster}
          autoPlay
          muted={muted}
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <img src={poster} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      <span
        style={{
          position: 'absolute',
          left: 16,
          top: 14,
          padding: '4px 12px',
          borderRadius: 8,
          fontFamily: MONO,
          fontSize: 20,
          background: 'rgba(2,12,22,0.75)',
          color: amber,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <motion.span
          style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff6b6b', display: 'inline-block' }}
          animate={live ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        {label}
      </span>
      {sound && live && (
        <button
          type="button"
          onClick={toggleSound}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 14,
            padding: '6px 16px',
            borderRadius: 999,
            border: `1.5px solid ${muted ? line : amber}`,
            background: 'rgba(2,12,22,0.8)',
            color: muted ? 'var(--osd-text)' : amber,
            fontFamily: 'var(--osd-font-body)',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          {muted ? '▶ 有聲播放' : '■ 靜音'}
        </button>
      )}
    </Rise>
  );
};

// ─── 2. 自我介紹：夥伴帶給我的 ───────────────────────────────────────────────

const ValueCard = ({
  photo,
  kicker,
  title,
  desc,
  delay,
}: {
  photo: string;
  kicker: string;
  title: string;
  desc: string;
  delay: number;
}) => {
  const live = useIsActivePage();
  return (
    <Rise delay={delay} y={40} style={{ width: 533 }}>
      <div
        style={{
          height: 340,
          borderRadius: 'var(--osd-radius)',
          overflow: 'hidden',
          border: `1px solid ${line}`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
      >
        <motion.img
          src={photo}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          initial={live ? { scale: 1.15 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, delay, ease: EASE }}
        />
      </div>
      <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 24, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>
        {kicker}
      </div>
      <div style={{ marginTop: 4, fontSize: 38, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 26, lineHeight: 1.55, color: muted }}>{desc}</div>
    </Rise>
  );
};

const Intro: Page = () => (
  <Frame depth={30}>
    <Header
      no="01"
      kicker="自我介紹"
      title="不用很厲害才開始，要開始才能很厲害"
      sub="學長的一句話，也是和社團夥伴一起學習、一起比賽後，我最大的收穫"
    />
    <div style={{ position: 'absolute', left: PAD, top: 330, display: 'flex', gap: 40 }}>
      <ValueCard
        photo={clubLearn}
        kicker="一起學習"
        title="把想法講清楚"
        desc="上台分享、互相試教回饋，看見自己表達上的盲點"
        delay={0.6}
      />
      <ValueCard
        photo={clubTeam}
        kicker="一起比賽"
        title="把想法做出來"
        desc="和夥伴組隊投入專題與競賽，決賽前一起密集修正、一起上台"
        delay={0.85}
      />
      <ValueCard
        photo={clubTogether}
        kicker="一起走出去"
        title="和不同的人合作"
        desc="一起參加技術活動與交流，學會和不同背景的人溝通"
        delay={1.1}
      />
    </div>
    <Rise delay={1.6} style={{ position: 'absolute', left: PAD, top: 906, fontSize: 30, fontWeight: 500 }}>
      <span>
        接下來的每一件作品，都是和這群夥伴<span style={{ color: 'var(--osd-accent)' }}>一起做出來的</span> →
      </span>
    </Rise>
  </Frame>
);

// ─── 4. 大學專題：倍伴練 ─────────────────────────────────────────────────────

const Stat = ({ delay, value, label }: { delay: number; value: ReactNode; label: string }) => (
  <Rise delay={delay} style={{ borderTop: `2px solid ${line}`, paddingTop: 12 }}>
    <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 600, lineHeight: 1.1, color: 'var(--osd-accent)' }}>{value}</div>
    <div style={{ marginTop: 4, fontSize: 24, color: muted }}>{label}</div>
  </Rise>
);

const Project: Page = () => (
  <Frame depth={100}>
    <Header
      no="03"
      kicker="學術活動 ｜ 大學專題"
      title="倍伴練：讓平板即時看懂復健動作"
      sub="延續比賽的核心概念：基於 TensorFlow 邊緣端點之即時骨架動態感知系統 ｜ 指導教授：林峰正 副教授"
    />
    <VideoFrame
      src={plusrepVideo}
      poster={plusrepPoster}
      alt="倍伴練 PlusRep 介紹影片"
      label="倍伴練 PlusRep · 介紹影片"
      left={PAD}
      top={330}
      width={1040}
      height={585}
      sound
    />
    <div style={{ position: 'absolute', left: 1220, top: 330, width: 580, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Stat
        delay={0.9}
        value={
          <>
            <CountUp to={30} delay={0.9} /> FPS
          </>
        }
        label="中階手機（Snapdragon 695）即時推論"
      />
      <Stat
        delay={1.05}
        value={
          <>
            <CountUp to={18} delay={1.05} />–<CountUp to={25} delay={1.05} /> ms
          </>
        }
        label="單幀骨架推論時間"
      />
      <Stat
        delay={1.2}
        value={
          <>
            &lt; <CountUp from={3} to={0.5} decimals={1} delay={1.2} /> s
          </>
        }
        label="錯誤姿勢 → 語音提醒"
      />
    </div>
    <Rise delay={1.5} style={{ position: 'absolute', left: 1220, top: 736, width: 580 }}>
      <div style={{ fontSize: 26, lineHeight: 1.6, color: muted }}>
        <div>▸ BlazePose ＋ MoveNet，iPad 本機運算</div>
        <div>▸ 向量夾角判斷關節角度、自動計次</div>
        <div>▸ 小伴 AI：本機對話、台語鼓勵</div>
        <div>▸ 患者・家屬・醫師 三端同步</div>
      </div>
    </Rise>
  </Frame>
);

// ─── 3. 競賽：題目的起點 ─────────────────────────────────────────────────────

const Burst = () => {
  const live = useIsActivePage();
  return (
    <motion.svg
      width={220}
      height={220}
      viewBox="-110 -110 220 220"
      style={{ position: 'absolute', left: -46, top: -66, pointerEvents: 'none' }}
      initial={live ? { scale: 0, opacity: 0 } : false}
      animate={live ? { scale: 1, opacity: [0, 1, 0.35], rotate: 90 } : { scale: 1, opacity: 0.35 }}
      transition={{ duration: 2.2, delay: 1.1, ease: EASE }}
    >
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={Math.cos(a) * 52}
            y1={Math.sin(a) * 52}
            x2={Math.cos(a) * 96}
            y2={Math.sin(a) * 96}
            stroke={amber}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
    </motion.svg>
  );
};

const AwardCard = ({
  photo,
  rank,
  title,
  work1,
  work2,
  delay,
  children,
}: {
  photo: string;
  rank: string;
  title: string;
  work1: string;
  work2: string;
  delay: number;
  children: ReactNode;
}) => {
  const live = useIsActivePage();
  return (
    <Rise
      delay={delay}
      y={48}
      style={{
        width: 820,
        borderRadius: 'var(--osd-radius)',
        border: `1px solid ${line}`,
        background: panel,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{ height: 340, overflow: 'hidden' }}>
        <motion.img
          src={photo}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          initial={live ? { scale: 1.18 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 3, delay, ease: EASE }}
        />
      </div>
      <div style={{ display: 'flex', gap: 32, padding: '26px 32px 28px' }}>
        <div style={{ position: 'relative', width: 214, flexShrink: 0 }}>
          <Burst />
          <motion.div
            style={{
              position: 'relative',
              whiteSpace: 'nowrap',
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1.1,
              backgroundImage: `linear-gradient(110deg, ${amber} 35%, #fff4d6 50%, ${amber} 65%)`,
              backgroundSize: '250% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              animation: live ? 'dv-shimmer 3.2s ease-in-out 2s infinite' : 'none',
            }}
            initial={live ? { scale: 0.4, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: delay + 0.6 }}
          >
            <span>{rank}</span>
          </motion.div>
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
          <div style={{ marginTop: 8, fontSize: 26, lineHeight: 1.5, color: muted }}>{children}</div>
          <div style={{ marginTop: 10, fontSize: 26, lineHeight: 1.5 }}>
            <div>
              <span style={{ color: 'var(--osd-accent)' }}>作品｜</span>
              <span>{work1}</span>
            </div>
            <div>{work2}</div>
          </div>
        </div>
      </div>
    </Rise>
  );
};

// "延續" badge sitting in the gap between the two award cards.
const CarryOn = () => {
  const live = useIsActivePage();
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: PAD + 820 + 20 - 48,
        top: 330 + 170 - 48,
        width: 96,
        height: 96,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        background: 'var(--osd-bg)',
        border: '3px solid var(--osd-accent)',
        boxShadow: '0 0 30px rgba(95,227,224,0.45)',
        color: 'var(--osd-accent)',
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1.2,
      }}
      initial={live ? { scale: 0, rotate: -90 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 1.4 }}
    >
      <div>
        延續
        <div style={{ fontSize: 30, animation: live ? 'dv-nudge 1.6s ease-in-out 2s infinite' : 'none' }}>→</div>
      </div>
    </motion.div>
  );
};

const Awards: Page = () => (
  <Frame depth={60}>
    <Header
      no="02"
      kicker="學術活動 ｜ 競賽"
      title="一個概念，從比賽一路做下去"
      sub="全國電子設計創意競賽 → 海峽兩岸青少年創客大賽 → 大學專題「倍伴練」"
    />
    <div style={{ position: 'absolute', left: PAD, top: 330, display: 'flex', gap: 40 }}>
      <AwardCard
        photo={awardNational}
        rank="季軍"
        title="第二十二屆 全國電子設計創意競賽"
        work1="基於 ML Kit 邊緣運算之"
        work2="即時動態感知與遠端照護系統"
        delay={0.5}
      >
        智慧大數據及行動 APP 類 ｜{' '}
        <span style={{ fontFamily: MONO, color: 'var(--osd-accent)' }}>
          <CountUp to={33} delay={1.2} />
        </span>{' '}
        隊入圍決賽
      </AwardCard>
      <AwardCard
        photo={awardCrossStrait}
        rank="一等獎"
        title="第十一屆 海峽兩岸青少年創客大賽"
        work1="《CareYou》居家復健平台"
        work2="延續核心概念，加入本地 LLM 與語音"
        delay={0.75}
      >
        開源創新組 ｜ 上海同濟大學總決賽
      </AwardCard>
    </div>
    <CarryOn />
  </Frame>
);

// ─── 5. App 作品：造星者 ─────────────────────────────────────────────────────

const IconBox = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: 72,
      height: 72,
      flexShrink: 0,
      borderRadius: 14,
      border: `1.5px solid ${line}`,
      background: 'rgba(95,227,224,0.07)',
      display: 'grid',
      placeItems: 'center',
    }}
  >
    {children}
  </div>
);

const EyeIcon = () => {
  const live = useIsActivePage();
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <path d="M4 24 Q24 6 44 24 Q24 42 4 24 Z" fill="none" stroke="#5fe3e0" strokeWidth={3} />
      <motion.circle
        cy={24}
        r={7}
        fill={amber}
        initial={false}
        animate={live ? { cx: [24, 16, 32, 24] } : { cx: 24 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
};

const TabletIcon = () => {
  const live = useIsActivePage();
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <rect x={8} y={4} width={32} height={40} rx={5} fill="none" stroke="#5fe3e0" strokeWidth={3} />
      <motion.line
        x1={24}
        y1={-6}
        x2={24}
        y2={22}
        stroke={amber}
        strokeWidth={2.5}
        strokeDasharray="4 4"
        initial={false}
        animate={live ? { x2: [16, 32, 16] } : { x2: 24 }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cy={22}
        r={4}
        fill={amber}
        initial={false}
        animate={live ? { cx: [16, 32, 16] } : { cx: 24 }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
};

const CalibIcon = () => {
  const live = useIsActivePage();
  const xs = [10, 38, 24, 10, 38];
  const ys = [10, 10, 24, 38, 38];
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <rect x={3} y={3} width={42} height={42} rx={6} fill="none" stroke="#5fe3e0" strokeOpacity={0.6} strokeWidth={2} />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={3} fill="#5fe3e0" opacity={0.6} />
      ))}
      <motion.circle
        r={6}
        fill="none"
        stroke={amber}
        strokeWidth={2.5}
        initial={false}
        animate={live ? { cx: [...xs, xs[0]], cy: [...ys, ys[0]] } : { cx: 24, cy: 24 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
};

const TimerIcon = () => {
  const live = useIsActivePage();
  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <circle cx={24} cy={26} r={17} fill="none" stroke="rgba(95,227,224,0.25)" strokeWidth={4} />
      <motion.circle
        cx={24}
        cy={26}
        r={17}
        fill="none"
        stroke={amber}
        strokeWidth={4}
        strokeLinecap="round"
        style={{ rotate: -90, originX: '24px', originY: '26px' }}
        initial={false}
        animate={live ? { pathLength: [0, 1, 1] } : { pathLength: 1 }}
        transition={{ duration: 3.6, times: [0, 0.83, 1], repeat: Infinity, ease: 'linear' }}
      />
      <rect x={20} y={2} width={8} height={5} rx={1.5} fill="#5fe3e0" />
    </svg>
  );
};

const TechItem = ({
  icon,
  title,
  desc,
  delay,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  delay: number;
}) => (
  <Rise delay={delay} style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
    <IconBox>{icon}</IconBox>
    <div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 26, lineHeight: 1.45, color: muted }}>{desc}</div>
    </div>
  </Rise>
);

const AppWork: Page = () => (
  <Frame depth={150}>
    <Header
      no="04"
      kicker="學術活動 ｜ App 作品"
      title="讓 App 知道孩子有沒有在看"
      sub="造星者：兒童專注力訓練 App ｜ 2026 行動應用創新賽 ｜ 負責主要程式設計與美術設計"
    />
    <VideoFrame
      src={appVideo}
      poster={appPoster}
      alt="造星者 App 畫面"
      label="DEMO · 造星者"
      left={PAD}
      top={340}
      width={992}
      height={558}
      sound
    />
    <div style={{ position: 'absolute', left: 1160, top: 340, width: 640, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <TechItem icon={<EyeIcon />} title="MediaPipe 虹膜偵測" desc="網頁端即時追蹤雙眼位置" delay={0.8} />
      <TechItem icon={<TabletIcon />} title="自寫 ARKit 外掛" desc="iPad 上把視線投影到螢幕平面" delay={0.95} />
      <TechItem icon={<CalibIcon />} title="5 點視線校準" desc="看五個點，算出個人化校準" delay={1.1} />
      <TechItem icon={<TimerIcon />} title="注視停滯 > 3 秒 = 分心" desc="測試發現遮住鏡頭會誤判，因此加入" delay={1.25} />
    </div>
    <Rise
      delay={1.6}
      style={{
        position: 'absolute',
        left: 1160,
        top: 760,
        width: 640,
        padding: '18px 26px',
        borderLeft: `5px solid ${amber}`,
        borderRadius: 12,
        background: 'rgba(255,197,110,0.07)',
      }}
    >
      <div style={{ fontSize: 26, color: muted }}>初賽只審企劃書 → 落選</div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.45, color: amber }}>
        做得出來只是第一步，
        <br />
        還要用數據證明價值。
      </div>
    </Rise>
  </Frame>
);

// ─── 6. HomeLab ──────────────────────────────────────────────────────────────

const Tier = ({
  title,
  desc,
  filled,
  delay,
  tone,
}: {
  title: string;
  desc: string;
  filled: number;
  delay: number;
  tone: string;
}) => {
  const live = useIsActivePage();
  return (
    <Rise
      delay={delay}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 150,
        padding: '0 28px',
        borderRadius: 'var(--osd-radius)',
        border: `1.5px solid ${line}`,
        background: panel,
      }}
    >
      <div style={{ width: 390, flexShrink: 0 }}>
        <div style={{ fontSize: 34, fontWeight: 700 }}>{title}</div>
        <div style={{ marginTop: 4, fontSize: 24, color: muted, whiteSpace: 'nowrap' }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        {Array.from({ length: 13 }).map((_, i) =>
          i < filled ? (
            <motion.div
              key={i}
              style={{
                width: 38,
                height: 92,
                borderRadius: 6,
                backgroundColor: tone,
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(255,255,255,0.22) 0 6px, rgba(255,255,255,0) 6px 14px)',
                animation: live ? 'dv-hatch 1.2s linear infinite' : 'none',
              }}
              initial={live ? { y: -70, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22, delay: delay + 0.3 + i * 0.07 }}
            />
          ) : (
            <div
              key={i}
              style={{ width: 38, height: 92, borderRadius: 6, border: '1.5px dashed rgba(147,179,196,0.3)' }}
            />
          ),
        )}
      </div>
    </Rise>
  );
};

const DataFlow = () => {
  const live = useIsActivePage();
  return (
    <div style={{ position: 'absolute', left: 716, top: 420, width: 20, height: 470 }}>
      <div
        style={{
          position: 'absolute',
          left: 9,
          top: 0,
          bottom: 0,
          width: 2,
          background: `linear-gradient(0deg, ${amber}, var(--osd-accent))`,
          opacity: 0.5,
        }}
      />
      <div style={{ position: 'absolute', left: 1, top: -14, color: 'var(--osd-accent)', fontSize: 20 }}>▲</div>
      {live &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: 3,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: amber,
              boxShadow: `0 0 16px ${amber}`,
            }}
            animate={{ top: [450, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.4, delay: 1.8 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
    </div>
  );
};

const HomeLab: Page = () => {
  const live = useIsActivePage();
  return (
    <Frame depth={200}>
      <Header no="05" kicker="其他 ｜ 自主探索 HomeLab" title="在家裡，把 125B 模型跑起來" />
      <div style={{ position: 'absolute', left: PAD, top: 330, width: 560 }}>
        <Rise delay={0.4}>
          <div style={{ fontSize: 28, color: muted }}>傳統做法至少需要</div>
          <div style={{ position: 'relative', display: 'inline-block', fontFamily: MONO, fontSize: 132, fontWeight: 600, color: dim, lineHeight: 1.1 }}>
            80GB
            <motion.div
              style={{ position: 'absolute', left: -6, right: -6, top: '52%', height: 8, background: '#ff6b6b', transformOrigin: 'left', borderRadius: 4 }}
              initial={live ? { scaleX: 0 } : false}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 1.0, ease: EASE }}
            />
          </div>
        </Rise>
        <Rise delay={1.3} style={{ marginTop: 28 }}>
          <div style={{ fontSize: 28, color: muted }}>我用</div>
          <div style={{ fontFamily: MONO, fontSize: 168, fontWeight: 600, color: 'var(--osd-accent)', lineHeight: 1.05, textShadow: '0 0 40px rgba(95,227,224,0.35)' }}>
            <CountUp to={44} delay={1.3} />
            GB
          </div>
          <div style={{ marginTop: 10, fontSize: 30, lineHeight: 1.55 }}>
            顯示記憶體 ＋ 系統記憶體 ＋ SSD
            <br />
            分層存放，成功運行
          </div>
        </Rise>
      </div>
      <DataFlow />
      <div style={{ position: 'absolute', left: 760, top: 340, width: 1040 }}>
        <Rise delay={0.4} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: muted }}>
          <span>125B 參數模型（IQ3 量化）分層存放</span>
          <span style={{ fontFamily: MONO, fontSize: 22, color: dim }}>[ 方塊 = 模型層 · 示意 ]</span>
        </Rise>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 20 }}>
          <Tier title="顯示記憶體 44GB" desc="2 × RTX 2080 Ti（各改裝為 22GB）" filled={12} delay={0.6} tone="rgba(95,227,224,0.75)" />
          <Tier title="系統記憶體 48GB" desc="二手零件組裝 · 同時作為 NAS" filled={8} delay={0.9} tone="rgba(120,180,255,0.7)" />
          <Tier title="SSD" desc="放不下的層，交給儲存裝置" filled={4} delay={1.2} tone="rgba(255,197,110,0.75)" />
        </div>
      </div>
      <Rise delay={2.4} style={{ position: 'absolute', left: PAD, top: 922, fontSize: 32, fontWeight: 700 }}>
        <span>
          在有限的硬體上部署模型，關鍵也在<span style={{ color: 'var(--osd-accent)' }}>資料怎麼搬</span>。
        </span>
      </Rise>
    </Frame>
  );
};

// ─── 7. 我能帶來的 ───────────────────────────────────────────────────────────

const ROW_H = 164;
const ROW_GAP = 24;
const ROWS_TOP = 380;
const LEFT_W = 740;
const RIGHT_X = 1000;

const BringRow = ({
  i,
  skill,
  field,
  did1,
  did2,
  bring,
}: {
  i: number;
  skill: string;
  field: string;
  did1: string;
  did2: string;
  bring: string;
}) => {
  const live = useIsActivePage();
  const top = ROWS_TOP + i * (ROW_H + ROW_GAP);
  const delay = 0.6 + i * 0.45;
  const midY = ROW_H / 2;
  const card: CSSProperties = {
    position: 'absolute',
    top,
    height: ROW_H,
    padding: '22px 28px',
    borderRadius: 'var(--osd-radius)',
  };
  return (
    <>
      <motion.div
        style={{ ...card, left: PAD, width: LEFT_W, background: panel, border: `1px solid ${line}` }}
        initial={live ? { opacity: 0, x: -40 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay, ease: EASE }}
      >
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>{skill}</div>
        <div style={{ marginTop: 8, fontSize: 26, lineHeight: 1.55, color: muted }}>
          <div>{did1}</div>
          <div>{did2}</div>
        </div>
      </motion.div>
      <svg
        width={RIGHT_X - (PAD + LEFT_W)}
        height={ROW_H}
        style={{ position: 'absolute', left: PAD + LEFT_W, top, overflow: 'visible', pointerEvents: 'none' }}
      >
        <motion.line
          x1={8}
          y1={midY}
          x2={RIGHT_X - (PAD + LEFT_W) - 14}
          y2={midY}
          stroke="#5fe3e0"
          strokeWidth={3}
          strokeDasharray="2 8"
          strokeLinecap="round"
          initial={live ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.35, ease: EASE }}
        />
        <polygon
          points={`${RIGHT_X - (PAD + LEFT_W) - 14},${midY - 9} ${RIGHT_X - (PAD + LEFT_W) - 2},${midY} ${RIGHT_X - (PAD + LEFT_W) - 14},${midY + 9}`}
          fill="#5fe3e0"
        />
        {live && (
          <motion.circle
            cy={midY}
            r={6}
            fill={amber}
            initial={{ cx: 8, opacity: 0 }}
            animate={{ cx: [8, RIGHT_X - (PAD + LEFT_W) - 16], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, delay: delay + 0.9, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
          />
        )}
      </svg>
      <motion.div
        style={{
          ...card,
          left: RIGHT_X,
          width: 1800 - RIGHT_X,
          background: 'rgba(255,197,110,0.06)',
          border: '1.5px solid rgba(255,197,110,0.45)',
        }}
        initial={live ? { opacity: 0, x: 40 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: delay + 0.55, ease: EASE }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, color: amber }}>{field}</div>
        <div style={{ marginTop: 6, fontSize: 28, lineHeight: 1.5 }}>{bring}</div>
      </motion.div>
    </>
  );
};

const Bring: Page = () => (
  <Frame depth={300}>
    <Header no="06" kicker="我能帶來的" title="我能為實驗室帶來什麼" sub="把做過的事，接到海下所的研究上" />
    <Rise delay={0.4} style={{ position: 'absolute', left: PAD, top: 332, width: LEFT_W, fontFamily: MONO, fontSize: 22, color: dim }}>
      <span>我做過的</span>
    </Rise>
    <Rise delay={0.4} style={{ position: 'absolute', left: RIGHT_X, top: 332, fontFamily: MONO, fontSize: 22, color: dim }}>
      <span>能帶到實驗室的</span>
    </Rise>
    <BringRow
      i={0}
      skill="邊緣 AI 部署"
      field="AI 模型最佳化"
      did1="中階手機 30 FPS、單幀 18–25 ms，iPad 本機推論"
      did2="HomeLab：125B 模型分層跑在 44GB 顯示記憶體上"
      bring="把「有限硬體也跑得動」的經驗，用在水下載具的即時推論"
    />
    <BringRow
      i={1}
      skill="電腦視覺"
      field="水下影像處理"
      did1="骨架偵測、關節角度計算、遮蔽幀線性插補"
      did2="MediaPipe 虹膜偵測與 5 點視線校準"
      bring="把處理不穩定影像的經驗，延伸到水下影像增強與辨識"
    />
    <BringRow
      i={2}
      skill="系統實作"
      field="實驗工具與系統整合"
      did1="從 App、本機 AI 到患者・家屬・醫師三端同步"
      did2="自寫 ARKit 外掛，把原型做成能上台比賽的作品"
      bring="快速做出實驗工具與展示原型，讓研究成果真的能用"
    />
  </Frame>
);

// ─── 8. 讀書計畫 ─────────────────────────────────────────────────────────────

const NODE_X = [315, 745, 1175, 1605];
const NODE_Y = [345, 395, 445, 495];

const Stage = ({
  i,
  phase,
  title,
  line1,
  line2,
  line3,
  final = false,
}: {
  i: number;
  phase: string;
  title: string;
  line1: string;
  line2: string;
  line3: string;
  final?: boolean;
}) => {
  const live = useIsActivePage();
  const [ref, shown] = useStepShown();
  const x0 = i === 0 ? PAD : NODE_X[i - 1];
  const y0 = i === 0 ? NODE_Y[0] - 30 : NODE_Y[i - 1];
  const x1 = NODE_X[i];
  const y1 = NODE_Y[i];
  const mid = (x0 + x1) / 2;
  const tone = final ? amber : 'var(--osd-accent)';
  return (
    <div ref={ref}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <motion.path
          d={`M${x0} ${y0} C${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`}
          fill="none"
          stroke="#5fe3e0"
          strokeOpacity={0.6}
          strokeWidth={3}
          initial={live ? { pathLength: 0 } : false}
          animate={{ pathLength: shown ? 1 : 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </svg>
      <motion.div
        style={{
          position: 'absolute',
          left: x1 - 15,
          top: y1 - 15,
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'var(--osd-bg)',
          border: `5px solid ${tone}`,
          boxShadow: `0 0 28px ${final ? 'rgba(255,197,110,0.7)' : 'rgba(95,227,224,0.6)'}`,
        }}
        initial={live ? { scale: 0 } : false}
        animate={{ scale: shown ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 15, delay: shown ? 0.55 : 0 }}
      />
      <motion.div
        style={{
          position: 'absolute',
          left: x1 - 195,
          top: y1 + 40,
          width: 390,
          padding: '22px 24px 24px',
          borderRadius: 'var(--osd-radius)',
          background: final ? 'rgba(255,197,110,0.08)' : panel,
          border: `1.5px solid ${final ? 'rgba(255,197,110,0.5)' : line}`,
        }}
        initial={live ? { opacity: 0, y: 30 } : false}
        animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, delay: shown ? 0.65 : 0, ease: EASE }}
      >
        <div style={{ fontFamily: MONO, fontSize: 22, color: tone, letterSpacing: '0.08em' }}>{phase}</div>
        <div style={{ marginTop: 6, fontSize: 36, fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
        <div style={{ marginTop: 12, fontSize: 26, lineHeight: 1.6, color: muted }}>
          <div>{line1}</div>
          <div>{line2}</div>
          <div>{line3}</div>
        </div>
      </motion.div>
    </div>
  );
};

const Thanks = () => {
  const live = useIsActivePage();
  const [ref, shown] = useStepShown();
  return (
    <motion.div
      ref={ref}
      style={{ position: 'absolute', left: PAD, top: 884, display: 'flex', alignItems: 'baseline', gap: 28 }}
      initial={live ? { opacity: 0, y: 24 } : false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: '0.06em' }}>謝謝老師聆聽</span>
      <span style={{ fontSize: 28, color: muted }}>敬請指教</span>
    </motion.div>
  );
};

const StudyPlan: Page = () => {
  return (
    <Frame depth={500}>
      <Header no="07" kicker="讀書計畫" title="從陸地，走進海下" />
      <Rise delay={0.4} style={{ position: 'absolute', left: PAD, top: NODE_Y[0] - 72, fontFamily: MONO, fontSize: 22, color: dim }}>
        <span>▾ 下潛路線</span>
      </Rise>
      <Steps>
        <Step duration={1}>
          <Stage i={0} phase="入學前" title="補海洋基礎" line1="水中聲學．水下載具入門" line2="機率統計．訊號與系統" line3="水下影像與聲納辨識文獻" />
        </Step>
        <Step duration={1}>
          <Stage i={1} phase="碩一" title="修課與實作" line1="海下科技研討．水下載具導論" line2="海上實習：ROV．聲納．定位" line3="加入實驗室．參與計畫" />
        </Step>
        <Step duration={1}>
          <Stage i={2} phase="碩二" title="研究與論文" line1="混濁、低光的水下影像處理" line2="AI 模型最佳化與即時推論" line3="感知可信度評估．完成論文" />
        </Step>
        <Step duration={1}>
          <Stage i={3} phase="畢業後" title="投入海洋科技" line1="水下影像處理．目標辨識" line2="AI 模型最佳化與邊緣部署" line3="水下載具．國防科技研發" final />
        </Step>
        <Step duration={1}>
          <Thanks />
        </Step>
      </Steps>
    </Frame>
  );
};

// ─── Deck ────────────────────────────────────────────────────────────────────

// Shared with slides/nsysu-interview-7a, which swaps in another page 7 for comparison.
export { amber, dim, EASE, Frame, line, MONO, muted, PAD, panel, rand, Rise, useStepShown };

export const transition: SlideTransition = {
  duration: 280,
  exit: { duration: 280, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: [{ opacity: 1 }, { opacity: 1 }] },
  enter: {
    duration: 280,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'translateY(10px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ],
  },
};

export const meta: SlideMeta = {
  title: '李鈞盛｜中山海下所 碩士班甄試面試',
  createdAt: '2026-10-28T07:51:38.876Z',
};

export default [Cover, Intro, Awards, Project, AppWork, HomeLab, Bring, StudyPlan] satisfies Page[];

export const notes: (string | undefined)[] = [
  `（約 20 秒）
老師好，我是李鈞盛，現在是逢甲資工四年級。
如果用一句話介紹我在做的事，就是：讓 AI 在手機、平板這種小小的裝置上，即時看懂人在做什麼。
今天想跟老師分享，我為什麼想把這件事，帶到海裡面。`,
  `（約 40 秒）
在講作品之前，我想先分享一句對我影響很大的話：「不用很厲害才開始，要開始才能很厲害。」
這是社團學長跟我說的。
在社團裡，我們常常一起上台分享、互相試教、給彼此回饋。我這才發現自己講話有很多盲點，也慢慢學會把想法講清楚。
我們也一起組隊比賽，決賽前幾天都窩在一起改程式、一起上台；
還會一起去參加技術活動，跟很多不同背景的人交流。
所以等一下要分享的作品，其實都是我跟這群夥伴一起做出來的。`,
  `（約 40 秒）
我的第一個題目，是從比賽開始的。
我第一次參賽，是全國電子設計創意競賽。我們用 ML Kit 讓手機在本機即時看懂復健動作，再把結果同步給家屬跟醫師，最後在 33 隊決賽裡拿到季軍。
接著我們延續同樣的核心概念，做成居家復健平台 CareYou，加入本地的語言模型和語音，到上海同濟大學參加海峽兩岸青少年創客大賽，拿到一等獎。
比賽讓我學到最重要的一件事：作品不是能跑就好，要真的有人能用。`,
  `（約 45 秒｜影片會自己靜音播放，邊播邊講）
最後，這個題目延續成我的大學專題，由林峰正老師指導，我們幫它取了一個好記的名字，叫「倍伴練」。
專題改用 TensorFlow，在平板上用 BlazePose 跟 MoveNet 抓出身體的關節點，再用向量夾角算出關節角度，判斷動作有沒有做到位，順便自動計次，完全不用穿戴裝置。
速度的部分，中階手機上一幀大概 18 到 25 毫秒，可以跑到 30 FPS；姿勢做錯，不到 0.5 秒就會有語音提醒。
我們還做了一個本機的 AI 小幫手「小伴」，會用台語幫患者加油，家屬跟醫師也能同步看到進度。而且影像都在 iPad 上算，不用上傳雲端。
（老師如果想看，可以按影片右下角「有聲播放」）`,
  `（約 40 秒）
另一個作品叫「造星者」，是幫小朋友練專注力的 App，主要的程式是我寫的。
它的核心是視線追蹤：網頁版用 MediaPipe 抓虹膜；iPad 版我自己寫了 ARKit 外掛，把視線投影到螢幕上，再看 5 個點做校準。
測試的時候我們發現，鏡頭被遮住時系統會誤判，所以我加了一條規則：視線停住超過 3 秒，就算分心。
不過它在只看企劃書的初賽就被刷掉了。回頭檢討，是企劃書少了數據。這讓我學到，做得出來只是第一步，還要能用數據證明它的價值。
（老師如果想看，可以按影片右下角「有聲播放」）`,
  `（約 30 秒）
課餘時間，我用二手零件自己組了一台 HomeLab。兩張顯卡各改成 22GB，加起來有 44GB 的顯示記憶體。
一個 125B 參數的模型，一般至少要 80GB 才跑得動。我就把它拆開，分層放在顯示記憶體、系統記憶體跟 SSD，最後真的跑起來了。
這讓我體會到：硬體有限的時候，關鍵其實是資料要怎麼搬。`,
  `（約 40 秒）
那我能為實驗室帶來什麼？我整理成三點。
第一，邊緣 AI 部署：從手機上的 30 FPS 到 HomeLab，我很熟悉怎麼讓模型在有限的硬體上跑得動，這可以用在水下載具的 AI 模型最佳化。
第二，電腦視覺：我處理過遮擋、低光造成的不穩定影像，希望延伸到水下影像增強和目標辨識。
第三，系統實作：我習慣把想法做成真的能用的系統，可以幫實驗室快速做出實驗工具和展示原型。`,
  `（約 45 秒｜每按一次 → 帶出一個階段，最後一下帶出致謝）
我的讀書計畫分成四個階段。
［→］入學前，先把基礎補起來：水中聲學、水下載具，還有訊號與系統。
［→］碩一，修海下科技研討、水下載具導論這些課，也希望透過海上實習，實際碰到 ROV、聲納跟水下定位，並且早點加入實驗室。
［→］碩二，我想研究在混濁、低光的水下，怎麼用影像處理把畫面看清楚，再用 AI 模型最佳化讓它能在載具上即時跑，同時評估感知的可信度。
［→］畢業之後，希望繼續深耕水下影像處理和 AI 模型最佳化，投入水下載具或國防科技的研發。
［→］以上是我的報告，謝謝老師，請老師指教。`,
];
