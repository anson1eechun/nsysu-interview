// Comparison copy of slides/nsysu-interview: every page is shared with the main
// deck except page 7, which tells the "two underwater problems" story instead
// of "what I can bring to the lab". Edit text on the other pages in the main deck.
import { type Page, type SlideMeta, Step, Steps, useIsActivePage } from '@open-slide/core';
import { motion, useAnimationFrame } from 'motion/react';
import { type CSSProperties, type ReactNode, useRef, useState } from 'react';
import deck, {
  amber,
  dim,
  EASE,
  Frame,
  Header,
  line,
  MONO,
  muted,
  notes as baseNotes,
  PAD,
  panel,
  rand,
  Rise,
  useStepShown,
} from '../nsysu-interview/index';
import rehabSeated from './assets/rehab-seated.jpg';

export { design, transition } from '../nsysu-interview/index';

// ─── 7A. 研究動機：看不清、跑不動 ────────────────────────────────────────────

const TOP = 320;
const LAND_W = 480;
const LAND_H = 440;
const PROB_X = 720;
const PROB_W = 520;
const PROB_GAP = 40;
const VIS_W = PROB_W - 48;
const VIS_H = 210;

const LandPanel = () => {
  const live = useIsActivePage();
  const [conf, setConf] = useState(0.42);
  useAnimationFrame((t) => {
    if (!live) return;
    const v = 0.55 + 0.3 * Math.sin(t / 420) * Math.sin(t / 1330 + 1);
    setConf(Math.max(0.12, Math.min(0.95, v)));
  });
  const low = conf < 0.5;
  return (
    <Rise delay={0.5} style={{ position: 'absolute', left: PAD, top: TOP, width: LAND_W }}>
      <div
        style={{
          position: 'relative',
          height: LAND_H,
          borderRadius: 'var(--osd-radius)',
          overflow: 'hidden',
          border: `1px solid ${line}`,
        }}
      >
        <img
          src={rehabSeated}
          alt="專題實機畫面"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '0% 50%',
            display: 'block',
            filter: 'brightness(0.72) saturate(0.8)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 200,
            background: 'linear-gradient(0deg, rgba(2,12,22,0.97) 45%, rgba(2,12,22,0))',
          }}
        />
        <div style={{ position: 'absolute', left: 28, right: 28, bottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: muted }}>
            <span>關節點信心值</span>
            <span style={{ fontFamily: MONO, color: low ? '#ff8a8a' : 'var(--osd-accent)' }}>{conf.toFixed(2)}</span>
          </div>
          <div style={{ height: 12, marginTop: 10, borderRadius: 6, background: 'rgba(147,179,196,0.2)' }}>
            <div
              style={{
                width: `${conf * 100}%`,
                height: '100%',
                borderRadius: 6,
                background: low ? '#ff8a8a' : 'var(--osd-accent)',
              }}
            />
          </div>
        </div>
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: 10,
            padding: '6px 14px',
            borderRadius: 8,
            fontFamily: MONO,
            fontSize: 22,
            background: 'rgba(2,12,22,0.85)',
            color: 'var(--osd-accent)',
          }}
        >
          陸地 · 我的專題
        </span>
      </div>
      <p style={{ margin: '16px 0 0', fontSize: 26, lineHeight: 1.5, color: muted }}>
        遮擋、低光 → 信心值下降、骨架跳動
      </p>
    </Rise>
  );
};

const ToSea = () => {
  const live = useIsActivePage();
  const [ref, shown] = useStepShown();
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        left: PAD + LAND_W,
        top: TOP,
        width: PROB_X - PAD - LAND_W,
        height: LAND_H,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
      }}
      initial={live ? { opacity: 0, x: -20 } : false}
      animate={shown ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div>
        <div style={{ fontSize: 24, color: muted }}>到了水下</div>
        <div
          style={{
            fontSize: 64,
            color: 'var(--osd-accent)',
            animation: live && shown ? 'dv-nudge 1.6s ease-in-out infinite' : 'none',
          }}
        >
          →
        </div>
      </div>
    </motion.div>
  );
};

