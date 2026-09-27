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
// AUTHENTIC THE SKELD INTERCONNECTED VENT NETWORKS
// =============================================================================
export const VENTS = [
  // Network 1 (North/East/Cafeteria Loop)
  { id: 'vent_cafe_n', name: 'Cafeteria Vent', x: 2180, y: 1120, network: 1, connections: ['vent_bridge', 'vent_sensors'] },
  { id: 'vent_bridge', name: 'Command Bridge Vent', x: 2180, y: 320, network: 1, connections: ['vent_cafe_n', 'vent_sensors'] },
  { id: 'vent_sensors', name: 'Sensors Array Vent', x: 2680, y: 320, network: 1, connections: ['vent_bridge', 'vent_cafe_n'] },

  // Network 2 (West Wing: Mainframe / Security Vault / Cafeteria South)
  { id: 'vent_mainframe', name: 'Mainframe Vent', x: 420, y: 350, network: 2, connections: ['vent_vault', 'vent_cafe_s'] },
  { id: 'vent_vault', name: 'Security Vault Vent', x: 420, y: 1250, network: 2, connections: ['vent_mainframe', 'vent_cafe_s'] },
  { id: 'vent_cafe_s', name: 'Cafeteria South Vent', x: 1420, y: 1580, network: 2, connections: ['vent_vault', 'vent_mainframe'] },

  // Network 3 (South Wing: Bio-Lab & Quantum Reactor Core)
  { id: 'vent_biolab', name: 'Bio-Lab Vent', x: 3250, y: 1250, network: 3, connections: ['vent_reactor_e', 'vent_reactor_w'] },
  { id: 'vent_reactor_e', name: 'Reactor East Vent', x: 2150, y: 2420, network: 3, connections: ['vent_biolab', 'vent_reactor_w'] },
  { id: 'vent_reactor_w', name: 'Reactor West Vent', x: 1450, y: 2420, network: 3, connections: ['vent_reactor_e', 'vent_biolab'] }
];

// =============================================================================
// AUTHENTIC DYNAMIC ANIMATED FLOOR VENT (Hinged Lid, Shaft Glow & Particles)
// =============================================================================
export function drawVent(ctx, x, y, openProgress = 0, isHovered = false) {
  ctx.save();
  ctx.translate(x, y);

  const OUTLINE_COLOR = '#000000';
  const clampedProgress = Math.max(0, Math.min(1, openProgress));

  // 1. Interactive Aura if hovered or active for Impostor
  if (isHovered) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(-32, -22, 64, 44, 8);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Fixed Outer Steel Frame
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.roundRect(-26, -16, 52, 32, 5);
  ctx.fillStyle = isHovered ? '#64748b' : '#334155';
  ctx.fill();
  ctx.stroke();

  // 3. Inner Duct Shaft (The hole in the floor)
  ctx.beginPath();
  ctx.roundRect(-22, -12, 44, 24, 3);
  ctx.fillStyle = '#060a12';
  ctx.fill();

  // If opening / open: draw deep shaft with red warning glow and subtle depth ribs
  if (clampedProgress > 0.04) {
    const glowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
    glowGrad.addColorStop(0, `rgba(239, 68, 68, ${0.75 * clampedProgress})`);
    glowGrad.addColorStop(0.7, `rgba(185, 28, 28, ${0.4 * clampedProgress})`);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.roundRect(-20, -10, 40, 20, 2);
    ctx.fill();

    // Shaft depth diagonal perspective lines
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 * clampedProgress})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, -8); ctx.lineTo(-8, 0);
    ctx.moveTo(16, -8); ctx.lineTo(8, 0);
    ctx.moveTo(-16, 8); ctx.lineTo(-8, 0);
    ctx.moveTo(16, 8); ctx.lineTo(8, 0);
    ctx.stroke();
  }

  // Corner mounting bolts on outer frame
  ctx.fillStyle = '#94a3b8';
  [[-22, -12], [22, -12], [-22, 12], [22, 12]].forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Hinged Metallic Slatted Lid (flips open upward along top edge y = -12)
  ctx.save();
  ctx.translate(0, -12); // Hinge anchor at top edge

  // 3D perspective foreshortening & upward flip
  const angle = clampedProgress * (Math.PI * 0.42); // tilts up to ~75 degrees
  const lidScaleY = Math.max(0.18, Math.cos(angle));
  const lidOffsetY = -Math.sin(angle) * 16;

  ctx.translate(0, lidOffsetY);
  ctx.scale(1, lidScaleY);

  // Lid outer shape
  ctx.beginPath();
  ctx.roundRect(-21, 0, 42, 24, 3);
  ctx.fillStyle = isHovered ? '#718096' : '#475569';
  ctx.fill();
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Lid slats (horizontal vents)
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = OUTLINE_COLOR;
  for (let sy = 5; sy <= 19; sy += 4.5) {
    ctx.beginPath();
    ctx.moveTo(-15, sy);
    ctx.lineTo(15, sy);
    ctx.stroke();
  }

  // Lid central handle / latch
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-4, 9, 8, 5);
  ctx.strokeRect(-4, 9, 8, 5);

  ctx.restore(); // restore hinge translate/scale

  ctx.restore(); // restore vent translate
}

