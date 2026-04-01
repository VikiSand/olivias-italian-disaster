// ============================================================
//  Olivia's Beschts Italienisch's Desaster
//  A Birthday Shoot-em-Up — Ois Guate, Olivia!
//  Built with Kaplay.js
// ============================================================

const k = kaplay({
    width: 960,
    height: 540,
    letterbox: true,
    background: [0, 0, 0],
    canvas: document.querySelector("canvas") || undefined,
    font: "PressStart2P",
});

k.loadFont("PressStart2P", "https://cdn.jsdelivr.net/npm/@fontsource/press-start-2p@5/files/press-start-2p-latin-400-normal.woff2");


const CAR_W = 78, CAR_H = 36;

const C = {
    green:  [0, 140, 69],
    white:  [255, 255, 255],
    red:    [206, 43, 55],
    yellow: [255, 220, 0],
    black:  [0, 0, 0],
};

// ── UI helpers ────────────────────────────────────────────────
function titleText(str, y, size, col) {
    size = size || 42; col = col || C.white;
    return k.add([
        k.text(str, { size, font: "PressStart2P", align: "center" }),
        k.pos(k.width() / 2, y), k.anchor("center"), k.color(...col),
    ]);
}
function subtitle(str, y, size, col) { return titleText(str, y, size || 20, col || C.white); }

function makeBar(x, y, w, h, fillColor, label) {
    const bg  = k.add([k.rect(w, h), k.pos(x, y), k.color(40, 40, 40), k.fixed(), { z: 100 }]);
    const bar = k.add([k.rect(w, h), k.pos(x, y), k.color(...fillColor), k.fixed(), { z: 101 }]);
    const txt = k.add([k.text(label, { size: 13 }), k.pos(x, y - 18), k.color(255, 255, 255), k.fixed(), { z: 102 }]);
    return {
        set(pct) { bar.width = w * Math.max(0, Math.min(1, pct)); },
        destroy() {
            if (bg.exists())  bg.destroy();
            if (bar.exists()) bar.destroy();
            if (txt.exists()) txt.destroy();
        }
    };
}

function bigBtn(str, y, scene) {
    const btn = k.add([
        k.rect(320, 52, { radius: 8 }), k.pos(k.width() / 2, y),
        k.anchor("center"), k.color(...C.green), k.area(), "btn",
    ]);
    k.add([
        k.text(str, { size: 20, font: "PressStart2P", align: "center" }),
        k.pos(k.width() / 2, y), k.anchor("center"), k.color(...C.white), "btn",
    ]);
    btn.onClick(() => k.go(scene));
    btn.onHover(() => btn.color = k.rgb(...C.yellow));
    btn.onHoverEnd(() => btn.color = k.rgb(...C.green));
    return btn;
}

// ════════════════════════════════════════════════════════════
//  OLIVIA — In the Black Combi (Level 1 only, top-down)
// ════════════════════════════════════════════════════════════
function makeOliviaPlayer(startX, startY) {
    const Z = { z: 20 };
    const px = startX, py = startY;

    const player = k.add([
        k.rect(CAR_W, CAR_H), k.pos(px, py),
        k.color(0, 0, 0), k.opacity(0),
        k.area({ width: CAR_W - 10, height: CAR_H - 8 }),
        "player",
    ]);

    const vBody  = k.add([k.rect(CAR_W,      CAR_H),        k.pos(px,            py),           k.color(12, 12, 12), Z]);
    const vHood  = k.add([k.rect(20,         CAR_H - 6),    k.pos(px + CAR_W-22, py + 3),       k.color(22, 22, 22), Z]);
    const vWind  = k.add([k.rect(14,         CAR_H - 12),   k.pos(px + CAR_W-20, py + 6),       k.color(35, 52, 72), k.opacity(0.9), Z]);
    const vRoof  = k.add([k.rect(32,         CAR_H - 8),    k.pos(px + 24,       py + 4),       k.color(18, 18, 18), Z]);
    const vRear  = k.add([k.rect(13,         CAR_H - 14),   k.pos(px + 3,        py + 7),       k.color(28, 44, 62), k.opacity(0.8), Z]);
    const vWFL   = k.add([k.rect(11, 9),                    k.pos(px + CAR_W-14, py - 2),       k.color(22, 22, 22), Z]);
    const vWRL   = k.add([k.rect(11, 9),                    k.pos(px + CAR_W-14, py + CAR_H-7), k.color(22, 22, 22), Z]);
    const vWFR   = k.add([k.rect(11, 9),                    k.pos(px + 3,        py - 2),       k.color(22, 22, 22), Z]);
    const vWRR   = k.add([k.rect(11, 9),                    k.pos(px + 3,        py + CAR_H-7), k.color(22, 22, 22), Z]);

    const hcx0 = px + 38, hcy0 = py + Math.floor(CAR_H / 2);
    const vHead  = k.add([k.circle(7),  k.pos(hcx0,     hcy0),      k.color(228, 188, 148), k.anchor("center"), Z]);
    const vHair  = k.add([k.rect(15,7), k.pos(hcx0 - 7, hcy0 - 11), k.color(228, 174, 42),  Z]);
    const vHairS = k.add([k.rect(4, 9), k.pos(hcx0 + 5, hcy0 - 7),  k.color(228, 174, 42),  Z]);
    const vFl1   = k.add([k.circle(3),  k.pos(hcx0 - 5, hcy0 - 15), k.color(255, 105, 165), k.anchor("center"), Z]);
    const vFl2   = k.add([k.circle(2),  k.pos(hcx0 + 1, hcy0 - 16), k.color(255, 218, 45),  k.anchor("center"), Z]);
    const vFl3   = k.add([k.circle(2),  k.pos(hcx0 - 1, hcy0 - 17), k.color(255, 255, 255), k.anchor("center"), Z]);

    function sync() {
        const p = player.pos;
        const hcx = p.x + 38, hcy = p.y + Math.floor(CAR_H / 2);
        vBody.pos  = k.vec2(p.x,            p.y);
        vHood.pos  = k.vec2(p.x + CAR_W-22, p.y + 3);
        vWind.pos  = k.vec2(p.x + CAR_W-20, p.y + 6);
        vRoof.pos  = k.vec2(p.x + 24,       p.y + 4);
        vRear.pos  = k.vec2(p.x + 3,        p.y + 7);
        vWFL.pos   = k.vec2(p.x + CAR_W-14, p.y - 2);
        vWRL.pos   = k.vec2(p.x + CAR_W-14, p.y + CAR_H - 7);
        vWFR.pos   = k.vec2(p.x + 3,        p.y - 2);
        vWRR.pos   = k.vec2(p.x + 3,        p.y + CAR_H - 7);
        vHead.pos  = k.vec2(hcx,     hcy);
        vHair.pos  = k.vec2(hcx - 7, hcy - 11);
        vHairS.pos = k.vec2(hcx + 5, hcy - 7);
        vFl1.pos   = k.vec2(hcx - 5, hcy - 15);
        vFl2.pos   = k.vec2(hcx + 1, hcy - 16);
        vFl3.pos   = k.vec2(hcx - 1, hcy - 17);
    }

    return { player, sync };
}