// A clear reef scene; the murky half of <Murky> is this same drawing, filtered.
const Seabed = ({ detect = false }: { detect?: boolean }) => (
  <svg width={VIS_W} height={VIS_H} viewBox={`0 0 ${VIS_W} ${VIS_H}`} style={{ display: 'block' }}>
    <rect width={VIS_W} height={VIS_H} fill="#3d9fbd" />
    <rect width={VIS_W} height={70} fill="#63c1d8" />
    <polygon points="70,0 120,0 190,210 130,210" fill="rgba(255,255,255,0.14)" />
    <polygon points="250,0 280,0 330,210 290,210" fill="rgba(255,255,255,0.1)" />
    <path d="M0 160 Q 90 142 180 156 T 360 150 T 472 158 V 210 H 0 Z" fill="#e3cb8f" />
    <ellipse cx={402} cy={164} rx={48} ry={26} fill="#7f8a86" />
    <ellipse cx={436} cy={176} rx={30} ry={18} fill="#68736f" />
    {[28, 44, 60].map((x) => (
      <path key={x} d={`M${x} 168 Q ${x - 12} 128 ${x + 4} 92`} stroke="#3fae6a" strokeWidth={6} strokeLinecap="round" fill="none" />
    ))}
    <path
      d="M300 166 V132 M300 142 L284 118 M300 138 L318 112 M318 112 L326 98 M284 118 L278 102"
      stroke="#ff7a4d"
      strokeWidth={9}
      strokeLinecap="round"
      fill="none"
    />
    <path d="M110 166 V140 M110 148 L98 128 M110 146 L124 126" stroke="#ff6fa0" strokeWidth={8} strokeLinecap="round" fill="none" />
    <g transform="translate(196 84)">
      <ellipse rx={34} ry={18} fill="#ffd23f" />
      <polygon points="30,0 52,-16 52,16" fill="#ffd23f" />
      <path d="M-8 -16 V16 M6 -17 V17" stroke="#1d3557" strokeWidth={5} />
      <circle cx={-20} cy={-4} r={4} fill="#1d3557" />
    </g>
    <g transform="translate(380 58) scale(0.6)">
      <ellipse rx={34} ry={18} fill="#ff9f1c" />
      <polygon points="30,0 52,-16 52,16" fill="#ff9f1c" />
      <circle cx={-20} cy={-4} r={4} fill="#1d3557" />
    </g>
    {detect && (
      <g>
        <rect x={152} y={60} width={104} height={48} rx={4} fill="none" stroke="#5fe3e0" strokeWidth={3} />
        <rect x={152} y={34} width={92} height={24} rx={4} fill="#5fe3e0" />
        <text x={160} y={52} fontSize={17} fontFamily={MONO} fill="#02121e">
          魚 0.94
        </text>
      </g>
    )}
  </svg>
);

const visBox: CSSProperties = {
  position: 'relative',
  width: VIS_W,
  height: VIS_H,
  borderRadius: 12,
  overflow: 'hidden',
  border: `1px solid ${line}`,
};

const tag: CSSProperties = {
  position: 'absolute',
  top: 10,
  padding: '2px 10px',
  borderRadius: 6,
  fontSize: 18,
  background: 'rgba(2,12,22,0.75)',
};

