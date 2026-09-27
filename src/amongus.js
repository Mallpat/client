// =============================================================================
// AUTHENTIC AMONG US REPLICA ART ENGINE (100% FAITHFUL TO INNERSLOTH ART STYLE)
// Vector-perfect Crewmate Beans, The Skeld Rooms, Vents, Dead Bodies & Ejections
// =============================================================================

export const CREWMATE_COLORS = [
  { id: 'red', name: 'Red', hex: '#c51111', shadow: '#7a0838', iconEmoji: '🔴' },
  { id: 'blue', name: 'Blue', hex: '#132ed1', shadow: '#09158e', iconEmoji: '🔵' },
  { id: 'green', name: 'Green', hex: '#117f2d', shadow: '#0a4d19', iconEmoji: '🟢' },
  { id: 'pink', name: 'Pink', hex: '#ed54ba', shadow: '#ab2b7e', iconEmoji: '🌸' },
  { id: 'orange', name: 'Orange', hex: '#ef7d0d', shadow: '#b33e15', iconEmoji: '🟠' },
  { id: 'yellow', name: 'Yellow', hex: '#f5f557', shadow: '#c2870e', iconEmoji: '🟡' },
  { id: 'black', name: 'Black', hex: '#3f474e', shadow: '#1e1f26', iconEmoji: '⚫' },
  { id: 'white', name: 'White', hex: '#d6e0f0', shadow: '#8394bf', iconEmoji: '⚪' },
  { id: 'purple', name: 'Purple', hex: '#6b2fbc', shadow: '#3b177c', iconEmoji: '🟣' },
  { id: 'brown', name: 'Brown', hex: '#71491e', shadow: '#45270b', iconEmoji: '🟤' },
  { id: 'cyan', name: 'Cyan', hex: '#38fedc', shadow: '#24a8be', iconEmoji: '🩵' },
  { id: 'lime', name: 'Lime', hex: '#50ef39', shadow: '#1e9e17', iconEmoji: '🟩' }
];

export const CREWMATE_HATS = [
  { id: 'none', name: 'No Hat', emoji: '🧑‍🚀' },
  { id: 'dum', name: 'DUM Note', emoji: '📝' },
  { id: 'sprout', name: 'Plant Sprout', emoji: '🌱' },
  { id: 'party', name: 'Party Hat', emoji: '🎉' },
  { id: 'redcap', name: 'Red Cap', emoji: '🧢' },
  { id: 'viking', name: 'Viking Horns', emoji: '🪖' },
  { id: 'tophat', name: 'Top Hat', emoji: '🎩' },
  { id: 'mini', name: 'Mini Crewmate', emoji: '👶' },
  { id: 'catears', name: 'Cat Ears', emoji: '🐱' },
  { id: 'cheese', name: 'Cheese Slice', emoji: '🧀' }
];

// Backward compatibility map
export function getCrewmateColor(id) {
  const c = CREWMATE_COLORS.find((item) => item.id === id);
  if (c) return c;
  // Fallback mapping for superhero ids
  const fallbackMap = {
    ironman: 'red',
    captainamerica: 'blue',
    thor: 'cyan',
    hulk: 'green',
    blackwidow: 'black',
    spiderman: 'red',
    doctorstrange: 'purple',
    blackpanther: 'purple',
    hawkeye: 'brown',
    avengerprime: 'yellow'
  };
  const mapped = fallbackMap[id] || 'red';
  return CREWMATE_COLORS.find((item) => item.id === mapped) || CREWMATE_COLORS[0];
}

// Backward-compatible getHero wrapper
export function getHero(id) {
  const col = getCrewmateColor(id);
  return {
    id: col.id,
    name: col.name,
    alias: 'Crewmate',
    roleTitle: 'Crewmate',
    primaryColor: col.hex,
    secondaryColor: col.shadow,
    visorColor: '#98d0e1',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    quote: `There is an Impostor Among Us.`,
    iconEmoji: col.iconEmoji,
    relicName: 'Half Crewmate'
  };
}