// ════════════════════════════════════════════════════════════
//  OLIVIA — On foot (Levels 2-6, side view)
//  Blonde Zelda girl with flowers, facing right
// ════════════════════════════════════════════════════════════
function makeOliviaWalker(startX, startY) {
    const Z = { z: 20 };

    const player = k.add([
        k.rect(20, 38), k.pos(startX, startY),
        k.color(0, 0, 0), k.opacity(0),
        k.area({ width: 16, height: 34 }),
        "player",
    ]);

    // Shoes
    const vShL  = k.add([k.rect(9, 5),   k.pos(startX,      startY + 34), k.color(48, 28, 12),      Z]);
    const vShR  = k.add([k.rect(9, 5),   k.pos(startX + 11, startY + 34), k.color(48, 28, 12),      Z]);
    // Legs
    const vLgL  = k.add([k.rect(7, 14),  k.pos(startX + 1,  startY + 20), k.color(228, 188, 148),   Z]);
    const vLgR  = k.add([k.rect(7, 14),  k.pos(startX + 12, startY + 20), k.color(228, 188, 148),   Z]);
    // Dress
    const vDrs  = k.add([k.rect(22, 17), k.pos(startX - 1,  startY + 6),  k.color(92, 148, 218),    Z]);
    // Left arm (back)
    const vArmL = k.add([k.rect(5, 11),  k.pos(startX - 5,  startY + 8),  k.color(228, 188, 148),   Z]);
    // Right arm (shooting arm, extends right)
    const vArmR = k.add([k.rect(12, 5),  k.pos(startX + 20, startY + 12), k.color(228, 188, 148),   Z]);
    // Head
    const vHead = k.add([k.circle(9),    k.pos(startX + 10, startY + 3),  k.color(228, 188, 148),   k.anchor("center"), Z]);
    // Blonde hair
    const vHair = k.add([k.rect(20, 7),  k.pos(startX,      startY - 8),  k.color(228, 174, 42),    Z]);
    const vHrS  = k.add([k.rect(4, 11),  k.pos(startX - 3,  startY - 3),  k.color(228, 174, 42),    Z]);
    // Flowers in hair
    const vFl1  = k.add([k.circle(3),    k.pos(startX + 3,  startY - 12), k.color(255, 105, 165),   k.anchor("center"), Z]);
    const vFl2  = k.add([k.circle(2),    k.pos(startX + 9,  startY - 14), k.color(255, 218, 45),    k.anchor("center"), Z]);
    const vFl3  = k.add([k.circle(2),    k.pos(startX + 15, startY - 12), k.color(255, 255, 255),   k.anchor("center"), Z]);

    function sync() {
        const p = player.pos;
        vShL.pos  = k.vec2(p.x,       p.y + 34);
        vShR.pos  = k.vec2(p.x + 11,  p.y + 34);
        vLgL.pos  = k.vec2(p.x + 1,   p.y + 20);
        vLgR.pos  = k.vec2(p.x + 12,  p.y + 20);
        vDrs.pos  = k.vec2(p.x - 1,   p.y + 6);
        vArmL.pos = k.vec2(p.x - 5,   p.y + 8);
        vArmR.pos = k.vec2(p.x + 20,  p.y + 12);
        vHead.pos = k.vec2(p.x + 10,  p.y + 3);
        vHair.pos = k.vec2(p.x,       p.y - 8);
        vHrS.pos  = k.vec2(p.x - 3,   p.y - 3);
        vFl1.pos  = k.vec2(p.x + 3,   p.y - 12);
        vFl2.pos  = k.vec2(p.x + 9,   p.y - 14);
        vFl3.pos  = k.vec2(p.x + 15,  p.y - 12);
    }

    return { player, sync };
}

// ── Cigarette smoke from car windows (top-down, drifts up) ───
function makeWindowSmoke() {
    const smokes = [];
    let t = 0;
    return {
        update(px, py, dt) {
            t += dt;
            if (t > 0.45) {
                t = 0;
                // Two wisp sources: top window and bottom window of car
                [py - 4, py + CAR_H + 2].forEach(wy => {
                    const s = k.add([
                        k.circle(k.rand(2, 5)),
                        k.pos(px + k.rand(20, 55), wy),
                        k.color(225, 218, 210), k.opacity(0.5), k.anchor("center"),
                        { age: 0, dx: k.rand(-8, 12), dy: k.rand(-42, -18) },
                    ]);
                    smokes.push(s);
                });
            }
            for (let i = smokes.length - 1; i >= 0; i--) {
                const s = smokes[i];
                if (!s.exists()) { smokes.splice(i, 1); continue; }
                s.age    += dt;
                s.pos.x  += s.dx * dt;
                s.pos.y  += s.dy * dt;
                s.opacity = Math.max(0, 0.5 - s.age * 0.55);
                if (s.age > 1.1) { s.destroy(); smokes.splice(i, 1); }
            }
        }
    };
}

// ── Rear exhaust smoke ───────────────────────────────────────
function makeSmokeSystem() {
    const smokes = [];
    let t = 0;
    return {
        update(playerPos, dt) {
            t += dt;
            if (t > 0.22) {
                t = 0;
                const s = k.add([
                    k.circle(k.rand(3, 7)),
                    k.pos(playerPos.x - 6, playerPos.y + CAR_H / 2 + k.rand(-5, 5)),
                    k.color(185, 180, 175), k.opacity(0.55), k.anchor("center"),
                    { age: 0, dx: k.rand(-48, -18), dy: k.rand(-22, 10) },
                ]);
                smokes.push(s);
            }
            for (let i = smokes.length - 1; i >= 0; i--) {
                const s = smokes[i];
                if (!s.exists()) { smokes.splice(i, 1); continue; }
                s.age    += dt;
                s.pos.x  += s.dx * dt;
                s.pos.y  += s.dy * dt;
                s.opacity = Math.max(0, 0.55 - s.age * 0.42);
                if (s.age > 1.4) { s.destroy(); smokes.splice(i, 1); }
            }
        }
    };
}

// ── Explosion burst ──────────────────────────────────────────
function burst(x, y, col, count) {
    col = col || [255, 200, 50]; count = count || 6;
    for (let i = 0; i < count; i++) {
        const sp = k.add([
            k.circle(k.rand(3, 9)), k.pos(x + k.rand(-14, 14), y + k.rand(-10, 10)),
            k.color(...col), k.anchor("center"), k.opacity(1),
            { age: 0, vx: k.rand(-80, 80), vy: k.rand(-100, -20) },
        ]);
        k.onUpdate(() => {
            if (!sp.exists()) return;
            sp.age    += k.dt();
            sp.pos.x  += sp.vx * k.dt();
            sp.pos.y  += sp.vy * k.dt();
            sp.opacity = Math.max(0, 1 - sp.age * 2.2);
            if (sp.age > 0.6 && sp.exists()) sp.destroy();
        });
    }
}

// ── Touch controls — split screen ────────────────────────────
// LEFT half  → drag to move Olivia
// RIGHT half → tap/hold to shoot
// Desktop: no-op (keyboard + space handles everything)
function makeTouchControls() {
    const IS_TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Track each touch by identifier so left/right hands are independent
    const touches = {};   // id → { clientX, clientY }
    let shootPressed = false;

    if (IS_TOUCH) {
        const canvas = document.querySelector("canvas");

        function getGameX(clientX) {
            const rect = canvas.getBoundingClientRect();
            return (clientX - rect.left) * (k.width() / rect.width);
        }

        function register(t) {
            const gx = getGameX(t.clientX);
            touches[t.identifier] = { clientX: t.clientX, clientY: t.clientY, isRight: gx > k.width() / 2 };
        }

        canvas.addEventListener("touchstart", e => {
            e.preventDefault();
            for (const t of e.changedTouches) register(t);
            shootPressed = Object.values(touches).some(t => t.isRight);
        }, { passive: false });

        canvas.addEventListener("touchmove", e => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                if (touches[t.identifier]) {
                    touches[t.identifier].clientX = t.clientX;
                    touches[t.identifier].clientY = t.clientY;
                }
            }
        }, { passive: false });

        canvas.addEventListener("touchend", e => {
            for (const t of e.changedTouches) delete touches[t.identifier];
            shootPressed = Object.values(touches).some(t => t.isRight);
        });
        canvas.addEventListener("touchcancel", e => {
            for (const t of e.changedTouches) delete touches[t.identifier];
            shootPressed = Object.values(touches).some(t => t.isRight);
        });
    }

    return {
        isTouch: IS_TOUCH,
        isShootPressed() { return shootPressed; },
        update(player, minY, maxY) {
            if (!IS_TOUCH) return;
            // Find the left-half touch (move finger)
            const canvas = document.querySelector("canvas");
            const rect   = canvas.getBoundingClientRect();
            const scaleX = k.width()  / rect.width;
            const scaleY = k.height() / rect.height;
            for (const t of Object.values(touches)) {
                if (t.isRight) continue;
                const gx = (t.clientX - rect.left) * scaleX;
                const gy = (t.clientY - rect.top)  * scaleY;
                const tx = Math.max(20, Math.min(k.width() / 2 - 22, gx - 10));
                const ty = Math.max(minY, Math.min(maxY - 38, gy - 19));
                player.pos.x += (tx - player.pos.x) * 5 * k.dt();
                player.pos.y += (ty - player.pos.y) * 5 * k.dt();
            }
        }
    };
}

// ── Controls ─────────────────────────────────────────────────
function addControls(player, minY, maxY, maxW) {
    maxW = maxW || (k.width() / 2);
    const SPD = 4;
    k.onKeyDown("left",  () => { if (player.pos.x > 20)        player.pos.x -= SPD; });
    k.onKeyDown("right", () => { if (player.pos.x < maxW - 22) player.pos.x += SPD; });
    k.onKeyDown("up",    () => { if (player.pos.y > minY)       player.pos.y -= SPD; });
    k.onKeyDown("down",  () => { if (player.pos.y < maxY - 38)  player.pos.y += SPD; });
    k.onKeyDown("a",     () => { if (player.pos.x > 20)        player.pos.x -= SPD; });
    k.onKeyDown("d",     () => { if (player.pos.x < maxW - 22) player.pos.x += SPD; });
    k.onKeyDown("w",     () => { if (player.pos.y > minY)       player.pos.y -= SPD; });
    k.onKeyDown("s",     () => { if (player.pos.y < maxY - 38)  player.pos.y += SPD; });
}