// 看不清: a wipe slides across the frame, turning the blue-green blur back into a clear scene.
const Murky = () => {
  const live = useIsActivePage();
  const [ref, shown] = useStepShown();
  const play = live && shown;
  return (
    <div ref={ref} style={visBox}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(3px) saturate(0.35) brightness(0.8)' }}>
        <Seabed />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(28,140,150,0.5), rgba(4,44,64,0.75))',
        }}
      />
      <svg width={VIS_W} height={VIS_H} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 34 }).map((_, k) => (
          <circle
            key={k}
            cx={rand(k + 400) * VIS_W}
            cy={rand(k + 500) * VIS_H}
            r={1 + rand(k + 600) * 2.2}
            fill="rgba(225,245,250,0.55)"
          />
        ))}
      </svg>
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: VIS_W / 2,
          overflow: 'hidden',
          borderRight: '3px solid #5fe3e0',
          boxShadow: '6px 0 18px rgba(95,227,224,0.45)',
        }}
        initial={false}
        animate={play ? { width: [0, VIS_W] } : { width: VIS_W / 2 }}
        transition={
          play
            ? { duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror', repeatDelay: 1.2 }
            : { duration: 0 }
        }
      >
        <Seabed detect />
      </motion.div>
      <span style={{ ...tag, left: 10, color: 'var(--osd-accent)' }}>影像處理後</span>
      <span style={{ ...tag, right: 10, color: muted }}>水下原始畫面</span>
    </div>
  );
};

const LAYERS = 6;
const PRUNED = [1, 4];
const smooth = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
// One 5.2 s loop: hold the full model, squeeze it, hold the small one, snap back.
const squeezeAt = (p: number) =>
  p < 0.18 ? 0 : p < 0.58 ? smooth((p - 0.18) / 0.4) : p < 0.9 ? 1 : 1 - smooth((p - 0.9) / 0.1);

