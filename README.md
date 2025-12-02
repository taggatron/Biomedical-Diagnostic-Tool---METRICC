# Diagnostic Tool — Surgical Sieve (⭐ METRICC)

A small educational web app: drag a symptom from the sidebar to the canvas to see abridged diagnostic suggestions grouped by the surgical sieve mnemonic ⭐ METRICC:

- Metabolic
- Environmental (habits/exposures)
- Technique (iatrogenic/procedural/sample issues)
- Reactive (autoimmune/atopy)
- Infection
- Congenital / Cancer

Not medical advice. For learning and brainstorming only.

## Run locally

Any static server works. On macOS with Python 3:

```bash
cd "Diagnostic_tool"
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Use

- Drag a symptom from the left sidebar onto the canvas.
- The results panel shows grouped suggestions for that symptom.
- Use "Clear All" to reset the canvas and results.

## Notes

- Content is intentionally concise and non-exhaustive.
- Add or adjust items in `app.js` → `KB` to customize.