// ── Shoot (fires RIGHT) ───────────────────────────────────────
// Desktop : Space / Z
// Touch   : hold/tap RIGHT half of screen
function addShooter(getBulletPos, bulletColor, touchControls) {
    let cd = 0;
    function shoot() {
        if (cd > 0) return;
        cd = 0.18;
        const p = getBulletPos();
        k.add([
            k.rect(20, 4), k.pos(p.x, p.y),
            k.color(...(bulletColor || [255, 255, 80])),
            k.area(), k.move(k.RIGHT, 640),
            k.offscreen({ destroy: true }), "bullet",
        ]);
    }
    k.onKeyDown("space", shoot);
    k.onKeyDown("z",     shoot);
    return {
        tickCd(dt) {
            cd = Math.max(0, cd - dt);
            if (touchControls && touchControls.isTouch && touchControls.isShootPressed()) shoot();
        }
    };
}

// ════════════════════════════════════════════════════════════
//  BACKGROUNDS
// ════════════════════════════════════════════════════════════

function bgMotorway() {
    k.add([k.rect(k.width(), 232), k.pos(0, 0), k.color(100, 175, 225)]);
    k.add([k.circle(26), k.pos(820, 55), k.color(255, 235, 80), k.anchor("center")]);
    const hc = [[80,138,58],[92,150,65],[76,128,52]];
    for (let i = 0; i < 8; i++)
        k.add([k.circle(75 + (i%3)*22), k.pos(i*140-30, 225), k.color(...hc[i%3]), k.anchor("center")]);
    // Village
    k.add([k.rect(38,24), k.pos(560,148), k.color(218,198,162)]);
    k.add([k.rect(38, 9), k.pos(560,139), k.color(172, 63, 38)]);
    k.add([k.rect(12,38), k.pos(580,120), k.color(185, 72, 42)]);
    k.add([k.rect(28,20), k.pos(602,152), k.color(208,190,155)]);
    k.add([k.rect(28, 9), k.pos(602,143), k.color(168, 58, 36)]);
    // Road
    k.add([k.rect(k.width(), k.height()-232), k.pos(0,232), k.color(70,66,60)]);
    k.add([k.rect(k.width(),14), k.pos(0,232),             k.color(60,120,46)]);
    k.add([k.rect(k.width(),14), k.pos(0,k.height()-50),   k.color(60,120,46)]);
    k.add([k.rect(k.width(), 3), k.pos(0,244),             k.color(210,210,190), k.opacity(0.7)]);
    k.add([k.rect(k.width(), 3), k.pos(0,k.height()-53),   k.color(210,210,190), k.opacity(0.7)]);
    const ROAD_MID = Math.round((244 + k.height()-53)/2);
    const stripes = [];
    for (let i = 0; i < 10; i++)
        stripes.push(k.add([k.rect(70,5), k.pos(i*130-20, ROAD_MID), k.color(250,220,50), k.opacity(0.9)]));
    k.onUpdate(() => stripes.forEach(s => { s.pos.x -= 3; if (s.pos.x < -80) s.pos.x = k.width()+10; }));
    const cypresses = [];
    function addCyp(x) {
        const c = [];
        c.push(k.add([k.rect(7,22), k.pos(x-4,228), k.color(68,40,16)]));
        c.push(k.add([k.rect(18,58),k.pos(x-9,188), k.color(16,68,20)]));
        cypresses.push({ x, objs: c });
    }
    for (let i = 0; i < 7; i++) addCyp(200+i*150);
    k.onUpdate(() => {
        cypresses.forEach(c => {
            c.x -= 1;
            c.objs.forEach(o => { if (o.exists()) o.pos.x -= 1; });
            if (c.x < -20) {
                c.x = k.width()+20;
                c.objs.forEach((o,j) => { if (o.exists()) o.pos.x = k.width()+20-(j===0?4:9); });
            }
        });
    });
    return { minY: 248, maxY: k.height()-55 };
}

// Triangular tent helper
function drawTent(x, baseY, w, h, col, dark) {
    const d = dark ? 0.45 : 1;
    const r = col[0]*d|0, g = col[1]*d|0, b = col[2]*d|0;
    // Main triangle body (using stepped rects to simulate a triangle)
    const steps = 10;
    for (let i = 0; i < steps; i++) {
        const t  = i / steps;
        const rw = Math.max(4, w * (1 - t));
        const ry = baseY - h + h * t;
        k.add([k.rect(rw, h/steps + 1), k.pos(x + (w-rw)/2, ry), k.color(r, g, b)]);
    }
    // Ground flap
    k.add([k.rect(w+10, 8), k.pos(x-5, baseY-5), k.color(r*0.62|0, g*0.62|0, b*0.62|0)]);
    // Dark door opening
    const dr = dark ? 0.22 : 0.35;
    k.add([k.rect(w*0.28|0, h*0.42|0), k.pos(x + w*0.36|0, baseY - h*0.44|0),
           k.color(r*dr|0, g*dr|0, b*dr|0)]);
}

function bgCampsite(dark) {
    const sky = dark ? [12,14,38] : [105,168,88];
    k.add([k.rect(k.width(), k.height()), k.pos(0,0), k.color(...sky)]);
    if (dark) {
        for (let i = 0; i < 110; i++)
            k.add([k.rect(k.rand(1,3),k.rand(1,3)), k.pos(k.rand(0,k.width()),k.rand(0,k.height()*0.6)),
                   k.color(255,255,255), k.opacity(k.rand(0.2,1))]);
        k.add([k.circle(28), k.pos(820,55),  k.color(248,240,200), k.anchor("center")]);
        k.add([k.circle(22), k.pos(838,46),  k.color(...sky),      k.anchor("center")]);
    }
    const gc = dark ? [18,46,16] : [55,98,38];
    k.add([k.rect(k.width(),195), k.pos(0, k.height()-195), k.color(...gc)]);

    // Triangular tents
    const tentDefs = [
        [100, k.height()-172, 72, 55, [220,60,60]],
        [255, k.height()-168, 68, 52, [60,130,210]],
        [465, k.height()-175, 76, 58, [230,180,40]],
        [650, k.height()-170, 70, 54, [80,170,90]],
        [820, k.height()-168, 66, 50, [200,100,200]],
    ];
    tentDefs.forEach(([x, by, w, h, col]) => drawTent(x, by, w, h, col, dark));

    // Trees
    function tree(x) {
        const dc = dark ? 0.4 : 1;
        k.add([k.rect(14,52), k.pos(x-7, k.height()-242), k.color(78*dc|0,48*dc|0,20*dc|0)]);
        k.add([k.circle(32),  k.pos(x,   k.height()-248), k.color(34*dc|0,100*dc|0,34*dc|0), k.anchor("center")]);
        k.add([k.circle(26),  k.pos(x+18,k.height()-262), k.color(44*dc|0,118*dc|0,44*dc|0), k.anchor("center")]);
    }
    [80,250,460,660,895].forEach(x => tree(x));

    // Campfire
    const fx = 395, fy = k.height()-200;
    k.add([k.rect(8,18), k.pos(fx-4,fy-18), k.color(88,52,18)]);
    k.add([k.rect(8,18), k.pos(fx+4,fy-18), k.color(78,48,16)]);
    if (dark) k.add([k.circle(26),k.pos(fx+4,fy-8), k.color(200,80,10), k.anchor("center"), k.opacity(0.35)]);
    k.add([k.circle(11), k.pos(fx+4,fy-8),  k.color(240,120,20), k.anchor("center")]);
    k.add([k.circle(6),  k.pos(fx+4,fy-17), k.color(255,210,40), k.anchor("center")]);
    return { minY: 80, maxY: k.height()-200 };
}

function bgDeepNight() {
    k.add([k.rect(k.width(),k.height()), k.pos(0,0), k.color(5,5,22)]);
    for (let i = 0; i < 150; i++)
        k.add([k.rect(k.rand(1,3),k.rand(1,3)), k.pos(k.rand(0,k.width()),k.rand(0,k.height()*0.8)),
               k.color(255,255,255), k.opacity(k.rand(0.2,1))]);
    k.add([k.circle(32), k.pos(750,70),  k.color(248,240,195), k.anchor("center")]);
    k.add([k.circle(25), k.pos(769,60),  k.color(5,5,22),      k.anchor("center")]);
    k.add([k.rect(k.width(),100), k.pos(0,k.height()-100), k.color(10,22,10)]);
    [[120,k.height()-162],[340,k.height()-156],[580,k.height()-166],[780,k.height()-158]].forEach(([x,y]) =>
        k.add([k.rect(56,40), k.pos(x,y), k.color(8,14,8)]));
    return { minY: 70, maxY: k.height()-105 };
}

