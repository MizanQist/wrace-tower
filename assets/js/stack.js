/* Exploded isometric stack of the building, drawn from assets/plans/stack.json. Modes: by floor (hover/tap a plate) and by space (legend chips). */
(function () {
  'use strict';
  var d = document, host = d.getElementById('stack'); if (!host) return;
  var svg = host.querySelector('svg'), card = d.getElementById('stack-card'), chips = [].slice.call(d.querySelectorAll('#stack-legend button')),
      modeBtns = [].slice.call(d.querySelectorAll('#stack-mode button')), gapBtns = [].slice.call(d.querySelectorAll('#stack-gap button'));
  var COL = { anchor: '#9a9a9a', suite: '#d2d2d2', hall: '#efefef', core: '#2b2b2b', wellness: '#b3bdb6', outlet: '#d9d0bf', parking: '#c6c6c6' };
  var ACC = '#f20fc0', HEIGHT = { B1: 4, G: 8 }, FLOOR = 3.8;
  var NAME = { anchor: 'Anchor suites', suite: 'Office suites', hall: 'Hallway · lobby', core: 'Core', wellness: 'Wellness', outlet: 'Street-level outlets', parking: 'Parking' };
  var CA = Math.cos(Math.PI / 6), SA = 0.5, SC = 6.2, GAP = 2.6, COMPACT = 0;
  var data, mode = 'floor', type = null, sel = null, gap = GAP, N;

  function P(x, y, z) { return [(x - y) * CA * SC, ((x + y) * SA - z) * SC]; }
  function pts(poly, z) { return poly.map(function (p) { var q = P(p[0], p[1], z); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
  function el(n, a) { var e = d.createElementNS('http://www.w3.org/2000/svg', n); for (var k in a) e.setAttribute(k, a[k]); return e; }

  function build() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = data.W, H = data.H, levels = data.levels; N = levels.length;
    var plate = [[0, 0], [W, 0], [W, H], [0, H]];
    var zs = [], z = 0;
    levels.forEach(function (L) { var h = HEIGHT[L.id] || FLOOR; zs.push([z, z + h]); z += h + gap; });
    var top = zs[N - 1][1];
    var ox = H * CA * SC + 14, oy = 12 + top * SC;
    var g0 = el('g', { transform: 'translate(' + ox + ',' + oy + ')' });
    svg.appendChild(g0);
    var span = P(W, H, 0), left = P(0, H, 0), right = P(W, 0, 0);
    svg.setAttribute('viewBox', (left[0] - 14 + ox) + ' 0 ' + (right[0] - left[0] + 28) + ' ' + (oy + span[1] + 14));
    levels.forEach(function (L, i) {
      var z0 = zs[i][0], z1 = zs[i][1], g = el('g', { 'class': 'plate', 'data-i': i });
      g.appendChild(el('polygon', { points: pts([[0, H], [W, H]], z1) + ' ' + pts([[W, H], [0, H]], z0), 'class': 'side sl' }));
      g.appendChild(el('polygon', { points: pts([[W, 0], [W, H]], z1) + ' ' + pts([[W, H], [W, 0]], z0), 'class': 'side sr' }));
      // mullion hint on the side faces: a few vertical hairlines
      for (var k = 1; k < 8; k++) { var a = P(k * W / 8, H, z1), b = P(k * W / 8, H, z0); g.appendChild(el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], 'class': 'mul' })); }
      for (var m = 1; m < 6; m++) { var c = P(W, m * H / 6, z1), e = P(W, m * H / 6, z0); g.appendChild(el('line', { x1: c[0], y1: c[1], x2: e[0], y2: e[1], 'class': 'mul' })); }
      g.appendChild(el('polygon', { points: pts(plate, z1), 'class': 'top' }));
      L.spaces.forEach(function (s) { var q = el('polygon', { points: pts(s.poly, z1), 'class': 'sp', 'data-t': s.t, fill: COL[s.t] }); var t = el('title'); t.textContent = L.label + ' · ' + s.n; q.appendChild(t); g.appendChild(q); });
      if (L.id !== 'B1') g.appendChild(el('polygon', { points: pts(data.core, z1), 'class': 'sp', 'data-t': 'core', fill: COL.core }));
      g.appendChild(el('polygon', { points: pts(plate, z1), 'class': 'rim' }));
      var lp = P(-1.2, H, (z0 + z1) / 2); var t = el('text', { x: lp[0], y: lp[1] + 2.4, 'class': 'lab', 'text-anchor': 'end' }); t.textContent = L.id === 'B1' ? 'B1' : L.id === 'G' ? 'G' : L.id.slice(1); g.appendChild(t);
      g.addEventListener('pointerenter', function () { if (mode === 'floor') select(i, false); });
      g.addEventListener('click', function () { select(i, true); });
      g0.appendChild(g);
    });
    paint();
  }

  function paint() {
    var plates = svg.querySelectorAll('.plate');
    for (var i = 0; i < plates.length; i++) {
      var g = plates[i], on = (mode === 'floor') ? (sel === null || sel === i) : true;
      g.classList.toggle('dim', !on);
      var sps = g.querySelectorAll('.sp');
      for (var k = 0; k < sps.length; k++) {
        var s = sps[k], t = s.getAttribute('data-t');
        var hit = mode === 'space' && type === t;
        var lit = mode === 'space' ? hit : on;
        s.setAttribute('fill', hit ? ACC : (lit ? COL[t] : '#f6f6f6'));
        s.setAttribute('stroke', lit ? 'rgba(0,0,0,.3)' : 'rgba(0,0,0,.1)');
      }
    }
    chips.forEach(function (b) { b.classList.toggle('on', mode === 'space' && b.getAttribute('data-t') === type); });
    modeBtns.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-m') === mode); b.setAttribute('aria-pressed', b.getAttribute('data-m') === mode); });
    gapBtns.forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-g') === (gap === GAP ? 1 : 0)); });
    order(); renderCard();
  }

  function select(i, pin) { sel = i; mode = 'floor'; paint(); if (pin) card.scrollIntoView({ block: 'nearest' }); }
  function order() { var g0 = svg.firstChild; if (!g0) return; var plates = [].slice.call(g0.querySelectorAll('.plate')).sort(function (a, b) { return +a.getAttribute('data-i') - +b.getAttribute('data-i'); }); plates.forEach(function (g) { g0.appendChild(g); }); if (mode === 'floor' && sel !== null) g0.appendChild(plates[sel]); }

  function area(poly) { var a = 0; for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a) / 2; }

  function renderCard() {
    if (mode === 'space') {
      var tot = 0, floors = 0;
      data.levels.forEach(function (L) { var f = 0; L.spaces.forEach(function (s) { if (s.t === type) f += area(s.poly); }); if (type === 'core' && L.id !== 'B1') f += area(data.core); if (f) { tot += f; floors++; } });
      card.innerHTML = type ? '<b>' + NAME[type] + '</b><span>' + (type === 'parking' ? 'One basement level' : floors + (floors === 1 ? ' floor' : ' floors') + ' · ' + Math.round(tot).toLocaleString('en-GB') + ' m²') + '</span>' + hint(type)
                            : '<b>By space</b><span>Choose a use in the legend to light it on every floor.</span>';
      return;
    }
    if (sel === null) { card.innerHTML = '<b>By floor</b><span>Hover or tap a plate to read it.</span>'; return; }
    var L = data.levels[sel], rows = {}, order = [];
    var orderArr = order;
    var used = 0; L.spaces.forEach(function (s) { var k = s.t; if (!rows[k]) { rows[k] = 0; order.push(k); } rows[k] += area(s.poly); used += area(s.poly); });
    if (L.id !== 'B1') { var c = area(data.core); rows.core = c; order.push('core'); var hall = data.W * data.H - used - c; if (L.id === 'G') hall = 0; if (hall > 1) { rows.hall = (rows.hall || 0) + hall; if (order.indexOf('hall') < 0) order.push('hall'); } }
    var list = order.map(function (k) { return '<li><i style="background:' + COL[k] + '"></i>' + NAME[k] + '<em>' + Math.round(rows[k]).toLocaleString('en-GB') + ' m²</em></li>'; }).join('');
    var link = L.id.charAt(0) === 'L' ? '<a href="#p' + (parseInt(L.id.slice(1), 10) + 6) + '">Open the plan</a>' : '';
    card.innerHTML = '<b>' + L.label + '</b><span>' + L.use + '</span><ul>' + list + '</ul>' + link;
  }
  function hint(t) {
    return { anchor: '<p>One suite of exactly 500 m² on every office floor, and the 550 m² full floor on 14.</p>', suite: '<p>From 100 m², all on the window wall.</p>', hall: '<p>Lift lobby, corridor, pantry and breakout around the core.</p>',
             core: '<p>Four lifts, two stairs, women’s and men’s WCs, risers.</p>', wellness: '<p>25 m lap pool, gym hall, spa with sauna and steam, behind a wall on Level 14.</p>', outlet: '<p>Café, pharmacy and event hall behind the colonnade.</p>', parking: '<p>Ramp beside the block.</p>' }[t] || '';
  }

  modeBtns.forEach(function (b) { b.addEventListener('click', function () { mode = b.getAttribute('data-m'); if (mode === 'space' && !type) type = 'anchor'; if (mode === 'floor') sel = null; paint(); }); });
  chips.forEach(function (b) { b.addEventListener('click', function () { mode = 'space'; type = b.getAttribute('data-t'); paint(); }); });
  gapBtns.forEach(function (b) { b.addEventListener('click', function () { gap = +b.getAttribute('data-g') ? GAP : COMPACT; build(); }); });
  svg.addEventListener('pointerleave', function () { if (mode === 'floor') { sel = null; paint(); } });

  fetch('assets/plans/stack.json').then(function (r) { return r.json(); }).then(function (j) { data = j; build(); })
    .catch(function () { host.classList.add('failed'); card.innerHTML = '<b>Stack unavailable</b><span>Open the floor plans on the following pages.</span>'; });
})();
