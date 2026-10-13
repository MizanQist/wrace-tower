# Wrace Tower · investor concept brochure (site)

Static page-book modelled on the W Residences Dubai floor-plan brochure (see `../source/reference-design/DESIGN-NOTES.md`).
21 pages: 01 cover · 02 intro · 03 master plan (pins) · 04 location (schematic map) · 05 the building · 06–19 floor plans L01–L14 · 20 inside · 21 closing.

- `index.html` is GENERATED: edit `../tools/build_site.py` and run `python3 tools/build_site.py` from the project root. Copy, pins, map and the facts live in that script.
- Plans: `assets/plans/L*.png` come from `WEB=1 python3 tools/floorplans.py` (grey-fill web style) then `rsvg-convert -w 1800`; `schedule.json` feeds the fact blocks.
- Images: `tools/build_site_assets.sh` resizes `renders/final` and `renders/interiors/final` into `assets/img/{m,s,t}`.
- Fonts: Bricolage Grotesque only (Google Fonts). Accent `--acc` is the reference's magenta; change the one token in `assets/css/site.css` to rebrand.
- Preview: `python3 -m http.server 8731` inside `site/`. QA screenshots in `.qa/`. `robots` is noindex until launch.
- Placeholders to confirm: project name "Wrace Tower"; Wrace Group contact on page 21; map pins are diagrammatic.