function bgMorning() {
    k.add([k.rect(k.width(),k.height()), k.pos(0,0), k.color(255,200,118)]);
    k.add([k.rect(k.width(),260),        k.pos(0,0), k.color(255,155,72)]);
    k.add([k.circle(42), k.pos(100,285), k.color(255,225,60), k.anchor("center")]);
    k.add([k.rect(k.width(),200), k.pos(0,k.height()-200), k.color(70,105,48)]);
    // Triangular tents (morning light)
    const tentDefs = [
        [100, k.height()-172, 72, 55, [220,60,60]],
        [255, k.height()-168, 68, 52, [60,130,210]],
        [465, k.height()-175, 76, 58, [230,180,40]],
        [650, k.height()-170, 70, 54, [80,170,90]],
        [820, k.height()-168, 66, 50, [200,100,200]],
    ];
    tentDefs.forEach(([x, by, w, h, col]) => drawTent(x, by, w, h, col, false));
    return { minY: 150, maxY: k.height()-205 };
}

function bgLake() {
    k.add([k.rect(k.width(),225),  k.pos(0,0),   k.color(88,158,220)]);
    [[0,190],[160,168],[320,182],[480,173],[640,178],[800,170]].forEach(([x,y]) =>
        k.add([k.circle(92), k.pos(x,y), k.color(142,148,162), k.anchor("center")]));
    k.add([k.rect(k.width(),205),  k.pos(0,k.height()-205), k.color(28,98,172)]);
    k.add([k.rect(k.width(),205),  k.pos(0,k.height()-205), k.color(38,128,210), k.opacity(0.45)]);
    for (let i = 0; i < 8; i++)
        k.add([k.rect(k.width(),3), k.pos(0,k.height()-200+i*22), k.color(255,255,255), k.opacity(0.05)]);
    k.add([k.rect(k.width(),32),   k.pos(0,k.height()-208), k.color(58,108,40)]);
    k.add([k.rect(k.width(),10),   k.pos(0,k.height()-206), k.color(220,195,128)]);
    k.add([k.rect(35,22), k.pos(680,152), k.color(215,195,158)]);
    k.add([k.rect(35, 8), k.pos(680,144), k.color(165, 58, 34)]);
    return { minY: 150, maxY: k.height()-212 };
}

// ════════════════════════════════════════════════════════════
//  TITLE
// ════════════════════════════════════════════════════════════
k.scene("title", () => {
    const sw = k.width()/3;
    [[...C.green,0],[255,255,255,sw],[...C.red,sw*2]].forEach(([r,g,b,x]) =>
        k.add([k.rect(sw,k.height()), k.pos(x,0), k.color(r,g,b), k.opacity(0.20)]));
    for (let i = 0; i < 30; i++)
        k.add([k.rect(8,8), k.pos(k.rand(0,k.width()),k.rand(0,k.height())),
               k.color(...[C.green,C.red,C.yellow][Math.floor(k.rand(0,3))]), k.opacity(0.35)]);

    titleText("Olivia's Beschts Italienisch's Desaster", 130, 38, C.white);
    subtitle("A woahre G'schicht.",                 188, 22, C.yellow);
    subtitle("Ois Guate zum Dreißgsten, Olivia! 🎉",218, 20, [255, 180, 100]);
    subtitle("G'macht mit Herz vo Viki, Dan & Vera", 252, 16, [180, 180, 180]);
    bigBtn("▶  LOS SPUIN",    328, "intro1");
    bigBtn("?  WIA GOAT DES", 403, "howtoplay");
    subtitle("Pfeiltoastn / WASD  •  Leerzeich / Z = SCHIASSN", 490, 13, [120,120,120]);
});

// ════════════════════════════════════════════════════════════
//  HOW TO PLAY
// ════════════════════════════════════════════════════════════
k.scene("howtoplay", () => {
    k.add([k.rect(k.width(),k.height()), k.pos(0,0), k.color(18,18,18)]);
    titleText("Wia Spuit Mo Des", 58, 34, C.yellow);
    const lines = [
        ["Pfeiltoastn / WASD  —  Olivia beweng",           [200,200,200]],
        ["Leerzeich / Z  —  SCHIASSN",                     [200,200,200]],
        ["Schiaß olle wäg. Net troffn losn!",               [200,200,200]],
        ["",                                               [200,200,200]],
        ["Level 1  —  ittaga Autobohn: Kisten wegschiaßn", C.yellow],
        ["Level 2  —  Camping: Piefkes verjagn",            C.yellow],
        ["Level 3  —  Nochts beim Feuer: Prosecco schiaßn", C.yellow],
        ["Level 4  —  Tiafe Nocht: Schnarcher stillmochn",  C.yellow],
        ["Level 5  —  Kater-Fruah: Hirner zerstörn",        C.yellow],
        ["Level 6  —  See: qualmend Griller wegschiaßn",    C.yellow],
        ["End     —  Kalti Cola in dr Trattoria! 🥤",       [255,150,150]],
    ];
    lines.forEach(([l,col],i) =>
        k.add([k.text(l, { size: 16, font: "PressStart2P" }), k.pos(78,118+i*26), k.color(...col)]));
    bigBtn("← Zrugg", 498, "title");
});

// ════════════════════════════════════════════════════════════
//  LEVEL INTROS
// ════════════════════════════════════════════════════════════
function makeIntro(name, next, bgCol, lines) {
    k.scene(name, () => {
        k.add([k.rect(k.width(),k.height()), k.pos(0,0), k.color(...bgCol)]);
        k.add([k.rect(k.width()-60,k.height()-60), k.pos(30,30), k.color(255,255,255), k.opacity(0.03)]);
        lines.forEach(([txt,y,size,col]) =>
            k.add([k.text(txt, { size: size||18, font:"monospace", align:"center" }),
                   k.pos(k.width()/2,y), k.anchor("center"), k.color(...(col||C.white))]));
        bigBtn("LOS GEHTS →", 462, next);
    });
}

makeIntro("intro1","level1",[16,12,8],[
    ["LEVEL 1",                                   128, 42, C.yellow],
    ["Autostrada Höllnritt",                       182, 28, C.white],
    ["A heißer italienischer Nochmittog.",              238, 18, [210,210,210]],
    ["D'Olivia fohrt mit ihrm schwarzn Kombi",     264, 18, [210,210,210]],
    ["durch de totale Autobohn-Katastroph.",       290, 18, [210,210,210]],
    ["SCHIASS die Kisten wäg!",                    332, 20, [255,160,60]],
]);
makeIntro("intro2","level2",[20,36,18],[
    ["LEVEL 2",                                   128, 42, C.yellow],
    ["Camping-Wahnsinn",                           182, 28, C.white],
    ["Jeder. Einzige. Plotz. Wäg.",                238, 18, [210,210,210]],
    ["Vo Piefkes. Mit riesige Zelter.",             264, 18, [210,210,210]],
    ["SCHIASS sie weg — hol dir dei Plotz!",       310, 20, [255,160,60]],
    ["(Dem Piefke is nix passiert. Joa.)",         348, 16, [140,140,140]],
]);
makeIntro("intro3","level3",[18,16,28],[
    ["LEVEL 3",                                   128, 42, C.yellow],
    ["Prosecco-Stund",                             182, 28, C.white],
    ["Des Feuer brennt. Die Nocht is jung.",       238, 18, [210,210,210]],
    ["Prosecco-Floschn überoll.",                  264, 18, [210,210,210]],
    ["SCHIASS sie weg, bevor'd ertrinksch!",       310, 20, [255,160,60]],
]);
makeIntro("intro4","level4",[6,5,16],[
    ["LEVEL 4",                                   128, 42, C.yellow],
    ["Schnarchlkampf",                             182, 28, C.white],
    ["Zwoa Uhr nochts. Stern, Mond, Stilli.",      238, 18, [210,210,210]],
    ["Nur net d'Viki. De schnarcht. Recht laut.",  264, 18, [210,210,210]],
    ["SCHIASS d'schnarcher Vikis in d'Stilli!",    310, 20, [160,160,255]],
]);
makeIntro("intro5","level5",[40,28,20],[
    ["LEVEL 5",                                   128, 42, C.yellow],
    ["Kater-Fruah",                                182, 28, C.white],
    ["D'Sunn geht auf. Der Schädel hommert.",      238, 18, [210,210,210]],
    ["Klopfende Katerhirner überoll.",             264, 18, [210,210,210]],
    ["SCHIASS sie weg, bevor dein Schädel platzt!",310, 20, [255,100,100]],
]);
makeIntro("intro6","level6",[28,65,95],[
    ["LEVEL 6",                                   128, 42, C.yellow],
    ["Rauch-See",                                  182, 28, C.white],
    ["A schener italienischer See.",                    238, 18, [210,210,210]],
    ["Voi versaut durch d'qualmenden Griller.",    264, 18, [210,210,210]],
    ["ZERSTÖR die Griller — befreit'n See!",       310, 20, [80,220,255]],
]);

