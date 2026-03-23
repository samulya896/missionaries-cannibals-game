import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   BFS SOLVER
═══════════════════════════════════════════════════════ */
function bfsSolve() {
  const start = { mL: 3, cL: 3, boat: "left", path: [] };
  const visited = new Set();
  const queue = [start];
  const key = (s) => `${s.mL},${s.cL},${s.boat}`;
  while (queue.length) {
    const state = queue.shift();
    const k = key(state);
    if (visited.has(k)) continue;
    visited.add(k);
    if (state.mL === 0 && state.cL === 0 && state.boat === "right") return state.path;
    const mR = 3 - state.mL, cR = 3 - state.cL;
    for (const [dm, dc] of [[1,0],[2,0],[0,1],[0,2],[1,1]]) {
      let nmL, ncL;
      if (state.boat === "left") {
        if (dm > state.mL || dc > state.cL) continue;
        nmL = state.mL - dm; ncL = state.cL - dc;
      } else {
        if (dm > mR || dc > cR) continue;
        nmL = state.mL + dm; ncL = state.cL + dc;
      }
      const nmR = 3 - nmL, ncR = 3 - ncL;
      if ((nmL > 0 && ncL > nmL) || (nmR > 0 && ncR > nmR)) continue;
      const next = { mL: nmL, cL: ncL, boat: state.boat === "left" ? "right" : "left", path: [...state.path, { dm, dc, from: state.boat }] };
      if (!visited.has(key(next))) queue.push(next);
    }
  }
  return null;
}

function validateMove(mL, cL, boat, dm, dc) {
  const mR = 3 - mL, cR = 3 - cL;
  let nmL, ncL;
  if (boat === "left") {
    if (dm > mL || dc > cL) return { valid: false, reason: "Not enough people on left bank!" };
    nmL = mL - dm; ncL = cL - dc;
  } else {
    if (dm > mR || dc > cR) return { valid: false, reason: "Not enough people on right bank!" };
    nmL = mL + dm; ncL = cL + dc;
  }
  const nmR = 3 - nmL, ncR = 3 - ncL;
  if (nmL > 0 && ncL > nmL) return { valid: false, reason: "Cannibals outnumber missionaries on LEFT!" };
  if (nmR > 0 && ncR > nmR) return { valid: false, reason: "Cannibals outnumber missionaries on RIGHT!" };
  return { valid: true, nmL, ncL };
}

/* ═══════════════════════════════════════════════════════
   PIXEL ART SVG CHARACTERS
═══════════════════════════════════════════════════════ */
const MissionarySprite = ({ size = 32, bounce = false }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{
    imageRendering: "pixelated",
    animation: bounce ? "pixelBounce 0.5s steps(2) infinite" : "none",
  }}>
    {/* robe white */}
    <rect x="5" y="8" width="6" height="7" fill="#f0f0f0"/>
    {/* cross on robe */}
    <rect x="7" y="9" width="2" height="4" fill="#4a90d9"/>
    <rect x="6" y="10" width="4" height="2" fill="#4a90d9"/>
    {/* head */}
    <rect x="5" y="3" width="6" height="5" fill="#f5c89a"/>
    {/* eyes */}
    <rect x="6" y="5" width="1" height="1" fill="#2c1810"/>
    <rect x="9" y="5" width="1" height="1" fill="#2c1810"/>
    {/* halo */}
    <rect x="4" y="1" width="8" height="2" fill="none" stroke="#FFD700" strokeWidth="1"/>
    <rect x="5" y="2" width="6" height="1" fill="#FFD700" opacity="0.6"/>
    {/* feet */}
    <rect x="5" y="14" width="2" height="2" fill="#8B6914"/>
    <rect x="9" y="14" width="2" height="2" fill="#8B6914"/>
  </svg>
);