export const AVENGERS_HEROES = CREWMATE_COLORS.map((c) => ({
  id: c.id,
  name: c.name,
  alias: 'Crewmate',
  roleTitle: 'Crewmate',
  primaryColor: c.hex,
  secondaryColor: c.shadow,
  visorColor: '#98d0e1',
  glowColor: 'rgba(56, 189, 248, 0.4)',
  quote: `There is an Impostor Among Us.`,
  iconEmoji: c.iconEmoji
}));

// =============================================================================
// AUTHENTIC CREWMATE BEAN VECTOR RENDERER
// =============================================================================
export function drawCrewmate(
  ctx,
  colorId,
  hatId = 'none',
  walkCycle = 0,
  time = 0,
  isMoving = false,
  facingLeft = false,
  isGhost = false,
  _isLocal = false
) {
  const col = getCrewmateColor(colorId);
  const baseColor = col.hex;
  const shadowColor = col.shadow;

  ctx.save();

  // Face left by inverting X
  if (facingLeft) {
    ctx.scale(-1, 1);
  }

  // Slight walking body tilt
  if (isMoving && !isGhost) {
    const tilt = Math.sin(walkCycle) * 0.08;
    ctx.rotate(tilt);
  }

  // Ghost floating animation
  if (isGhost) {
    ctx.globalAlpha = 0.65;
    ctx.translate(0, Math.sin(time * 5) * 6 - 8);
  }

  const OUTLINE_COLOR = '#000000';
  const OUTLINE_WIDTH = 4.2;

  // ---------------------------------------------------------------------------
  // 1. BACKPACK / OXYGEN TANK (Drawn behind body on left side)
  // ---------------------------------------------------------------------------
  ctx.save();
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Tank base shape
  ctx.beginPath();
  ctx.roundRect(-25, -14, 12, 28, 5);
  ctx.fillStyle = baseColor;
  ctx.fill();
  ctx.stroke();

  // Tank shadow (bottom curve)
  ctx.beginPath();
  ctx.roundRect(-25, 2, 12, 12, [0, 0, 5, 5]);
  ctx.fillStyle = shadowColor;
  ctx.fill();
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 2. LEGS & FEET (Waddle walk cycle or Ghost tail)
  // ---------------------------------------------------------------------------
  if (!isGhost) {
    const legOffset1 = isMoving ? Math.sin(walkCycle) * 7 : 0;
    const legOffset2 = isMoving ? -Math.sin(walkCycle) * 7 : 0;

    // Left (Back) Leg
    ctx.save();
    ctx.lineWidth = OUTLINE_WIDTH;
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.roundRect(-15 + legOffset2 * 0.4, 12 + Math.abs(legOffset2 * 0.5), 10, 16, [0, 0, 5, 5]);
    ctx.fillStyle = shadowColor; // Back leg is in shadow
    ctx.fill();
    ctx.stroke();

    // Right (Front) Leg
    ctx.beginPath();
    ctx.roundRect(5 + legOffset1 * 0.4, 12 - Math.abs(legOffset1 * 0.5), 10, 16, [0, 0, 5, 5]);
    ctx.fillStyle = baseColor;
    ctx.fill();
    ctx.stroke();

    // Front leg bottom shadow
    ctx.beginPath();
    ctx.roundRect(5 + legOffset1 * 0.4, 20 - Math.abs(legOffset1 * 0.5), 10, 8, [0, 0, 5, 5]);
    ctx.fillStyle = shadowColor;
    ctx.fill();
    ctx.restore();
  } else {
    // Ghost wavy tail
    ctx.save();
    ctx.lineWidth = OUTLINE_WIDTH;
    ctx.strokeStyle = OUTLINE_COLOR;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.quadraticCurveTo(-10 + Math.sin(time * 6) * 5, 28, 0, 22);
    ctx.quadraticCurveTo(10 + Math.cos(time * 6) * 5, 28, 16, 12);
    ctx.closePath();
    ctx.fillStyle = shadowColor;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 3. MAIN BEAN BODY (Authentic Pill Silhouette)
  // ---------------------------------------------------------------------------
  ctx.save();
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  // Pill head & torso
  ctx.moveTo(-17, 14);
  ctx.lineTo(-17, -10);
  ctx.bezierCurveTo(-17, -30, 17, -30, 17, -10);
  ctx.lineTo(17, 14);
  ctx.bezierCurveTo(17, 20, -17, 20, -17, 14);
  ctx.closePath();

  ctx.fillStyle = baseColor;
  ctx.fill();
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 4. AUTHENTIC 2-TONE CELL SHADOW (Bottom right curved crescent)
  // ---------------------------------------------------------------------------
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-17, 14);
  ctx.lineTo(-17, -10);
  ctx.bezierCurveTo(-17, -30, 17, -30, 17, -10);
  ctx.lineTo(17, 14);
  ctx.bezierCurveTo(17, 20, -17, 20, -17, 14);
  ctx.closePath();
  ctx.clip();

  // Shadow fill
  ctx.beginPath();
  ctx.moveTo(17, -6);
  ctx.bezierCurveTo(17, 10, -5, 22, -17, 12);
  ctx.lineTo(-17, 25);
  ctx.lineTo(25, 25);
  ctx.lineTo(25, -6);
  ctx.closePath();
  ctx.fillStyle = shadowColor;
  ctx.fill();
  ctx.restore();

  // Redraw body outline on top of shadow
  ctx.beginPath();
  ctx.moveTo(-17, 14);
  ctx.lineTo(-17, -10);
  ctx.bezierCurveTo(-17, -30, 17, -30, 17, -10);
  ctx.lineTo(17, 14);
  ctx.bezierCurveTo(17, 20, -17, 20, -17, 14);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 5. SIGNATURE GLASS VISOR (Cyan, glossy specular crescent reflection)
  // ---------------------------------------------------------------------------
  ctx.save();
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Visor outer pill shape (protrudes on the right side)
  ctx.beginPath();
  ctx.roundRect(0, -18, 22, 15, 7.5);
  ctx.fillStyle = '#98d0e1'; // Main cyan glass
  ctx.fill();
  ctx.stroke();

  // Visor bottom shadow
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, -18, 22, 15, 7.5);
  ctx.clip();

  ctx.beginPath();
  ctx.roundRect(0, -10, 22, 9, 4);
  ctx.fillStyle = '#6bb5c9'; // Darker cyan visor shadow
  ctx.fill();

  // Visor curved white reflection highlight
  ctx.beginPath();
  ctx.ellipse(8, -14, 7, 2.5, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Visor stroke border
  ctx.beginPath();
  ctx.roundRect(0, -18, 22, 15, 7.5);
  ctx.stroke();
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 6. ICONIC AMONG US HATS
  // ---------------------------------------------------------------------------
  if (hatId && hatId !== 'none') {
    drawHat(ctx, hatId, time);
  }

  ctx.restore(); // Restore facingLeft inversion and transforms
}