// ════════════════════════════════════════════════════════════
//  FAIL SCENES
// ════════════════════════════════════════════════════════════
function makeFail(name, retry, msg1, msg2, bgCol) {
    k.scene(name, () => {
        k.add([k.rect(k.width(),k.height()), k.pos(0,0), k.color(...(bgCol||[160,0,0]))]);
        titleText(msg1, 185, 34, C.white);
        titleText(msg2, 242, 22, C.yellow);
        bigBtn("↺  NO AMOL", 335, retry);
        bigBtn("⌂  HOAM",    412, "title");
    });
}
makeFail("level1_fail","level1","Stau-Koller!",         "D'Olivia hot d'Geduld valorn...",   [140,20,10]);
makeFail("level2_fail","level2","Koa Camping-Plotz mehr!","De Piefkes hend gwunna...",       [30,70,28]);
makeFail("level3_fail","level3","Prosecco-Überfluass!", "D'Olivia is in Blasn ertrunkt...",  [16,14,32]);
makeFail("level4_fail","level4","Schnarchi-Alarm!",     "D'Olivia ko net schlofn...",        [5,5,28]);
makeFail("level5_fail","level5","Der Kater gwunnt!",    "D'Olivia braucht mehr Koffee...",   [200,140,60]);
makeFail("level6_fail","level6","Varoacht!",            "Der Griller gwunnt desmol...",      [25,60,88]);

// ════════════════════════════════════════════════════════════
//  LEVEL 1 — itagga Autobohn / shoot cars
//  Olivia in her black combi, smoking out the windows
// ════════════════════════════════════════════════════════════
k.scene("level1", () => {
    const bounds = bgMotorway();
    k.add([k.text("LEVEL 1 — Autostrada Höllnritt", { size: 17, font:"monospace" }),
           k.pos(k.width()/2,14), k.anchor("center"), k.color(255,255,255)]);

    const { player, sync } = makeOliviaPlayer(100, k.height()/2 - CAR_H/2);
    const touch = makeTouchControls();
    addControls(player, bounds.minY, bounds.maxY);
    const gun     = addShooter(() => k.vec2(player.pos.x + CAR_W, player.pos.y + CAR_H/2 - 2), [255,255,80], touch);
    const exhaust = makeSmokeSystem();
    const winSmoke = makeWindowSmoke();

    let health = 1, kills = 0;
    const TARGET = 25;
    const hbar    = makeBar(20, 50, 200, 18, [50,200,50], "GEDULD");
    const killTxt = k.add([k.text(`🚗 0 / ${TARGET}`, { size:14 }), k.pos(k.width()-200,50), k.fixed()]);

    const ECOLS = [[188,44,44],[44,78,188],[188,152,28],[44,138,72],[168,92,44],[128,44,128]];
    const LANE_Y = [bounds.minY+20, bounds.minY+80, bounds.minY+145, bounds.minY+205];
    let spawnInterval = 1.1;
    let spawnHandle = k.loop(spawnInterval, spawnCar);

    function spawnCar() {
        const ly  = LANE_Y[Math.floor(k.rand(0, LANE_Y.length))];
        const boost = Math.min(kills * 8, 160);
        const spd = k.rand(180 + boost, 350 + boost);
        const col = ECOLS[Math.floor(k.rand(0, ECOLS.length))];
        const cx  = k.width() + 14;
        k.add([k.rect(CAR_W,CAR_H), k.pos(cx,ly), k.color(...col),
               k.area({ width:CAR_W-8, height:CAR_H-8 }),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true }), "enemy"]);
        k.add([k.rect(14,CAR_H-12), k.pos(cx+3,ly+6),          k.color(30,48,70), k.opacity(0.8),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(12,CAR_H-12), k.pos(cx+CAR_W-16,ly+6),   k.color(28,44,64), k.opacity(0.75),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(30,CAR_H-10), k.pos(cx+22,ly+5), k.color(col[0]*0.65|0,col[1]*0.65|0,col[2]*0.65|0),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        [[3,-2],[3,CAR_H-8],[CAR_W-14,-2],[CAR_W-14,CAR_H-8]].forEach(([ox,oy]) =>
            k.add([k.rect(11,9), k.pos(cx+ox,ly+oy), k.color(18,18,18),
                   k.move(k.LEFT,spd), k.offscreen({ destroy:true })]));
        // Tighten spawn interval every 5 kills
        const newInterval = Math.max(0.45, 1.1 - Math.floor(kills / 5) * 0.1);
        if (newInterval !== spawnInterval) {
            spawnInterval = newInterval;
            if (spawnHandle) spawnHandle.cancel();
            spawnHandle = k.loop(spawnInterval, spawnCar);
        }
    }

    k.onCollide("bullet","enemy",(b,e) => {
        if (!b.exists()||!e.exists()) return;
        b.destroy(); burst(e.pos.x+CAR_W/2, e.pos.y+CAR_H/2, [255,200,50]); e.destroy();
        kills++; killTxt.text = `🚗 ${kills} / ${TARGET}`;
        if (kills >= TARGET) { hbar.destroy(); k.go("intro2"); }
    });
    player.onCollide("enemy", (e) => {
        if (!e.exists()) return;
        e.destroy(); health -= 0.25; hbar.set(health);
        if (health <= 0) { hbar.destroy(); k.go("level1_fail"); }
    });
    k.onUpdate(() => {
        gun.tickCd(k.dt()); sync();
        touch.update(player, bounds.minY, bounds.maxY);
        exhaust.update(player.pos, k.dt());
        winSmoke.update(player.pos.x, player.pos.y, k.dt());
    });
});

// ════════════════════════════════════════════════════════════
//  LEVEL 2 — Camping-Wahnsinn / blast German tourists
// ════════════════════════════════════════════════════════════
k.scene("level2", () => {
    const bounds = bgCampsite(false);
    k.add([k.text("LEVEL 2 — Camping-Wahnsinn", { size:17, font:"monospace" }),
           k.pos(k.width()/2,14), k.anchor("center"), k.color(255,255,255)]);

    const { player, sync } = makeOliviaWalker(80, k.height()/2 - 20);
    const touch = makeTouchControls();
    addControls(player, bounds.minY, bounds.maxY);
    const gun = addShooter(() => k.vec2(player.pos.x + 32, player.pos.y + 12), [255,255,80], touch);

    let health = 1, kills = 0;
    const TARGET = 22;
    const hbar    = makeBar(20, 50, 200, 18, [50,200,50], "LAUN");
    const killTxt = k.add([k.text(`🏕️ 0 / ${TARGET}`, { size:14 }), k.pos(k.width()-200,50), k.fixed()]);
    let spawnInterval = 1.4;
    let spawnHandle = k.loop(spawnInterval, spawnTourist);

    function spawnTourist() {
        const y   = k.rand(bounds.minY+10, bounds.maxY-45);
        const boost = Math.min(kills * 6, 100);
        const spd = k.rand(70 + boost, 155 + boost);
        const cx  = k.width() + 22;
        k.add([k.rect(22,36), k.pos(cx,y), k.color(100,78,38),
               k.area({ width:18, height:32 }),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true }), "enemy"]);
        k.add([k.circle(10), k.pos(cx+11,y-10), k.color(228,192,148), k.anchor("center"),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(26,8), k.pos(cx-2,y-22), k.color(52,40,20),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(16,10),k.pos(cx+3,y-32), k.color(62,48,24),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(3,8),  k.pos(cx+16,y-38),k.color(80,148,60),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        [[5,0],[14,0]].forEach(([ox,oy]) =>
            k.add([k.rect(3,14),k.pos(cx+ox,y+oy),k.color(180,118,20),
                   k.move(k.LEFT,spd),k.offscreen({ destroy:true })]));
        const newInterval = Math.max(0.5, 1.4 - Math.floor(kills / 5) * 0.1);
        if (newInterval !== spawnInterval) {
            spawnInterval = newInterval;
            if (spawnHandle) spawnHandle.cancel();
            spawnHandle = k.loop(spawnInterval, spawnTourist);
        }
    }

    k.onCollide("bullet","enemy",(b,e) => {
        if (!b.exists()||!e.exists()) return;
        b.destroy(); burst(e.pos.x+11, e.pos.y+18, [255,180,80], 5); e.destroy();
        kills++; killTxt.text = `🏕️ ${kills} / ${TARGET}`;
        if (kills >= TARGET) { hbar.destroy(); k.go("intro3"); }
    });
    player.onCollide("enemy",(e) => {
        if (!e.exists()) return;
        e.destroy(); health -= 0.25; hbar.set(health);
        if (health <= 0) { hbar.destroy(); k.go("level2_fail"); }
    });
    k.onUpdate(() => { gun.tickCd(k.dt()); sync(); touch.update(player, bounds.minY, bounds.maxY); });
});