// =============================================================================
// AUTHENTIC IN-VENT NAVIGATION ARROW (Points to connected vents)
// =============================================================================
export function drawVentArrow(ctx, x, y, angle, isHovered = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const OUTLINE_COLOR = '#000000';

  // Floating hover bobbing
  const bob = Math.sin(Date.now() / 150) * 3;
  ctx.translate(bob, 0);

  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = OUTLINE_COLOR;

  // Arrow shape pointing right (angle 0 points to +X)
  ctx.beginPath();
  ctx.moveTo(24, 0);       // tip
  ctx.lineTo(8, -14);      // top barb
  ctx.lineTo(8, -6);       // top notch
  ctx.lineTo(-14, -6);     // top shaft
  ctx.lineTo(-14, 6);      // bottom shaft
  ctx.lineTo(8, 6);        // bottom notch
  ctx.lineTo(8, 14);       // bottom barb
  ctx.closePath();

  ctx.fillStyle = isHovered ? '#fde047' : '#ffffff';
  ctx.shadowColor = isHovered ? 'rgba(250, 204, 21, 0.85)' : 'rgba(255, 255, 255, 0.4)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();

  // Subtle inner directional chevron
  ctx.strokeStyle = isHovered ? '#ca8a04' : '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(2, 0);
  ctx.lineTo(-4, 4);
  ctx.stroke();

  ctx.restore();
}