// 跑不動: the model block is quantised and pruned while the latency readout falls.
const Squeeze = () => {
  const live = useIsActivePage();
  const [ref, shown] = useStepShown();
  const play = live && shown;
  const t0 = useRef<number | null>(null);
  const [q, setQ] = useState(1);
  useAnimationFrame((t) => {
    if (!play) {
      t0.current = null;
      return;
    }
    t0.current ??= t;
    setQ(squeezeAt(((t - t0.current) % 5200) / 5200));
  });
  const w = 168 - 84 * q;
  const h = 18 - 7 * q;
  const gap = 7 - 2 * q;
  const ms = Math.round(200 - 175 * q);
  const pct = Math.round(q * 100);
  return (
    <div ref={ref} style={{ ...visBox, background: 'rgba(2,12,22,0.55)' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 236, height: VIS_H - 44, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'relative', width: 168, height: LAYERS * h + (LAYERS - 1) * gap }}>
          {Array.from({ length: LAYERS }).map((_, k) => (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: (168 - w) / 2,
                top: k * (h + gap),
                width: w,
                height: h,
                borderRadius: 4,
                background: `color-mix(in srgb, #5fe3e0 ${pct}%, #93b3c4)`,
                opacity: PRUNED.includes(k) ? 0.9 - 0.75 * q : 0.9,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: 236, bottom: 16, textAlign: 'center', fontFamily: MONO, fontSize: 18, color: dim }}>
        {q < 0.5 ? '原始模型' : '量化・剪枝後'}
      </div>
      <div style={{ position: 'absolute', left: 236, top: 20, bottom: 20, width: 1, background: line }} />
      <div style={{ position: 'absolute', left: 262, top: 34, right: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: dim }}>推論延遲（示意）</div>
        <div
          style={{
            marginTop: 4,
            fontFamily: MONO,
            fontSize: 60,
            fontWeight: 600,
            lineHeight: 1.2,
            color: `color-mix(in srgb, #5fe3e0 ${pct}%, ${amber})`,
          }}
        >
          {ms}
          <span style={{ fontSize: 24, marginLeft: 8, color: muted }}>ms</span>
        </div>
        <div style={{ marginTop: 14, height: 10, borderRadius: 5, background: 'rgba(147,179,196,0.2)' }}>
          <div
            style={{
              width: `${(ms / 200) * 100}%`,
              height: '100%',
              borderRadius: 5,
              background: `color-mix(in srgb, #5fe3e0 ${pct}%, ${amber})`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Problem = ({
  i,
  title,
  causes,
  field,
  did,
  children,
}: {
  i: number;
  title: string;
  causes: ReactNode;
  field: string;
  did: string;
  children: ReactNode;
}) => {
  const live = useIsActivePage();
  const [ref, shown] = useStepShown();
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'absolute',
        left: PROB_X + i * (PROB_W + PROB_GAP),
        top: TOP,
        width: PROB_W,
        padding: '20px 24px 22px',
        borderRadius: 'var(--osd-radius)',
        background: panel,
        border: `1px solid ${line}`,
      }}
      initial={live ? { opacity: 0, y: 30 } : false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.08em', color: 'var(--osd-accent)' }}>問題 {i + 1}</span>
        <span style={{ fontSize: 42, fontWeight: 900 }}>{title}</span>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
      <div style={{ marginTop: 12, fontSize: 24, lineHeight: 1.5, color: muted }}>{causes}</div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${line}` }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: amber }}>我想研究 ▸ {field}</div>
        <div style={{ marginTop: 4, fontSize: 22, color: dim }}>我做過：{did}</div>
      </div>
    </motion.div>
  );
};

const Conclusion = () => {
  const live = useIsActivePage();
  const [ref, shown] = useStepShown();
  return (
    <motion.div
      ref={ref}
      style={{ position: 'absolute', left: PAD, top: 876, fontSize: 36, fontWeight: 700 }}
      initial={live ? { opacity: 0, y: 24 } : false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      讓載具在水下自己看得清、也算得動 —— <span style={{ color: 'var(--osd-accent)' }}>這就是我想來海下所研究的事。</span>
    </motion.div>
  );
};

const Underwater: Page = () => (
  <Frame depth={300}>
    <Header no="06" kicker="研究動機" title="到了水下，有兩個問題：看不清、跑不動" sub="專題裡遇過的問題，到了水下會更嚴重" />
    <LandPanel />
    <Steps>
      <Step duration={1}>
        <ToSea />
        <Problem
          i={0}
          title="看不清"
          field="影像處理"
          did="遮蔽幀插補、虹膜偵測與校準"
          causes={
            <>
              光線隨深度衰減 → 畫面偏藍綠
              <br />
              懸浮微粒、低光 → 模糊、雜訊
            </>
          }
        >
          <Murky />
        </Problem>
      </Step>
      <Step duration={1}>
        <Problem
          i={1}
          title="跑不動"
          field="AI 模型最佳化"
          did="手機 30 FPS、HomeLab 分層推論"
          causes={
            <>
              載具上算力、電力都有限
              <br />
              通訊受限 → 不能丟上雲端
            </>
          }
        >
          <Squeeze />
        </Problem>
      </Step>
      <Step duration={1}>
        <Conclusion />
      </Step>
    </Steps>
  </Frame>
);

// ─── Deck ────────────────────────────────────────────────────────────────────

export const meta: SlideMeta = {
  title: '李鈞盛｜中山海下所 甄試面試（第 7 頁 A 版）',
  createdAt: '2026-10-28T13:05:00.000Z',
};

export default [...deck.slice(0, 6), Underwater, ...deck.slice(7)] satisfies Page[];

export const notes: (string | undefined)[] = baseNotes.map((note, i) =>
  i === 6
    ? `（約 45 秒｜按 → 依序帶出兩個問題，最後一下帶出結論）
做專題的時候我發現，只要有遮擋、或光線不夠，關節點的信心值就會掉，骨架就開始跳。
［→］到了水下，問題會更嚴重。第一個是看不清：越深光線衰減越多，畫面會偏藍綠，水裡的懸浮微粒又讓畫面變模糊，所以我想研究影像處理，把畫面還原清楚。
［→］第二個是跑不動：載具上的算力和電力都有限，通訊也受限，沒辦法把運算丟上雲端。這剛好接上我做過的手機 30 FPS 和 HomeLab，也就是 AI 模型最佳化。
［→］讓載具在水下自己看得清、也算得動，這就是我想來海下所研究的事。`
    : note,
);