// ════════════════════════════════════════════════════════════
//  LEVEL 3 — Prosecco-Stund / shoot bottles
// ════════════════════════════════════════════════════════════
k.scene("level3", () => {
    const bounds = bgCampsite(true);
    k.add([k.text("LEVEL 3 — Prosecco-Stund", { size:17, font:"monospace" }),
           k.pos(k.width()/2,14), k.anchor("center"), k.color(255,255,255)]);

    const { player, sync } = makeOliviaWalker(80, k.height()/2 - 20);
    const touch = makeTouchControls();
    addControls(player, bounds.minY, bounds.maxY);
    const gun = addShooter(() => k.vec2(player.pos.x + 32, player.pos.y + 12), [200,255,120], touch);

    let health = 1, kills = 0;
    const TARGET = 25;
    const hbar    = makeBar(20, 50, 200, 18, [180,200,50], "LAUN");
    const killTxt = k.add([k.text(`🍾 0 / ${TARGET}`, { size:14 }), k.pos(k.width()-200,50), k.fixed()]);
    let spawnInterval = 0.9;
    let spawnHandle = k.loop(spawnInterval, spawnBottle);

    function spawnBottle() {
        const y   = k.rand(bounds.minY+10, bounds.maxY-45);
        const boost = Math.min(kills * 7, 120);
        const spd = k.rand(90 + boost, 190 + boost);
        const cx  = k.width() + 22;
        k.add([k.rect(12,34), k.pos(cx,y), k.color(28,115,38),
               k.area({ width:10, height:32 }),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true }), "enemy"]);
        k.add([k.rect(8,10),  k.pos(cx+2,y-10), k.color(22,90,30),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(6,6),   k.pos(cx+3,y-16), k.color(175,148,75),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(12,12), k.pos(cx,y+8), k.color(245,235,195),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        const newInterval = Math.max(0.4, 0.9 - Math.floor(kills / 5) * 0.08);
        if (newInterval !== spawnInterval) {
            spawnInterval = newInterval;
            if (spawnHandle) spawnHandle.cancel();
            spawnHandle = k.loop(spawnInterval, spawnBottle);
        }
    }

    k.onCollide("bullet","enemy",(b,e) => {
        if (!b.exists()||!e.exists()) return;
        b.destroy();
        for (let i = 0; i < 6; i++) {
            const bub = k.add([k.circle(k.rand(3,6)), k.pos(e.pos.x+k.rand(0,12),e.pos.y+k.rand(0,34)),
                               k.color(210,248,210), k.anchor("center"), k.opacity(0.9),
                               { age:0, vy:k.rand(-70,-130) }]);
            k.onUpdate(() => {
                if (!bub.exists()) return;
                bub.age    += k.dt(); bub.pos.y += bub.vy*k.dt();
                bub.opacity = Math.max(0, 0.9-bub.age*1.5);
                if (bub.age > 0.7 && bub.exists()) bub.destroy();
            });
        }
        e.destroy(); kills++; killTxt.text = `🍾 ${kills} / ${TARGET}`;
        if (kills >= TARGET) { hbar.destroy(); k.go("intro4"); }
    });
    player.onCollide("enemy",(e) => {
        if (!e.exists()) return;
        e.destroy(); health -= 0.20; hbar.set(health);
        if (health <= 0) { hbar.destroy(); k.go("level3_fail"); }
    });
    k.onUpdate(() => { gun.tickCd(k.dt()); sync(); touch.update(player, bounds.minY, bounds.maxY); });
});

// ════════════════════════════════════════════════════════════
//  LEVEL 4 — Schnarchlkampf / snoring Vikis
// ════════════════════════════════════════════════════════════
k.scene("level4", () => {
    const bounds = bgDeepNight();
    k.add([k.text("LEVEL 4 — Schnarchlkampf", { size:17, font:"monospace" }),
           k.pos(k.width()/2,14), k.anchor("center"), k.color(200,200,255)]);

    const { player, sync } = makeOliviaWalker(80, k.height()/2 - 20);
    const touch = makeTouchControls();
    addControls(player, bounds.minY, bounds.maxY);
    const gun = addShooter(() => k.vec2(player.pos.x + 32, player.pos.y + 12), [160,160,255], touch);

    let health = 1, kills = 0;
    const TARGET = 18;
    const hbar    = makeBar(20, 50, 200, 18, [80,80,200], "LAUN");
    const killTxt = k.add([k.text(`😴 0 / ${TARGET}`, { size:14 }), k.pos(k.width()-200,50), k.fixed()]);
    let spawnInterval = 1.8;
    let spawnHandle = k.loop(spawnInterval, spawnViki);

    function spawnViki() {
        const y   = k.rand(bounds.minY+10, bounds.maxY-30);
        const boost = Math.min(kills * 5, 80);
        const spd = k.rand(55 + boost, 125 + boost);
        const cx  = k.width() + 22;
        k.add([k.rect(44,22), k.pos(cx,y), k.color(200,160,128),
               k.area({ width:40, height:18 }),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true }), "enemy"]);
        k.add([k.rect(44,12), k.pos(cx,y+10), k.color(70,70,200),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.circle(11), k.pos(cx+54,y+10), k.color(228,192,156), k.anchor("center"),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        k.add([k.rect(14,6), k.pos(cx+48,y+1), k.color(60,42,20),
               k.move(k.LEFT,spd), k.offscreen({ destroy:true })]);
        const zz = k.add([k.text("ZZZ", { size:13, font:"monospace" }),
                          k.pos(cx+48,y-18), k.color(175,175,255),
                          k.move(k.LEFT,spd), k.offscreen({ destroy:true }),
                          { age:0, baseY:y-18 }]);
        k.onUpdate(() => {
            if (!zz.exists()) return;
            zz.age += k.dt();
            zz.pos.y = zz.baseY + Math.sin(zz.age*2.5)*7;
        });
        const newInterval = Math.max(0.55, 1.8 - Math.floor(kills / 4) * 0.12);
        if (newInterval !== spawnInterval) {
            spawnInterval = newInterval;
            spawnHandle.cancel();
            spawnHandle = k.loop(spawnInterval, spawnViki);
        }
    }

    k.onCollide("bullet","enemy",(b,e) => {
        if (!b.exists()||!e.exists()) return;
        b.destroy();
        for (let i = 0; i < 5; i++) {
            const st = k.add([k.text("★",{size:14}),k.pos(e.pos.x+k.rand(0,44),e.pos.y+k.rand(0,22)),
                               k.color(255,230,80),k.opacity(1),
                               {age:0,vx:k.rand(-35,35),vy:k.rand(-90,-120)}]);
            k.onUpdate(() => {
                if (!st.exists()) return;
                st.age+=k.dt(); st.pos.x+=st.vx*k.dt(); st.pos.y+=st.vy*k.dt();
                st.opacity=Math.max(0,1-st.age*2);
                if (st.age>0.6&&st.exists()) st.destroy();
            });
        }
        e.destroy(); kills++; killTxt.text = `😴 ${kills} / ${TARGET}`;
        if (kills >= TARGET) { hbar.destroy(); k.go("intro5"); }
    });
    player.onCollide("enemy",(e) => {
        if (!e.exists()) return;
        e.destroy(); health -= 0.30; hbar.set(health);
        if (health <= 0) { hbar.destroy(); k.go("level4_fail"); }
    });
    k.onUpdate(() => { gun.tickCd(k.dt()); sync(); touch.update(player, bounds.minY, bounds.maxY); });
});