// =============================================================================
// AUTHENTIC BIG DROPSHIP LOBBY WAITING ROOM (Cockpit Window, Chairs, Crate, Laptop)
// =============================================================================
export function drawDropshipLobby(ctx, bounds, time) {
  const { x1, y1, x2, y2 } = bounds;
  const w = x2 - x1;
  const h = y2 - y1;

  ctx.save();

  // 1. Outer Deep Space Backdrop behind the Dropship
  ctx.fillStyle = '#02050b';
  ctx.fillRect(x1 - 60, y1 - 60, w + 120, h + 120);

  // 2. Dropship Outer Metallic Hull (Aerodynamic spacecraft silhouette with rounded nose)
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.roundRect(x1, y1, w, h, [48, 48, 16, 16]);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.stroke();

  // Inner hull trim
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(x1 + 6, y1 + 6, w - 12, h - 12, [44, 44, 12, 12]);
  ctx.stroke();

  // 3. Cabin Deck Floor (Authentic Spaceship Metal Plate Grid)
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(x1 + 14, y1 + 14, w - 28, h - 28, [38, 38, 10, 10]);
  ctx.fill();

  // Metal Deck Floor Seams
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  for (let fx = x1 + 100; fx < x2; fx += 100) {
    ctx.beginPath();
    ctx.moveTo(fx, y1 + 14);
    ctx.lineTo(fx, y2 - 14);
    ctx.stroke();
  }
  for (let fy = y1 + 90; fy < y2; fy += 90) {
    ctx.beginPath();
    ctx.moveTo(x1 + 14, fy);
    ctx.lineTo(x2 - 14, fy);
    ctx.stroke();
  }

  // 4. Massive Panoramic Forward Cockpit Window (Looking out into space)
  const winX = x1 + 100;
  const winY = y1 + 22;
  const winW = w - 200;
  const winH = 96;

  // Window Aperture
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(winX, winY, winW, winH, 18);
  ctx.clip();

  // Deep space inside window
  ctx.fillStyle = '#020617';
  ctx.fillRect(winX, winY, winW, winH);

  // Drifting colorful nebula cloud
  const nebGrad = ctx.createRadialGradient(winX + winW * 0.4, winY + 40, 10, winX + winW * 0.4, winY + 40, winW * 0.6);
  nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
  nebGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
  nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Cruising space stars (drifting leftward past the window)
  for (let i = 0; i < 60; i++) {
    const starSpeed = (i % 3 === 0 ? 55 : (i % 2 === 0 ? 30 : 15));
    const sx = winX + ((i * 123.4 + time * -starSpeed) % winW + winW) % winW;
    const sy = winY + (i * 17.8) % winH;
    const r = i % 6 === 0 ? 2 : 1;
    ctx.fillStyle = i % 4 === 0 ? '#38bdf8' : '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant glowing moon / planet passing by
  const moonX = winX + winW * 0.75 + Math.sin(time * 0.1) * 30;
  const moonY = winY + 38;
  const moonGrad = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 24);
  moonGrad.addColorStop(0, 'rgba(253, 224, 71, 0.9)');
  moonGrad.addColorStop(0.4, 'rgba(234, 179, 8, 0.5)');
  moonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 24, 0, Math.PI * 2);
  ctx.fill();

  // Glass glare diagonal reflection stripes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(winX + winW * 0.2, winY - 10);
  ctx.lineTo(winX + winW * 0.2 - 60, winY + winH + 10);
  ctx.moveTo(winX + winW * 0.28, winY - 10);
  ctx.lineTo(winX + winW * 0.28 - 60, winY + winH + 10);
  ctx.stroke();

  ctx.restore(); // restore window clip

  // Window heavy outer frame and mullions (3 panoramic panes)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.strokeRect(winX, winY, winW, winH);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(winX, winY, winW, winH);

  // Vertical window mullions
  [-winW * 0.18, winW * 0.18].forEach((mOffset) => {
    const mx = winX + winW / 2 + mOffset;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mx - 5, winY, 10, winH);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx - 5, winY, 10, winH);
  });

  // 5. Cockpit Pilot Dashboard Console
  const dashY = winY + winH;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(winX + 20, dashY, winW - 40, 26);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(winX + 20, dashY, winW - 40, 26);

  // Dashboard status lights and radar blips
  for (let lx = winX + 50; lx < winX + winW - 50; lx += 45) {
    const isBlinking = Math.sin(time * 3 + lx) > 0;
    ctx.fillStyle = isBlinking ? '#22c55e' : (lx % 90 === 0 ? '#f59e0b' : '#38bdf8');
    ctx.beginPath();
    ctx.arc(lx, dashY + 13, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dual Flight Pilot Chairs facing forward at (1660, 1185) and (1940, 1185)
  [x1 + w * 0.35, x1 + w * 0.65].forEach((chairX) => {
    const chairY = dashY + 36;
    // Chair shadow
    ctx.beginPath();
    ctx.ellipse(chairX, chairY + 10, 24, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Chair base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(chairX - 18, chairY - 10, 36, 26, 6);
    ctx.fill();
    ctx.stroke();

    // Armrests
    ctx.fillStyle = '#334155';
    ctx.fillRect(chairX - 22, chairY - 8, 5, 20);
    ctx.strokeRect(chairX - 22, chairY - 8, 5, 20);
    ctx.fillRect(chairX + 17, chairY - 8, 5, 20);
    ctx.strokeRect(chairX + 17, chairY - 8, 5, 20);

    // Headrest
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(chairX - 12, chairY - 20, 24, 10, 4);
    ctx.fill();
    ctx.stroke();
  });

  // 6. Passenger Wall Benches along Left & Right
  // Left bench
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x1 + 18, y1 + 190, 26, h - 340, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#334155';
  ctx.fillRect(x1 + 22, y1 + 196, 18, h - 352);

  // Right bench
  ctx.beginPath();
  ctx.roundRect(x2 - 44, y1 + 190, 26, h - 340, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#334155';
  ctx.fillRect(x2 - 40, y1 + 196, 18, h - 352);

  // 7. Iconic Customization Crate & Laptop at (1550, 1200)
  const crateX = 1550;
  const crateY = 1200;

  // Crate Ground Shadow
  ctx.beginPath();
  ctx.ellipse(crateX, crateY + 18, 34, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  // Wooden / Metal Supply Crate
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(crateX - 28, crateY - 14, 56, 32, 4);
  ctx.fill();
  ctx.stroke();

  // Crate metal reinforcement corner braces
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  [[-28, -14], [18, -14], [-28, 8], [18, 8]].forEach(([cx, cy]) => {
    ctx.fillRect(crateX + cx, crateY + cy, 10, 10);
    ctx.strokeRect(crateX + cx, crateY + cy, 10, 10);
  });

  // Stencil on crate
  ctx.font = "900 8px 'Inter', sans-serif";
  ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('SUPPLY #01', crateX, crateY + 4);

  // Customization Laptop sitting on top of crate
  const lapX = crateX;
  const lapY = crateY - 16;

  // Laptop Base
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(lapX - 14, lapY - 2, 28, 12, 2);
  ctx.fill();
  ctx.stroke();

  // Laptop Screen (Tilted up)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(lapX - 13, lapY - 16, 26, 16, 3);
  ctx.fill();
  ctx.stroke();

  // Glowing Cyan Screen
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 8;
  ctx.fillRect(lapX - 11, lapY - 14, 22, 12);
  ctx.shadowBlur = 0;

  // Mini color palette icon on screen
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(lapX - 6, lapY - 8, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath(); ctx.arc(lapX, lapY - 8, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath(); ctx.arc(lapX + 6, lapY - 8, 2, 0, Math.PI * 2); ctx.fill();

  // Floating prompt above laptop: "CUSTOMIZE [E]"
  const bounceY = Math.sin(time * 5) * 3;
  ctx.font = "900 11px 'Inter', sans-serif";
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeText('💻 CUSTOMIZE [E]', lapX, lapY - 24 + bounceY);
  ctx.fillText('💻 CUSTOMIZE [E]', lapX, lapY - 24 + bounceY);

  // 8. Rear Airlock Blast Doors at Bottom Center (1720 to 1880, y2 - 32)
  const doorX = x1 + w / 2 - 80;
  const doorY = y2 - 32;
  const doorW = 160;
  const doorH = 26;

  // Door Frame
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(doorX - 6, doorY - 4, doorW + 12, doorH + 8, 4);
  ctx.fill();
  ctx.stroke();

  // Yellow & Black Diagonal Hazard Chevron Stripes
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(doorX, doorY, doorW, doorH, 2);
  ctx.clip();
  ctx.fillStyle = '#eab308';
  ctx.fillRect(doorX, doorY, doorW, doorH);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 10;
  for (let hx = doorX - 30; hx < doorX + doorW + 30; hx += 20) {
    ctx.beginPath();
    ctx.moveTo(hx, doorY);
    ctx.lineTo(hx + 18, doorY + doorH);
    ctx.stroke();
  }
  ctx.restore();

  // Airlock Stencil
  ctx.font = "900 9px 'Inter', sans-serif";
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.textAlign = 'center';
  ctx.strokeText('AIRLOCK // DEPLOYMENT HATCH', x1 + w / 2, doorY - 8);
  ctx.fillText('AIRLOCK // DEPLOYMENT HATCH', x1 + w / 2, doorY - 8);

  // 9. Ceiling Light Glow Cones (Warm interior cabin lighting)
  [x1 + w * 0.3, x1 + w * 0.5, x1 + w * 0.7].forEach((lightX) => {
    const lightY = y1 + 200;
    const lGrad = ctx.createRadialGradient(lightX, lightY, 20, lightX, lightY, 160);
    lGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    lGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.04)');
    lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lGrad;
    ctx.beginPath();
    ctx.arc(lightX, lightY, 160, 0, Math.PI * 2);
    ctx.fill();
  });

  // Dropship Header Title
  ctx.font = "900 20px 'Inter', sans-serif";
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.textAlign = 'center';
  ctx.fillText('DROPSHIP // WAITING ROOM', x1 + w / 2, y1 + 175);

  ctx.restore();
}

// =============================================================================
// AUTHENTIC ROLE REVEAL INTRO ("SHHHH!" / CREWMATE vs IMPOSTOR)
// =============================================================================
export function drawRoleReveal(ctx, width, height, myRole, fellowMafia = [], myHero = 'red', myHat = 'none', username = 'Player', time = 0, elapsed = 0) {
  ctx.save();

  // Phase 1: 0.0s to 1.2s -> Iconic "SHHHHH!" Screen
  if (elapsed < 1.2) {
    // Pitch black background with subtle red edge vignette
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const vig = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.65);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(185, 28, 28, 0.25)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

    // Center Crewmate Bean holding finger to visor
    const beanX = width / 2;
    const beanY = height / 2 + 15;

    ctx.save();
    ctx.translate(beanX, beanY);
    ctx.scale(1.4, 1.4);
    drawCrewmate(ctx, 'red', 'none', 0, time, false, false, false, false);

    // Hand holding finger to visor
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#c51111';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Arm reaching up to visor
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.quadraticCurveTo(-14, -6, -8, -14);
    ctx.lineTo(-4, -18);
    ctx.quadraticCurveTo(0, -18, 0, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shushing index finger held vertical over visor mouth area
    ctx.beginPath();
    ctx.roundRect(-5, -24, 7, 16, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // "SHHHHH!" Title
    const textPop = Math.min(1, elapsed * 4);
    ctx.save();
    ctx.translate(width / 2, height * 0.24);
    ctx.scale(textPop, textPop);
    ctx.font = "900 54px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';
    ctx.strokeText('SHHHHH!', 0, 0);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
    ctx.shadowBlur = 18;
    ctx.fillText('SHHHHH!', 0, 0);
    ctx.restore();

    // Subtitle
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText("Don't make a sound.", width / 2, height * 0.82);

    ctx.restore();
    return;
  }

  // Phase 2: 1.2s to 3.5s -> CREWMATE or IMPOSTOR Role Reveal
  const roleElapsed = elapsed - 1.2;
  const fadeIn = Math.min(1, roleElapsed / 0.25);
  const fadeOut = elapsed > 3.2 ? Math.max(0, (3.5 - elapsed) / 0.3) : 1;
  const globalAlpha = fadeIn * fadeOut;

  ctx.globalAlpha = globalAlpha;

  const isImpostor = myRole === 'MAFIA';

  // Dynamic Background: Crimson Red for Impostor, Deep Cyan for Crewmate
  if (isImpostor) {
    const bg = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.75);
    bg.addColorStop(0, '#580e0e');
    bg.addColorStop(0.6, '#280606');
    bg.addColorStop(1, '#080101');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Floating red speed streak particles
    for (let i = 0; i < 40; i++) {
      const px = ((i * 73.1 + time * 180) % width);
      const py = (i * 39.5) % height;
      const pw = (i % 3 === 0 ? 40 : 20);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(px, py, pw, 2);
    }
  } else {
    const bg = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.75);
    bg.addColorStop(0, '#0c4a6e');
    bg.addColorStop(0.6, '#082f49');
    bg.addColorStop(1, '#020b14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Floating cyan speed streak particles
    for (let i = 0; i < 40; i++) {
      const px = ((i * 73.1 + time * 140) % width);
      const py = (i * 39.5) % height;
      const pw = (i % 3 === 0 ? 35 : 18);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.fillRect(px, py, pw, 2);
    }
  }

  // Giant Role Title
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "900 66px 'Inter', -apple-system, sans-serif";

  const titleY = height * 0.25;
  const titleText = isImpostor ? 'IMPOSTOR' : 'CREWMATE';
  const titleColor = isImpostor ? '#ef4444' : '#38bdf8';
  const glowColor = isImpostor ? 'rgba(239, 68, 68, 0.8)' : 'rgba(56, 189, 248, 0.8)';

  // Thick comic black outline
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'round';
  ctx.strokeText(titleText, width / 2, titleY);

  ctx.fillStyle = titleColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 25;
  ctx.fillText(titleText, width / 2, titleY);
  ctx.shadowBlur = 0;
  ctx.restore();

  // Subtitle
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.fillStyle = isImpostor ? '#fca5a5' : '#bae6fd';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  const subText = isImpostor
    ? 'Sabotage and eliminate everyone.'
    : 'There is 1 Impostor among us.';
  ctx.strokeText(subText, width / 2, height * 0.82);
  ctx.fillText(subText, width / 2, height * 0.82);
  ctx.restore();

  // Center Lineup of Characters
  const centerBob = Math.sin(time * 6) * 3;
  if (isImpostor) {
    // Show local impostor + fellow mafia teammates
    const impostorsList = [
      { name: username, characterId: myHero, hatId: myHat, isLocal: true },
      ...fellowMafia.filter((m) => m !== username).map((m, idx) => ({
        name: m,
        characterId: idx === 0 ? 'black' : 'red',
        hatId: 'none',
        isLocal: false
      }))
    ];

    const spacing = 110;
    const startX = width / 2 - ((impostorsList.length - 1) * spacing) / 2;

    impostorsList.forEach((imp, i) => {
      const cx = startX + i * spacing;
      const cy = height * 0.54 + centerBob;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1.3, 1.3);
      drawCrewmate(ctx, imp.characterId, imp.hatId, 0, time, false, false, false, imp.isLocal);
      ctx.restore();

      // Nametag
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(imp.name, cx, cy + 42);
      ctx.fillText(imp.name, cx, cy + 42);
    });
  } else {
    // Crewmate lineup: show player in center
    const cx = width / 2;
    const cy = height * 0.54 + centerBob;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.4, 1.4);
    drawCrewmate(ctx, myHero, myHat, 0, time, false, false, false, true);
    ctx.restore();

    // Nametag
    ctx.font = "bold 14px 'Inter', sans-serif";
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(username, cx, cy + 45);
    ctx.fillText(username, cx, cy + 45);
  }

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