// =============================================================================
// HAT RENDERER
// =============================================================================
function drawHat(ctx, hatId, time) {
  ctx.save();
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  switch (hatId) {
    case 'dum': {
      // Yellow sticky note on visor reading "DUM"
      ctx.translate(6, -18);
      ctx.rotate(0.08);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.rect(-8, -6, 16, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DUM', 0, 2);
      break;
    }
    case 'sprout': {
      // Plant sprout with 2 leaves
      ctx.translate(0, -28);
      // Stem
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(2, -6, 0, -12);
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Left leaf
      ctx.beginPath();
      ctx.ellipse(-6, -12, 6, 3, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Right leaf
      ctx.beginPath();
      ctx.ellipse(6, -11, 5, 2.8, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'party': {
      // Conical party hat
      ctx.translate(0, -27);
      ctx.rotate(-0.06);

      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(0, -24);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.stroke();

      // Yellow stripes
      ctx.beginPath();
      ctx.moveTo(-6, -8);
      ctx.lineTo(6, -8);
      ctx.moveTo(-3, -16);
      ctx.lineTo(3, -16);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top pom-pom
      ctx.beginPath();
      ctx.arc(0, -25, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
    case 'redcap': {
      // Backwards red baseball cap
      ctx.translate(0, -26);
      // Dome
      ctx.beginPath();
      ctx.arc(0, 0, 15, Math.PI, 0);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.stroke();

      // Visor bill (pointing backward/left)
      ctx.beginPath();
      ctx.roundRect(-22, -2, 12, 5, 2);
      ctx.fillStyle = '#b91c1c';
      ctx.fill();
      ctx.stroke();

      // White button on top
      ctx.beginPath();
      ctx.arc(0, -15, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      break;
    }
    case 'viking': {
      // Viking helmet with horns
      ctx.translate(0, -26);
      // Helmet dome
      ctx.beginPath();
      ctx.arc(0, 0, 15, Math.PI, 0);
      ctx.fillStyle = '#78716c';
      ctx.fill();
      ctx.stroke();

      // Left horn
      ctx.beginPath();
      ctx.moveTo(-14, -2);
      ctx.quadraticCurveTo(-24, -8, -20, -18);
      ctx.quadraticCurveTo(-15, -12, -10, -8);
      ctx.closePath();
      ctx.fillStyle = '#f5f5f4';
      ctx.fill();
      ctx.stroke();

      // Right horn
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.quadraticCurveTo(24, -8, 20, -18);
      ctx.quadraticCurveTo(15, -12, 10, -8);
      ctx.closePath();
      ctx.fillStyle = '#f5f5f4';
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'tophat': {
      // Black formal top hat
      ctx.translate(0, -26);
      // Brim
      ctx.beginPath();
      ctx.roundRect(-18, -3, 36, 6, 3);
      ctx.fillStyle = '#1e1f26';
      ctx.fill();
      ctx.stroke();

      // Cylinder
      ctx.beginPath();
      ctx.rect(-10, -22, 20, 19);
      ctx.fillStyle = '#2b2d38';
      ctx.fill();
      ctx.stroke();

      // Red ribbon
      ctx.beginPath();
      ctx.rect(-10, -7, 20, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      break;
    }
    case 'mini': {
      // Mini crewmate sitting on head
      ctx.translate(0, -32);
      ctx.scale(0.42, 0.42);
      drawCrewmate(ctx, 'cyan', 'none', 0, time, false, false, false, false);
      break;
    }
    case 'catears': {
      // Cat ears
      ctx.translate(0, -28);
      // Left ear
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.lineTo(-12, -12);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fillStyle = '#1e1f26';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-11, -9);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fillStyle = '#f472b6';
      ctx.fill();

      // Right ear
      ctx.beginPath();
      ctx.moveTo(14, 2);
      ctx.lineTo(12, -12);
      ctx.lineTo(4, 0);
      ctx.closePath();
      ctx.fillStyle = '#1e1f26';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(11, -9);
      ctx.lineTo(6, 0);
      ctx.closePath();
      ctx.fillStyle = '#f472b6';
      ctx.fill();
      break;
    }
    case 'cheese': {
      // Cheese wedge
      ctx.translate(0, -28);
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(14, 0);
      ctx.lineTo(4, -12);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.stroke();

      // Holes
      ctx.beginPath();
      ctx.arc(-2, -3, 2, 0, Math.PI * 2);
      ctx.arc(6, -4, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#d97706';
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

// =============================================================================
// AUTHENTIC DEAD CREWMATE BODY (Half bean with cartoon bone & blood puddle)
// =============================================================================
export function drawDeadBody(ctx, colorId, x = 0, y = 0) {
  const col = getCrewmateColor(colorId);
  const baseColor = col.hex;
  const shadowColor = col.shadow;

  ctx.save();
  ctx.translate(x || 0, y || 0);

  const OUTLINE_COLOR = '#000000';
  const OUTLINE_WIDTH = 4.2;

  // 1. Cartoon red blood puddle
  ctx.beginPath();
  ctx.ellipse(0, 14, 28, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(185, 28, 28, 0.75)';
  ctx.fill();

  // 2. Lower body half
  ctx.save();
  ctx.lineWidth = OUTLINE_WIDTH;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-18, 8);
  ctx.quadraticCurveTo(-18, 16, -10, 16);
  ctx.lineTo(-8, 16);
  ctx.lineTo(-5, 8); // Groin notch
  ctx.lineTo(-2, 16);
  ctx.lineTo(10, 16);
  ctx.quadraticCurveTo(18, 16, 18, 8);
  ctx.lineTo(18, 0);
  ctx.closePath();

  ctx.fillStyle = baseColor;
  ctx.fill();
  ctx.stroke();

  // Shadow on lower half
  ctx.save();
  ctx.clip();
  ctx.beginPath();
  ctx.roundRect(-18, 8, 36, 12, 0);
  ctx.fillStyle = shadowColor;
  ctx.fill();
  ctx.restore();

  // Retrace outline
  ctx.stroke();

  // 3. Cut meat surface (oval top of the slice)
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = shadowColor;
  ctx.fill();
  ctx.stroke();

  // 4. White cartoon bone sticking out
  ctx.beginPath();
  // Bone shaft
  ctx.rect(-3, -16, 6, 16);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.stroke();

  // Bone top knobs (two rounded lobes)
  ctx.beginPath();
  ctx.arc(-3, -16, 3.8, 0, Math.PI * 2);
  ctx.arc(3, -16, 3.8, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.stroke();

  // Bone marrow hollow dot
  ctx.beginPath();
  ctx.arc(0, -16, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#94a3b8';
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

// Backward-compatible drawFallenRelic
export function drawFallenRelic(ctx, characterId, x, y) {
  drawDeadBody(ctx, characterId, x, y);
}

// Backward-compatible drawAvenger
export function drawAvenger(
  ctx,
  characterId,
  pWalk = 0,
  time = 0,
  isMoving = false,
  facingLeft = false,
  isGhost = false,
  isLocal = false
) {
  drawCrewmate(ctx, characterId, 'none', pWalk, time, isMoving, facingLeft, isGhost, isLocal);
}

// =============================================================================
// AUTHENTIC THE SKELD FLOOR VENT (For Impostor Venting)
// =============================================================================
export function drawVent(ctx, x, y, isHovered = false) {
  ctx.save();
  ctx.translate(x, y);

  const OUTLINE_COLOR = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineJoin = 'round';

  // Vent outer steel frame
  ctx.beginPath();
  ctx.roundRect(-24, -14, 48, 28, 4);
  ctx.fillStyle = isHovered ? '#64748b' : '#334155';
  ctx.fill();
  ctx.stroke();

  // Vent inner shadow
  ctx.beginPath();
  ctx.roundRect(-20, -10, 40, 20, 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Vent metal slats
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = isHovered ? '#94a3b8' : '#475569';
  for (let sx = -14; sx <= 14; sx += 7) {
    ctx.beginPath();
    ctx.moveTo(sx, -8);
    ctx.lineTo(sx, 8);
    ctx.stroke();
  }

  // Corner bolts
  ctx.fillStyle = '#94a3b8';
  [-20, 20].forEach((bx) => {
    [-10, 10].forEach((by) => {
      ctx.beginPath();
      ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.restore();
}

// =============================================================================
// AUTHENTIC EJECTION CUTSCENE (Crewmate drifting through black starry space)
// =============================================================================
export function drawThanosSnap(ctx, characterId, progress, time, width, height, customMsg = null) {
  // Starfield backdrop
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Twinkling stars moving past
  for (let i = 0; i < 90; i++) {
    const sx = ((i * 137.5 + time * (i % 3 === 0 ? 80 : 35)) % width);
    const sy = (i * 83.2) % height;
    const r = i % 5 === 0 ? 2 : 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tumbling Crewmate drifting from left to right across center
  const crewmateX = width * 0.15 + progress * (width * 0.7);
  const crewmateY = height * 0.5 + Math.sin(progress * Math.PI) * -30;
  const rotation = progress * Math.PI * 4; // 2 full slow spins

  ctx.save();
  ctx.translate(crewmateX, crewmateY);
  ctx.rotate(rotation);
  ctx.scale(1.2, 1.2);
  drawCrewmate(ctx, characterId, 'none', 0, time, false, false, false, false);
  ctx.restore();

  // Text subtitle
  if (customMsg && progress > 0.25) {
    const textAlpha = Math.min(1, (progress - 0.25) * 4);
    ctx.save();
    ctx.globalAlpha = textAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(customMsg, width / 2, height * 0.82);
    ctx.restore();
  }
}