// ════════════════════════════════════════════════════════════
//  LEVEL 5 — Kater-Fruah / pulsing hangover brains
// ════════════════════════════════════════════════════════════
k.scene("level5", () => {
    const bounds = bgMorning();
    k.add([k.text("LEVEL 5 — Kater-Fruah", { size:17, font:"monospace" }),
           k.pos(k.width()/2,14), k.anchor("center"), k.color(80,0,0)]);

    const { player, sync } = makeOliviaWalker(80, k.height()/2 - 20);
    const touch = makeTouchControls();
    addControls(player, bounds.minY, bounds.maxY);
    const gun = addShooter(() => k.vec2(player.pos.x + 32, player.pos.y + 12), [255,80,80], touch);

    let health = 1, kills = 0;
    const TARGET = 20;
    const hbar    = makeBar(20, 50, 200, 18, [200,50,50], "LAUN");
    const killTxt = k.add([k.text(`🧠 0 / ${TARGET}`, { size:14 }), k.pos(k.width()-200,50), k.fixed()]);
    let spawnInterval = 1.3;
    let spawnHandle = k.loop(spawnInterval, spawnBrain);

    function spawnBrain() {
        const baseY = k.rand(bounds.minY+15, bounds.maxY-45);
        const boost = Math.min(kills * 7, 110);
        const spd   = k.rand(75 + boost, 165 + boost);
        const cx    = k.width() + 25;
        const brain = k.add([k.circle(18), k.pos(cx,baseY), k.color(218,75,118), k.anchor("center"),
                              k.area({ scale:0.8 }),
                              k.move(k.LEFT,spd), k.offscreen({ destroy:true }), "enemy",
                              { age:0, baseY }]);
        k.add([k.circle(12),k.pos(cx-10,baseY-9),k.color(230,88,130),k.anchor("center"),
               k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);
        k.add([k.circle(12),k.pos(cx+10,baseY-9),k.color(230,88,130),k.anchor("center"),
               k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);
        k.onUpdate(() => {
            if (!brain.exists()) return;
            brain.age  += k.dt();
            brain.pos.y = brain.baseY + Math.sin(brain.age*7)*9;
        });
        const newInterval = Math.max(0.45, 1.3 - Math.floor(kills / 4) * 0.1);
        if (newInterval !== spawnInterval) {
            spawnInterval = newInterval;
            spawnHandle.cancel();
            spawnHandle = k.loop(spawnInterval, spawnBrain);
        }
    }

    k.onCollide("bullet","enemy",(b,e) => {
        if (!b.exists()||!e.exists()) return;
        b.destroy(); burst(e.pos.x,e.pos.y,[220,75,118],8); e.destroy();
        kills++; killTxt.text = `🧠 ${kills} / ${TARGET}`;
        if (kills >= TARGET) { hbar.destroy(); k.go("intro6"); }
    });
    player.onCollide("enemy",(e) => {
        if (!e.exists()) return;
        e.destroy(); health -= 0.28; hbar.set(health);
        if (health <= 0) { hbar.destroy(); k.go("level5_fail"); }
    });
    k.onUpdate(() => { gun.tickCd(k.dt()); sync(); touch.update(player, bounds.minY, bounds.maxY); });
});

// ════════════════════════════════════════════════════════════
//  LEVEL 6 — Rauch-See / explode smoking BBQ grills
// ════════════════════════════════════════════════════════════
k.scene("level6", () => {
    const bounds = bgLake();
    k.add([k.text("LEVEL 6 — Rauch-See", { size:17, font:"monospace" }),
           k.pos(k.width()/2,14), k.anchor("center"), k.color(220,240,255)]);

    const { player, sync } = makeOliviaWalker(80, k.height()/2 - 20);
    const touch = makeTouchControls();
    addControls(player, bounds.minY, bounds.maxY);
    const gun = addShooter(() => k.vec2(player.pos.x + 32, player.pos.y + 12), [80,220,255], touch);

    let health = 1, kills = 0;
    const TARGET = 18;
    const hbar    = makeBar(20, 50, 200, 18, [50,148,200], "LAUN");
    const killTxt = k.add([k.text(`🔥 0 / ${TARGET}`, { size:14 }), k.pos(k.width()-200,50), k.fixed()]);

    const bbqSmokes = [];
    let spawnInterval = 1.7;
    let spawnHandle = k.loop(spawnInterval, spawnBBQ);

    function spawnBBQ() {
        const y   = k.rand(bounds.minY+10, bounds.maxY-55);
        const spd = k.rand(55, 115);
        const gx  = k.width() + 22, gy = y;

        const grill = k.add([
            k.rect(46,28), k.pos(gx,gy), k.color(58,54,48),
            k.area({ width:42, height:24 }),
            k.move(k.LEFT,spd), k.offscreen({ destroy:true }), "enemy",
            { bbqAge:0 },
        ]);
        k.add([k.rect(4,20),k.pos(gx+6, gy+28),k.color(48,44,38),k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);
        k.add([k.rect(4,20),k.pos(gx+36,gy+28),k.color(48,44,38),k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);
        k.add([k.rect(42,3),k.pos(gx+2, gy+8), k.color(78,73,65),k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);
        k.add([k.rect(42,3),k.pos(gx+2, gy+16),k.color(78,73,65),k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);
        k.add([k.circle(5),k.pos(gx+12,gy+24),k.color(255,95,15), k.anchor("center"),k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);
        k.add([k.circle(4),k.pos(gx+30,gy+24),k.color(235,75,10), k.anchor("center"),k.move(k.LEFT,spd),k.offscreen({ destroy:true })]);

        k.onUpdate(() => {
            if (!grill.exists()) return;
            grill.bbqAge += k.dt();
            if (grill.bbqAge > 0.16) {
                grill.bbqAge = 0;
                const s = k.add([
                    k.circle(k.rand(7,16)),
                    k.pos(grill.pos.x+23+k.rand(-8,8), grill.pos.y-8),
                    k.color(148,142,135), k.opacity(0.58), k.anchor("center"),
                    { age:0, dx:k.rand(-18,18), dy:k.rand(-58,-28) },
                ]);
                bbqSmokes.push(s);
            }
        });
        const newInterval = Math.max(0.5, 1.7 - Math.floor(kills / 4) * 0.12);
        if (newInterval !== spawnInterval) {
            spawnInterval = newInterval;
            spawnHandle.cancel();
            spawnHandle = k.loop(spawnInterval, spawnBBQ);
        }
    }

    k.onCollide("bullet","enemy",(b,e) => {
        if (!b.exists()||!e.exists()) return;
        b.destroy(); burst(e.pos.x+23,e.pos.y+14,[255,200,50],10); burst(e.pos.x+23,e.pos.y+14,[255,120,20],6);
        e.destroy(); kills++; killTxt.text = `🔥 ${kills} / ${TARGET}`;
        if (kills >= TARGET) { hbar.destroy(); k.go("ending"); }
    });
    player.onCollide("enemy",(e) => {
        if (!e.exists()) return;
        e.destroy(); health -= 0.28; hbar.set(health);
        if (health <= 0) { hbar.destroy(); k.go("level6_fail"); }
    });

    k.onUpdate(() => {
        gun.tickCd(k.dt()); sync();
        touch.update(player, bounds.minY, bounds.maxY);
        for (let i = bbqSmokes.length-1; i >= 0; i--) {
            const s = bbqSmokes[i];
            if (!s.exists()) { bbqSmokes.splice(i,1); continue; }
            s.age    += k.dt(); s.pos.x += s.dx*k.dt(); s.pos.y += s.dy*k.dt();
            s.opacity = Math.max(0, 0.58-s.age*0.32);
            if (s.age > 1.9) { s.destroy(); bbqSmokes.splice(i,1); }
        }
    });
});

// ════════════════════════════════════════════════════════════
//  ENDING — La Trattoria am See
//  Viki, Dan, Daniel & Olivia mit kalter Cola
// ════════════════════════════════════════════════════════════
k.scene("ending", () => {
    // ── Evening sky ──
    k.add([k.rect(k.width(), k.height()), k.pos(0,0), k.color(255,165,62)]);
    k.add([k.rect(k.width(), 220),        k.pos(0,0), k.color(255,110,38)]);
    k.add([k.circle(38), k.pos(95,245),   k.color(255,215,50), k.anchor("center")]);

    // ── Mountains behind lake ──
    [[0,195],[160,172],[320,185],[480,176],[640,180],[800,174]].forEach(([x,y]) =>
        k.add([k.circle(90), k.pos(x,y), k.color(148,138,155), k.anchor("center")]));

    // ── Lake ──
    k.add([k.rect(k.width(),195), k.pos(0,320), k.color(38,115,188)]);
    k.add([k.rect(k.width(),195), k.pos(0,320), k.color(60,145,215), k.opacity(0.38)]);
    for (let i = 0; i < 7; i++)
        k.add([k.rect(k.width(),3), k.pos(0,325+i*22), k.color(255,255,255), k.opacity(0.06)]);

    // Shore
    k.add([k.rect(k.width(),28), k.pos(0,318), k.color(65,112,45)]);
    k.add([k.rect(k.width(),10), k.pos(0,316), k.color(215,192,122)]);

    // Ground front
    k.add([k.rect(k.width(),90), k.pos(0,k.height()-90), k.color(145,120,75)]);
    k.add([k.rect(k.width(), 6), k.pos(0,k.height()-90), k.color(110,88,55)]);

    // ── La Trattoria (right side) ──
    const bx=548, by=135;
    k.add([k.rect(290,250), k.pos(bx,by),       k.color(228,212,175)]);
    k.add([k.rect(290,16),  k.pos(bx,by),       k.color(188,52,32)]);
    k.add([k.rect(290,26),  k.pos(bx,by-26),    k.color(188,52,32)]);
    // Sign with dark panel
    k.add([k.rect(176,34),  k.pos(bx+57,by+12), k.color(14,10,8)]);
    k.add([k.text("LA TRATTORIA", { size:13, font:"monospace", align:"center" }),
           k.pos(bx+145,by+29), k.anchor("center"), k.color(255,215,55)]);
    // Windows
    [[bx+18,by+55],[bx+88,by+55],[bx+182,by+55],[bx+248,by+55]].forEach(([wx,wy]) => {
        k.add([k.rect(32,36), k.pos(wx,wy), k.color(180,222,245), k.opacity(0.82)]);
        k.add([k.rect(32, 3), k.pos(wx,wy+16), k.color(95,60,25)]);
        k.add([k.rect( 3,36), k.pos(wx+14,wy), k.color(95,60,25)]);
    });
    // Door
    k.add([k.rect(38,56), k.pos(bx+126,by+194), k.color(88,55,22)]);
    k.add([k.circle(4),   k.pos(bx+154,by+224), k.color(195,160,35), k.anchor("center")]);
    // Awning stripes
    for (let i = 0; i < 7; i++)
        k.add([k.rect(42,18), k.pos(bx+i*42, by-26), k.color(i%2===0?188:245, i%2===0?52:245, i%2===0?32:245)]);

    // ── Table ──
    const tx=128, ty=390;
    k.add([k.rect(218,11), k.pos(tx,ty),    k.color(148,105,48)]);
    k.add([k.rect(10,36),  k.pos(tx+12,ty+11), k.color(118,82,35)]);
    k.add([k.rect(10,36),  k.pos(tx+196,ty+11),k.color(118,82,35)]);
    // Coke glasses on table
    [[tx+22],[tx+76],[tx+130],[tx+185]].forEach(([gx]) => {
        k.add([k.rect(14,18), k.pos(gx,ty-18), k.color(172,16,16)]);
        k.add([k.rect(14, 4), k.pos(gx,ty-20), k.color(195,195,195)]);
        k.add([k.circle(2),   k.pos(gx+4,ty-12), k.color(255,255,255), k.anchor("center"), k.opacity(0.65)]);
        k.add([k.circle(2),   k.pos(gx+9,ty-8),  k.color(255,255,255), k.anchor("center"), k.opacity(0.5)]);
    });

    // ── Characters ──────────────────────────────────────────
    // All standing behind / at the table, feet near y=452

    // VIKI — little brown-hair girl
    const vx=148, vf=450;
    k.add([k.rect(9,4),  k.pos(vx+1,vf),    k.color(52,32,14)]);  // shoes
    k.add([k.rect(9,4),  k.pos(vx+12,vf),   k.color(52,32,14)]);
    k.add([k.rect(6,13), k.pos(vx+2,vf-13), k.color(95,68,42)]);  // legs
    k.add([k.rect(6,13), k.pos(vx+13,vf-13),k.color(95,68,42)]);
    k.add([k.rect(22,16),k.pos(vx,vf-29),   k.color(182,82,125)]); // top
    k.add([k.rect(5,10), k.pos(vx-4,vf-27), k.color(228,190,150)]); // arms
    k.add([k.rect(5,10), k.pos(vx+21,vf-27),k.color(228,190,150)]);
    k.add([k.circle(9),  k.pos(vx+11,vf-40),k.color(228,190,150), k.anchor("center")]); // head
    k.add([k.rect(20,7), k.pos(vx+1,vf-51), k.color(102,65,26)]); // brown hair
    k.add([k.rect(4,10), k.pos(vx-3,vf-47), k.color(102,65,26)]);

    // DAN — very tall dark-hair guy
    const dnx=218, dnf=450;
    k.add([k.rect(11,5), k.pos(dnx+2,dnf),    k.color(24,18,12)]); // shoes
    k.add([k.rect(11,5), k.pos(dnx+18,dnf),   k.color(24,18,12)]);
    k.add([k.rect(8,24), k.pos(dnx+3,dnf-24), k.color(45,45,68)]); // long legs
    k.add([k.rect(8,24), k.pos(dnx+20,dnf-24),k.color(45,45,68)]);
    k.add([k.rect(28,24),k.pos(dnx,dnf-48),   k.color(35,35,55)]); // torso
    k.add([k.rect(6,20), k.pos(dnx-5,dnf-46), k.color(228,190,150)]); // long arms
    k.add([k.rect(6,20), k.pos(dnx+28,dnf-46),k.color(228,190,150)]);
    k.add([k.circle(12), k.pos(dnx+14,dnf-62),k.color(228,190,150), k.anchor("center")]); // head
    k.add([k.rect(26,9), k.pos(dnx+1,dnf-76), k.color(32,22,12)]); // dark hair
    k.add([k.rect(6,8),  k.pos(dnx-2,dnf-70), k.color(32,22,12)]);

    // DANIEL — long-hair ponytail guy
    const dlx=298, dlf=450;
    k.add([k.rect(10,5), k.pos(dlx+2,dlf),    k.color(38,26,12)]); // shoes
    k.add([k.rect(10,5), k.pos(dlx+16,dlf),   k.color(38,26,12)]);
    k.add([k.rect(7,18), k.pos(dlx+3,dlf-18), k.color(72,52,30)]); // legs
    k.add([k.rect(7,18), k.pos(dlx+17,dlf-18),k.color(72,52,30)]);
    k.add([k.rect(26,20),k.pos(dlx,dlf-38),   k.color(65,92,52)]); // body (green top)
    k.add([k.rect(5,14), k.pos(dlx-5,dlf-36), k.color(228,190,150)]); // arms
    k.add([k.rect(5,14), k.pos(dlx+26,dlf-36),k.color(228,190,150)]);
    k.add([k.circle(10), k.pos(dlx+13,dlf-50),k.color(228,190,150), k.anchor("center")]); // head
    k.add([k.rect(22,8), k.pos(dlx+2,dlf-62), k.color(125,85,25)]);  // top hair
    k.add([k.rect(5,16), k.pos(dlx-3,dlf-57), k.color(125,85,25)]);  // left side long
    k.add([k.rect(5,18), k.pos(dlx+23,dlf-60),k.color(125,85,25)]);  // right side (ponytail)
    k.add([k.rect(5,12), k.pos(dlx+22,dlf-46),k.color(125,85,25)]);  // ponytail lower
    k.add([k.rect(6,4),  k.pos(dlx+21,dlf-49),k.color(88,58,12)]);   // hair tie

    // OLIVIA — blonde zelda girl with flowers
    const ox=385, of_=450;
    k.add([k.rect(10,5), k.pos(ox+2,of_),    k.color(44,26,10)]); // shoes
    k.add([k.rect(10,5), k.pos(ox+14,of_),   k.color(44,26,10)]);
    k.add([k.rect(7,16), k.pos(ox+2,of_-16), k.color(228,190,150)]); // legs (bare)
    k.add([k.rect(7,16), k.pos(ox+14,of_-16),k.color(228,190,150)]);
    k.add([k.rect(24,18),k.pos(ox,of_-34),   k.color(88,145,215)]); // blue dress
    k.add([k.rect(5,12), k.pos(ox-5,of_-32), k.color(228,190,150)]); // arms
    k.add([k.rect(5,12), k.pos(ox+24,of_-32),k.color(228,190,150)]);
    k.add([k.circle(10), k.pos(ox+12,of_-46),k.color(228,190,150), k.anchor("center")]); // head
    k.add([k.rect(22,7), k.pos(ox+1,of_-57), k.color(228,174,42)]); // blonde hair
    k.add([k.rect(4,11), k.pos(ox-3,of_-52), k.color(228,174,42)]);
    k.add([k.circle(3),  k.pos(ox+3,of_-62), k.color(255,105,165), k.anchor("center")]); // flowers
    k.add([k.circle(2),  k.pos(ox+9,of_-64), k.color(255,218,45),  k.anchor("center")]);
    k.add([k.circle(2),  k.pos(ox+15,of_-62),k.color(255,255,255), k.anchor("center")]);

    // ── Text panel (dark bg for readability) ──
    k.add([k.rect(k.width()-30, 148), k.pos(15,8), k.color(0,0,0), k.opacity(0.72)]);

    k.add([k.text("🎉  Hast's g'schafft, Olivia!  🎉", { size:32, font:"monospace", align:"center" }),
           k.pos(k.width()/2, 44), k.anchor("center"), k.color(255,222,50)]);
    k.add([k.text("D'Trattoria hot offen  •  Kalti Cola. Endli. 🥤", { size:18, font:"monospace", align:"center" }),
           k.pos(k.width()/2, 88), k.anchor("center"), k.color(255,255,255)]);
    k.add([k.text("Ois Guate zum Dreißgsten!  Beschts walsches Desaster übberhaupt!", { size:15, font:"monospace", align:"center" }),
           k.pos(k.width()/2, 118), k.anchor("center"), k.color(255,200,100)]);
    k.add([k.text("Mit Herz: Viki, Dan & Vera ❤️", { size:14, font:"monospace", align:"center" }),
           k.pos(k.width()/2, 144), k.anchor("center"), k.color(255,160,160)]);

    bigBtn("▶  NO AMOL", 502, "title");
});

k.go("title");