const CannibalSprite = ({ size = 32, bounce = false }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{
    imageRendering: "pixelated",
    animation: bounce ? "pixelBounce 0.5s steps(2) infinite" : "none",
  }}>
    {/* body */}
    <rect x="5" y="8" width="6" height="7" fill="#8B4513"/>
    {/* tribal pattern */}
    <rect x="5" y="9" width="1" height="2" fill="#FF6B00"/>
    <rect x="10" y="9" width="1" height="2" fill="#FF6B00"/>
    <rect x="7" y="11" width="2" height="1" fill="#FF6B00"/>
    {/* head */}
    <rect x="5" y="3" width="6" height="5" fill="#c8845a"/>
    {/* eyes — menacing */}
    <rect x="6" y="5" width="1" height="1" fill="#ff2200"/>
    <rect x="9" y="5" width="1" height="1" fill="#ff2200"/>
    {/* bone headband */}
    <rect x="4" y="3" width="8" height="1" fill="#f0f0f0"/>
    <rect x="5" y="2" width="1" height="2" fill="#f0f0f0"/>
    <rect x="10" y="2" width="1" height="2" fill="#f0f0f0"/>
    {/* feet */}
    <rect x="5" y="14" width="2" height="2" fill="#5a2d0c"/>
    <rect x="9" y="14" width="2" height="2" fill="#5a2d0c"/>
  </svg>
);

/* Pixel tree */
const PixelTree = ({ x, flip }) => (
  <g transform={`translate(${x},0)${flip ? " scale(-1,1) translate(-40,0)" : ""}`}>
    <rect x="16" y="30" width="8" height="20" fill="#5a3010"/>
    <rect x="8"  y="18" width="24" height="14" fill="#2d7a1f"/>
    <rect x="4"  y="10" width="32" height="12" fill="#3a9427"/>
    <rect x="10" y="4"  width="20" height="10" fill="#2d7a1f"/>
  </g>
);

/* Pixel cloud */
const PixelCloud = ({ x, y }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="8"  y="8"  width="32" height="12" fill="white" opacity="0.9"/>
    <rect x="4"  y="4"  width="20" height="12" fill="white" opacity="0.9"/>
    <rect x="20" y="2"  width="16" height="12" fill="white" opacity="0.9"/>
  </g>
);

/* ═══════════════════════════════════════════════════════
   PIXEL BUTTON
═══════════════════════════════════════════════════════ */
const PixelBtn = ({ children, onClick, disabled, color = "#4a7c2f", small }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: small ? 8 : 10,
        color: disabled ? "#888" : "#fff",
        background: disabled ? "#444" : (pressed ? color : color),
        border: "none",
        outline: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: small ? "8px 10px" : "10px 14px",
        imageRendering: "pixelated",
        position: "relative",
        textShadow: disabled ? "none" : "2px 2px 0 #000",
        boxShadow: pressed || disabled
          ? `inset 4px 4px 0 rgba(0,0,0,0.4), inset -2px -2px 0 rgba(255,255,255,0.1)`
          : `4px 4px 0 rgba(0,0,0,0.5), inset -3px -3px 0 rgba(0,0,0,0.3), inset 3px 3px 0 rgba(255,255,255,0.2)`,
        transform: pressed ? "translate(2px,2px)" : "translate(0,0)",
        transition: "transform 0.05s, box-shadow 0.05s",
        letterSpacing: "0.02em",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >{children}</button>
  );
};

/* ═══════════════════════════════════════════════════════
   PIXEL TOKEN (clickable character on bank)
═══════════════════════════════════════════════════════ */
const PixelToken = ({ type, onClick, disabled, inBoat }) => {
  const [hovered, setHovered] = useState(false);
  const size = inBoat ? 28 : 34;
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: disabled ? "default" : "pointer",
        transform: hovered && !disabled ? "translateY(-4px) scale(1.1)" : "translateY(0) scale(1)",
        transition: "transform 0.12s steps(2)",
        filter: hovered && !disabled
          ? `drop-shadow(0 0 6px ${type === "M" ? "#FFD700" : "#FF6B00"})`
          : "drop-shadow(2px 2px 0 rgba(0,0,0,0.5))",
        display: "flex", flexDirection: "column", alignItems: "center",
        userSelect: "none",
      }}
    >
      {type === "M" ? <MissionarySprite size={size} bounce={false} /> : <CannibalSprite size={size} bounce={false} />}
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 6,
        color: type === "M" ? "#FFD700" : "#FF6B00",
        marginTop: 2,
        textShadow: "1px 1px 0 #000",
      }}>{type === "M" ? "M" : "C"}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN GAME
═══════════════════════════════════════════════════════ */
export default function PixelMC() {
  const [mL, setML] = useState(3);
  const [cL, setCL] = useState(3);
  const [boat, setBoat] = useState("left");
  const [boatM, setBoatM] = useState(0);
  const [boatC, setBoatC] = useState(0);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("info"); // "info"|"error"|"ok"
  const [solving, setSolving] = useState(false);
  const [solvePath, setSolvePath] = useState(null);
  const [solveStep, setSolveStep] = useState(0);
  const [speed, setSpeed] = useState(900);
  const [boatAnim, setBoatAnim] = useState(false); // "toRight"|"toLeft"|false
  const [screen, setScreen] = useState("menu"); // "menu"|"game"|"win"
  const solveRef = useRef(null);

  const mR = 3 - mL - (boatAnim ? 0 : boatM * (boat === "left" ? 0 : 1));
  const cR = 3 - cL - (boatAnim ? 0 : boatC * (boat === "left" ? 0 : 1));

  const showMsg = (txt, type = "info") => { setMessage(txt); setMsgType(type); };

  const addToBoat = (type) => {
    if (status !== "playing" || solving || boatAnim) return;
    if (boatM + boatC >= 2) { showMsg("BOAT FULL! MAX 2", "error"); return; }
    if (type === "M") {
      const avail = boat === "left" ? mL : (3 - mL);
      if (boatM >= avail) { showMsg("NO MORE MISSIONARIES!", "error"); return; }
      setBoatM(b => b + 1);
    } else {
      const avail = boat === "left" ? cL : (3 - cL);
      if (boatC >= avail) { showMsg("NO MORE CANNIBALS!", "error"); return; }
      setBoatC(b => b + 1);
    }
    setMessage("");
  };

  const removeFromBoat = (type) => {
    if (solving || boatAnim) return;
    if (type === "M" && boatM > 0) { setBoatM(b => b - 1); setMessage(""); }
    if (type === "C" && boatC > 0) { setBoatC(b => b - 1); setMessage(""); }
  };

  const moveBoat = useCallback(() => {
    if (boatM + boatC === 0) { showMsg("ADD SOMEONE TO BOAT!", "error"); return; }
    if (boatAnim) return;
    const res = validateMove(mL, cL, boat, boatM, boatC);
    if (!res.valid) { showMsg("⚠ " + res.reason, "error"); return; }
    setBoatAnim(boat === "left" ? "toRight" : "toLeft");
    setTimeout(() => {
      setML(res.nmL); setCL(res.ncL);
      setBoat(b => b === "left" ? "right" : "left");
      setBoatM(0); setBoatC(0);
      setMoves(m => m + 1);
      setBoatAnim(false);
      showMsg("", "info");
      if (res.nmL === 0 && res.ncL === 0 && boat === "left") {
        setTimeout(() => setScreen("win"), 400);
        setStatus("won");
      }
    }, 600);
  }, [mL, cL, boat, boatM, boatC, boatAnim]);

  const reset = () => {
    setML(3); setCL(3); setBoat("left");
    setBoatM(0); setBoatC(0); setMoves(0);
    setStatus("playing"); setMessage(""); setBoatAnim(false);
    setSolvePath(null); setSolveStep(0); setSolving(false);
    if (solveRef.current) clearTimeout(solveRef.current);
  };

  const startSolve = () => {
    if (solving) { setSolving(false); if (solveRef.current) clearTimeout(solveRef.current); return; }
    reset();
    const path = bfsSolve();
    setSolvePath(path); setSolveStep(0); setSolving(true);
  };

  // Animate solve
  useEffect(() => {
    if (!solving || !solvePath) return;
    if (solveStep >= solvePath.length) { setSolving(false); return; }
    const step = solvePath[solveStep];
    solveRef.current = setTimeout(() => {
      const dir = step.from === "left" ? "toRight" : "toLeft";
      setBoatAnim(dir);
      showMsg(`STEP ${solveStep+1}/${solvePath.length}: ${step.dm}M + ${step.dc}C ${step.from === "left" ? ">>>" : "<<<"}`, "ok");
      setTimeout(() => {
        setML(prev => step.from === "left" ? prev - step.dm : prev + step.dm);
        setCL(prev => step.from === "left" ? prev - step.dc : prev + step.dc);
        setBoat(b => b === "left" ? "right" : "left");
        setMoves(m => m + 1); setBoatAnim(false);
        setSolveStep(s => s + 1);
      }, 500);
    }, speed);
    return () => clearTimeout(solveRef.current);
  }, [solving, solveStep, solvePath, speed]);

  useEffect(() => {
    if (mL === 0 && cL === 0 && boat === "right" && status === "playing") {
      setStatus("won"); setTimeout(() => setScreen("win"), 400);
    }
  }, [mL, cL, boat, status]);

  /* ─── MENU SCREEN ─────────────────────────────────── */
  if (screen === "menu") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#1a0e2e", fontFamily:"'Press Start 2P', monospace", overflow:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes pixelBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes cloudDrift { from{transform:translateX(-60px)} to{transform:translateX(110vw)} }
        @keyframes titlePulse { 0%,100%{filter:drop-shadow(0 0 8px #FFD700)} 50%{filter:drop-shadow(0 0 20px #FFD700) drop-shadow(0 0 40px #FFA500)} }
        @keyframes boatSail { 0%{transform:translateX(0) translateY(0)} 25%{transform:translateX(10px) translateY(-3px)} 50%{transform:translateX(20px) translateY(0)} 75%{transform:translateX(10px) translateY(-2px)} 100%{transform:translateX(0) translateY(0)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes starTwinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes grassWave { 0%,100%{transform:skewX(0)} 50%{transform:skewX(2deg)} }
        @keyframes boatMoveRight { from{left:12%} to{left:68%} }
        @keyframes boatMoveLeft  { from{left:68%} to{left:12%} }
        @keyframes waterWave { 0%{background-position:0 0} 100%{background-position:64px 0} }
        @keyframes coinSpin { 0%{transform:scaleX(1)} 25%{transform:scaleX(0.1)} 50%{transform:scaleX(1)} 75%{transform:scaleX(0.1)} 100%{transform:scaleX(1)} }
        @keyframes flagWave { 0%,100%{transform:skewY(0)} 50%{transform:skewY(5deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes winFlash { 0%,100%{background:#1a0e2e} 50%{background:#0a2e1a} }
      `}</style>

      {/* Sky background */}
      <div style={{ position:"fixed", inset:0, background:"linear-gradient(180deg, #1a0e2e 0%, #2d1b69 30%, #4a2f8a 55%, #6b47c2 70%, #87CEEB 100%)", zIndex:0 }} />

      {/* Stars */}
      {[...Array(40)].map((_,i) => (
        <div key={i} style={{ position:"fixed", width:2, height:2, background:"white", borderRadius:"50%", top:`${Math.random()*60}%`, left:`${Math.random()*100}%`, animation:`starTwinkle ${1.5+Math.random()*2}s steps(2) infinite`, animationDelay:`${Math.random()*3}s`, zIndex:0, imageRendering:"pixelated" }} />
      ))}

      {/* Clouds */}
      <svg style={{ position:"fixed", top:"15%", left:"-100px", width:80, height:40, animation:"cloudDrift 18s linear infinite", zIndex:1, imageRendering:"pixelated" }} viewBox="0 0 80 40">
        <PixelCloud x={0} y={0} />
      </svg>
      <svg style={{ position:"fixed", top:"25%", left:"-200px", width:80, height:40, animation:"cloudDrift 25s linear infinite 5s", zIndex:1, imageRendering:"pixelated" }} viewBox="0 0 80 40">
        <PixelCloud x={0} y={0} />
      </svg>

      {/* Ground */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, height:80, background:"#3a7a1f", borderTop:"4px solid #2d5c15", zIndex:2 }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:8, background:"#5aaa2f" }} />
        {[...Array(20)].map((_,i) => (
          <div key={i} style={{ position:"absolute", bottom:0, left:`${i*5.5}%`, width:16, height:16, background:"#8B6914", imageRendering:"pixelated" }} />
        ))}
      </div>

      {/* Trees on sides */}
      <svg style={{ position:"fixed", bottom:72, left:"2%", width:80, height:100, zIndex:3, imageRendering:"pixelated" }} viewBox="0 0 80 100">
        <PixelTree x={0} />
        <PixelTree x={45} />
      </svg>
      <svg style={{ position:"fixed", bottom:72, right:"2%", width:80, height:100, zIndex:3, imageRendering:"pixelated" }} viewBox="0 0 80 100">
        <PixelTree x={0} flip />
        <PixelTree x={45} flip />
      </svg>

      {/* Scanline effect */}
      <div style={{ position:"fixed", inset:0, background:"repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)", zIndex:10, pointerEvents:"none" }} />

      {/* Main menu panel */}
      <div style={{ position:"relative", zIndex:5, display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>

        {/* Title sign — wooden board */}
        <div style={{ animation:"titlePulse 3s ease-in-out infinite", marginBottom:8 }}>
          <div style={{
            background:"linear-gradient(135deg, #8B5e1a, #c8930a, #8B5e1a)",
            border:"6px solid #5a3010",
            boxShadow:"6px 6px 0 #2c1808, inset 0 2px 0 rgba(255,255,255,0.2)",
            padding:"16px 32px",
            position:"relative",
          }}>
            {/* Bolts */}
            {[[6,6],[6,"auto"],[null,6],[null,"auto"]].map((_,i) => (
              <div key={i} style={{ position:"absolute", width:10, height:10, background:"#888", border:"2px solid #555", borderRadius:"50%", ...(i===0?{top:4,left:4}:i===1?{top:4,right:4}:i===2?{bottom:4,left:4}:{bottom:4,right:4}) }} />
            ))}
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:"clamp(10px,2.5vw,18px)", color:"#FFD700", textShadow:"3px 3px 0 #000, -1px -1px 0 #8B4500", letterSpacing:"0.05em", textAlign:"center", lineHeight:1.6 }}>
              MISSIONARIES<br/>& CANNIBALS
            </div>
            <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, color:"#f0c060", textAlign:"center", marginTop:6, textShadow:"1px 1px 0 #000" }}>RIVER CROSSING PUZZLE</div>
          </div>
        </div>

        {/* Characters preview */}
        <div style={{ display:"flex", gap:24, alignItems:"flex-end", marginBottom:4 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ animation:`pixelBounce ${0.6+i*0.15}s steps(2) infinite`, animationDelay:`${i*0.2}s` }}>
              <MissionarySprite size={40} />
            </div>
          ))}
          <div style={{ width:4 }} />
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ animation:`pixelBounce ${0.7+i*0.15}s steps(2) infinite`, animationDelay:`${i*0.15}s` }}>
              <CannibalSprite size={40} />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <PixelBtn onClick={() => { reset(); setScreen("game"); }} color="#2d7a1f">▶ START GAME</PixelBtn>

        {/* Blink press start */}
        <div style={{ fontFamily:"'Press Start 2P', monospace", fontSize:8, color:"#FFD700", animation:"blink 1s steps(1) infinite", textShadow:"2px 2px 0 #000" }}>
          PRESS START
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:16, marginTop:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <MissionarySprite size={20} />
            <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:6, color:"#b8d0f8", textShadow:"1px 1px 0 #000" }}>MISSIONARY</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <CannibalSprite size={20} />
            <span style={{ fontFamily:"'Press Start 2P', monospace", fontSize:6, color:"#f8a88a", textShadow:"1px 1px 0 #000" }}>CANNIBAL</span>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─── WIN SCREEN ──────────────────────────────────── */
  if (screen === "win") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0a1a08", fontFamily:"'Press Start 2P', monospace", animation:"winFlash 1s steps(2) 3" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
      <div style={{ textAlign:"center", padding:32, border:"8px solid #FFD700", boxShadow:"0 0 0 4px #8B6914, 0 0 40px #FFD700", background:"#1a2e08" }}>
        <div style={{ fontSize:"clamp(12px,3vw,20px)", color:"#FFD700", textShadow:"4px 4px 0 #000", marginBottom:16, lineHeight:2 }}>
          🏆 YOU WIN! 🏆
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:20 }}>
          {[...Array(3)].map((_,i) => <MissionarySprite key={i} size={36} bounce />)}
          {[...Array(3)].map((_,i) => <CannibalSprite key={i} size={36} bounce />)}
        </div>
        <div style={{ fontSize:9, color:"#8fdb8f", marginBottom:24, lineHeight:2 }}>
          COMPLETED IN<br/>
          <span style={{ color:"#FFD700", fontSize:16 }}>{moves}</span><br/>
          MOVES
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <PixelBtn onClick={() => { reset(); setScreen("game"); }} color="#2d7a1f">▶ PLAY AGAIN</PixelBtn>
          <PixelBtn onClick={() => { reset(); setScreen("menu"); }} color="#4a2f8a">⌂ MENU</PixelBtn>
        </div>
      </div>
    </div>
  );

  /* ─── GAME SCREEN ─────────────────────────────────── */
  const boatOnLeft = boat === "left";
  const mLShow = mL;
  const cLShow = cL;
  const mRShow = 3 - mL;
  const cRShow = 3 - cL;

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", background:"#1a0e2e", fontFamily:"'Press Start 2P', monospace", overflow:"hidden", position:"relative", userSelect:"none" }}>

      {/* Sky */}
      <div style={{ position:"fixed", inset:0, background:"linear-gradient(180deg, #1a0e2e 0%, #2a5298 40%, #5ba0d0 65%, #87CEEB 100%)", zIndex:0 }} />

      {/* Scanlines */}
      <div style={{ position:"fixed", inset:0, background:"repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)", zIndex:20, pointerEvents:"none" }} />

      {/* Clouds */}
      <svg style={{ position:"fixed", top:"8%", left:"5%", width:80, height:40, zIndex:1, imageRendering:"pixelated", animation:"cloudDrift 30s linear infinite 2s" }} viewBox="0 0 80 40"><PixelCloud x={0} y={0} /></svg>
      <svg style={{ position:"fixed", top:"15%", right:"10%", width:60, height:30, zIndex:1, imageRendering:"pixelated", animation:"cloudDrift 22s linear infinite 8s reverse" }} viewBox="0 0 80 40"><PixelCloud x={0} y={0} /></svg>

      {/* HUD bar */}
      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:700, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", background:"rgba(0,0,0,0.7)", borderBottom:"4px solid #FFD700", boxSizing:"border-box" }}>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <PixelBtn onClick={() => { reset(); setScreen("menu"); }} color="#5a1a1a" small>⌂</PixelBtn>
          <div style={{ fontSize:8, color:"#FFD700", textShadow:"2px 2px 0 #000" }}>MOVES: <span style={{ color:"white" }}>{moves}</span></div>
        </div>
        <div style={{ fontSize:7, color:"#8fdb8f", textShadow:"1px 1px 0 #000" }}>
          BOAT: <span style={{ color:"#FFD700" }}>{boatOnLeft ? "◄ LEFT" : "RIGHT ►"}</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[["S",1400],["M",900],["F",450]].map(([l,v]) => (
            <button key={l} onClick={() => setSpeed(v)} style={{ fontFamily:"'Press Start 2P', monospace", fontSize:7, padding:"4px 8px", background: speed===v ? "#FFD700" : "#333", color: speed===v ? "#000" : "#aaa", border:"2px solid #555", cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Message bar */}
      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:700, minHeight:30, background: msgType==="error" ? "#5a0a0a" : msgType==="ok" ? "#0a3a0a" : "#0a0a2a", borderBottom:`3px solid ${msgType==="error"?"#ff4444":msgType==="ok"?"#44ff44":"#224"}`, display:"flex", alignItems:"center", justifyContent:"center", padding:"6px", boxSizing:"border-box" }}>
        <span style={{ fontSize:7, color: msgType==="error"?"#ff8888":msgType==="ok"?"#88ff88":"#aaaacc", textShadow:"1px 1px 0 #000", textAlign:"center", letterSpacing:"0.05em" }}>
          {message || (status==="playing" ? (boatOnLeft ? "CLICK LEFT BANK TO BOARD BOAT" : "CLICK RIGHT BANK TO BOARD BOAT") : "")}
        </span>
      </div>

      {/* GAME SCENE */}
      <div style={{ position:"relative", zIndex:5, width:"100%", maxWidth:700, flex:1, display:"flex", flexDirection:"column" }}>

        {/* Scene */}
        <div style={{ position:"relative", flex:1, minHeight:260, display:"flex" }}>

          {/* ── LEFT BANK ── */}
          <div style={{
            width:"28%", background:"linear-gradient(180deg, #4a7c2f 0%, #3a6a20 60%, #2d5218 100%)",
            borderRight:"4px solid #2d5218", display:"flex", flexDirection:"column", alignItems:"center",
            paddingTop:16, gap:8, position:"relative",
            boxShadow:"inset -8px 0 16px rgba(0,0,0,0.3)",
          }}>
            {/* Grass top */}
            <div style={{ position:"absolute", top:0, left:0, right:0, height:6, background:"#5aaa2f", borderBottom:"2px solid #3a8a1f" }} />
            {/* Tree decoration */}
            <svg style={{ position:"absolute", bottom:0, right:0, width:40, height:60, imageRendering:"pixelated", opacity:0.6 }} viewBox="0 0 40 60">
              <PixelTree x={0} />
            </svg>

            <div style={{ fontSize:6, color:"#FFD700", textShadow:"1px 1px 0 #000", zIndex:2, marginTop:4 }}>◄ LEFT BANK</div>

            {/* Missionaries */}
            <div style={{ zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <div style={{ fontSize:5, color:"#b8d0f8", textShadow:"1px 1px 0 #000" }}>M×{mLShow}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center", maxWidth:90 }}>
                {[...Array(mLShow)].map((_,i) => (
                  <PixelToken key={i} type="M" disabled={!boatOnLeft || status!=="playing" || solving || boatAnim} onClick={() => addToBoat("M")} />
                ))}
                {mLShow===0 && <div style={{ fontSize:6, color:"rgba(255,255,255,0.3)", padding:8 }}>—</div>}
              </div>
            </div>

            {/* Cannibals */}
            <div style={{ zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <div style={{ fontSize:5, color:"#f8a88a", textShadow:"1px 1px 0 #000" }}>C×{cLShow}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center", maxWidth:90 }}>
                {[...Array(cLShow)].map((_,i) => (
                  <PixelToken key={i} type="C" disabled={!boatOnLeft || status!=="playing" || solving || boatAnim} onClick={() => addToBoat("C")} />
                ))}
                {cLShow===0 && <div style={{ fontSize:6, color:"rgba(255,255,255,0.3)", padding:8 }}>—</div>}
              </div>
            </div>

            {/* Active glow */}
            {boatOnLeft && <div style={{ position:"absolute", inset:0, border:"3px solid #FFD700", boxShadow:"inset 0 0 20px rgba(255,215,0,0.15)", pointerEvents:"none" }} />}
          </div>

          {/* ── RIVER ── */}
          <div style={{
            flex:1, position:"relative", overflow:"hidden",
            background:"linear-gradient(180deg, #1a6b9a 0%, #1a8fbf 40%, #1578a8 100%)",
          }}>
            {/* Water pattern */}
            <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 4px, transparent 4px, transparent 16px)", animation:"waterWave 2s linear infinite" }} />
            {/* Wave lines */}
            {[20,38,56,74,88].map((top,i) => (
              <div key={i} style={{ position:"absolute", top:`${top}%`, left:"5%", right:"5%", height:2, background:`rgba(255,255,255,${0.1+i*0.03})`, borderRadius:1, animation:`ripple ${1.5+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.2}s` }} />
            ))}
            <div style={{ position:"absolute", top:6, left:"50%", transform:"translateX(-50%)", fontSize:6, color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap" }}>~ RIVER ~</div>

            {/* BOAT */}
            <div style={{
              position:"absolute", bottom:"20%", left: boatOnLeft ? "10%" : "58%",
              transition: boatAnim ? `left 0.6s steps(12)` : "left 0.3s steps(6)",
              zIndex:5, display:"flex", flexDirection:"column", alignItems:"center",
            }}>
              {/* Passengers */}
              <div style={{ display:"flex", gap:4, marginBottom:4, minHeight:30, alignItems:"flex-end" }}>
                {[...Array(boatM)].map((_,i) => (
                  <div key={i} onClick={() => removeFromBoat("M")} style={{ cursor:"pointer", animation:"pixelBounce 0.6s steps(2) infinite" }}>
                    <MissionarySprite size={24} />
                  </div>
                ))}
                {[...Array(boatC)].map((_,i) => (
                  <div key={i} onClick={() => removeFromBoat("C")} style={{ cursor:"pointer", animation:"pixelBounce 0.7s steps(2) infinite" }}>
                    <CannibalSprite size={24} />
                  </div>
                ))}
                {boatM+boatC===0 && <div style={{ fontSize:5, color:"rgba(255,255,255,0.4)", width:50, textAlign:"center", paddingBottom:4 }}>EMPTY</div>}
              </div>
              {/* Boat hull */}
              <svg width="80" height="36" viewBox="0 0 80 36" style={{ imageRendering:"pixelated" }}>
                <rect x="4" y="8"  width="72" height="20" fill="#8B5e1a"/>
                <rect x="0" y="16" width="80" height="12" fill="#c8930a"/>
                <rect x="4" y="26" width="72" height="6"  fill="#5a3010"/>
                <rect x="8" y="28" width="64" height="4"  rx="2" fill="#8B5e1a" opacity="0.5"/>
                {/* planks */}
                <rect x="20" y="8"  width="2" height="20" fill="#5a3010" opacity="0.5"/>
                <rect x="40" y="8"  width="2" height="20" fill="#5a3010" opacity="0.5"/>
                <rect x="60" y="8"  width="2" height="20" fill="#5a3010" opacity="0.5"/>
                {/* capacity dots */}
                <rect x="30" y="2" width="6" height="6" fill={boatM+boatC>=1?"#FFD700":"#555"} />
                <rect x="44" y="2" width="6" height="6" fill={boatM+boatC>=2?"#FFD700":"#555"} />
              </svg>
              <div style={{ fontSize:5, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{boatM+boatC}/2</div>
            </div>
          </div>

          {/* ── RIGHT BANK ── */}
          <div style={{
            width:"28%", background:"linear-gradient(180deg, #4a7c2f 0%, #3a6a20 60%, #2d5218 100%)",
            borderLeft:"4px solid #2d5218", display:"flex", flexDirection:"column", alignItems:"center",
            paddingTop:16, gap:8, position:"relative",
            boxShadow:"inset 8px 0 16px rgba(0,0,0,0.3)",
          }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:6, background:"#5aaa2f", borderBottom:"2px solid #3a8a1f" }} />
            <svg style={{ position:"absolute", bottom:0, left:0, width:40, height:60, imageRendering:"pixelated", opacity:0.6 }} viewBox="0 0 40 60">
              <PixelTree x={0} flip />
            </svg>

            <div style={{ fontSize:6, color:"#FFD700", textShadow:"1px 1px 0 #000", zIndex:2, marginTop:4 }}>RIGHT BANK ►</div>

            <div style={{ zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <div style={{ fontSize:5, color:"#b8d0f8", textShadow:"1px 1px 0 #000" }}>M×{mRShow}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center", maxWidth:90 }}>
                {[...Array(mRShow)].map((_,i) => (
                  <PixelToken key={i} type="M" disabled={boatOnLeft || status!=="playing" || solving || boatAnim} onClick={() => addToBoat("M")} />
                ))}
                {mRShow===0 && <div style={{ fontSize:6, color:"rgba(255,255,255,0.3)", padding:8 }}>—</div>}
              </div>
            </div>

            <div style={{ zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <div style={{ fontSize:5, color:"#f8a88a", textShadow:"1px 1px 0 #000" }}>C×{cRShow}</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, justifyContent:"center", maxWidth:90 }}>
                {[...Array(cRShow)].map((_,i) => (
                  <PixelToken key={i} type="C" disabled={boatOnLeft || status!=="playing" || solving || boatAnim} onClick={() => addToBoat("C")} />
                ))}
                {cRShow===0 && <div style={{ fontSize:6, color:"rgba(255,255,255,0.3)", padding:8 }}>—</div>}
              </div>
            </div>

            {!boatOnLeft && <div style={{ position:"absolute", inset:0, border:"3px solid #FFD700", boxShadow:"inset 0 0 20px rgba(255,215,0,0.15)", pointerEvents:"none" }} />}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ background:"rgba(0,0,0,0.8)", borderTop:"4px solid #333", padding:"12px 16px", display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", alignItems:"center", zIndex:10 }}>
          <PixelBtn
            onClick={moveBoat}
            disabled={status!=="playing" || solving || boatM+boatC===0 || !!boatAnim}
            color="#1a5a8a"
          >
            ⛵ {boatOnLeft ? "SAIL >>>" : "<<< SAIL"}
          </PixelBtn>

          <PixelBtn
            onClick={startSolve}
            disabled={status==="won"}
            color={solving ? "#7a1a1a" : "#5a3a8a"}
          >
            {solving ? "⏹ STOP AI" : "🤖 AUTO SOLVE"}
          </PixelBtn>

          <PixelBtn onClick={reset} color="#4a3a0a">
            ↺ RESET
          </PixelBtn>
        </div>

        {/* Instructions */}
        <div style={{ background:"rgba(0,0,0,0.6)", borderTop:"2px solid #222", padding:"6px 16px", display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", zIndex:10 }}>
          <span style={{ fontSize:5, color:"#7a9bb5" }}>CLICK TOKENS ON ACTIVE BANK TO BOARD</span>
          <span style={{ fontSize:5, color:"#7a9bb5" }}>CLICK BOAT TOKENS TO UNBOARD</span>
          <span style={{ fontSize:5, color:"#7a9bb5" }}>GOAL: MOVE ALL 6 TO RIGHT BANK</span>
        </div>
      </div>
    </div>
  );
}
