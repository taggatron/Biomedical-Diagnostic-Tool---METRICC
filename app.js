"use strict";

// Symptoms and METRICC knowledge base
const SYMPTOMS = [
  "Fever",
  "Cough",
  "Chest Pain",
  "Shortness of Breath",
  "Abdominal Pain",
  "Headache",
  "Nausea/Vomiting",
  "Diarrhea",
  "Rash",
  "Fatigue",
];

const ORDER = [
  "Metabolic",
  "Environmental",
  "Technique",
  "Reactive",
  "Infection",
  "Congenital/Cancer",
];

// Abridged suggestions; educational only, not exhaustive
const KB = {
  "Fever": {
    Metabolic: ["Thyrotoxicosis", "Drug fever"],
    Environmental: ["Heat stroke", "Dehydration"],
    Technique: ["Post-vaccination reaction", "Contaminated sample/false positive"],
    Reactive: ["SLE flare", "Vasculitis"],
    Infection: ["Viral URTI", "Pneumonia", "UTI", "Sepsis"],
    "Congenital/Cancer": ["Lymphoma", "Leukemia"],
  },
  "Cough": {
    Metabolic: ["GERD-related microaspiration"],
    Environmental: ["Smoking", "Allergen exposure"],
    Technique: ["ACE-inhibitor cough", "Post-intubation irritation"],
    Reactive: ["Asthma", "Eosinophilic bronchitis"],
    Infection: ["Viral bronchitis", "Pneumonia", "Tuberculosis"],
    "Congenital/Cancer": ["Cystic fibrosis", "Lung cancer"],
  },
  "Chest Pain": {
    Metabolic: ["Thyrotoxicosis-related angina", "Electrolyte imbalance (muscle pain)"],
    Environmental: ["Cocaine/amphetamine use", "Cold exposure (vasospasm)"],
    Technique: ["Post-PCI complication", "Medication-induced esophagitis"],
    Reactive: ["Pericarditis (autoimmune)", "Costochondritis"],
    Infection: ["Myocarditis", "Pneumonia", "Pericarditis (infectious)"],
    "Congenital/Cancer": ["Hypertrophic cardiomyopathy", "Esophageal cancer"],
  },
  "Shortness of Breath": {
    Metabolic: ["Metabolic acidosis", "Anemia"],
    Environmental: ["Smoking-related COPD", "High altitude"],
    Technique: ["Fluid overload from IVs", "Beta-blocker induced bronchospasm"],
    Reactive: ["Asthma", "Anaphylaxis"],
    Infection: ["Pneumonia", "COVID-19"],
    "Congenital/Cancer": ["Congenital heart disease", "Lung cancer"],
  },
  "Abdominal Pain": {
    Metabolic: ["DKA", "Acute porphyria"],
    Environmental: ["Alcohol-related pancreatitis", "Foodborne illness"],
    Technique: ["Post-op ileus", "Post-ERCP pancreatitis"],
    Reactive: ["IBD flare (Crohn's/UC)", "Celiac disease"],
    Infection: ["Appendicitis", "Cholecystitis", "Gastroenteritis"],
    "Congenital/Cancer": ["Meckel's diverticulum", "Colorectal cancer"],
  },
  "Headache": {
    Metabolic: ["Hyponatremia", "Hypercapnia"],
    Environmental: ["Caffeine withdrawal", "CO exposure"],
    Technique: ["Post–lumbar puncture", "Medication overuse headache"],
    Reactive: ["Temporal arteritis", "Autoimmune disease (e.g., SLE)"],
    Infection: ["Meningitis", "Sinusitis"],
    "Congenital/Cancer": ["AV malformation", "Brain tumor"],
  },
  "Nausea/Vomiting": {
    Metabolic: ["Pregnancy (hormonal)", "Uremia"],
    Environmental: ["Motion sickness", "Alcohol intoxication"],
    Technique: ["Opioid side effect", "Post-op anesthesia", "Chemotherapy-induced"],
    Reactive: ["Migraine", "Diabetic gastroparesis"],
    Infection: ["Viral gastroenteritis", "Hepatitis"],
    "Congenital/Cancer": ["Pyloric stenosis (infant)", "GI malignancy"],
  },
  "Diarrhea": {
    Metabolic: ["Hyperthyroidism", "Diabetic autonomic neuropathy"],
    Environmental: ["Lactose intolerance", "Traveler's diarrhea exposure"],
    Technique: ["Antibiotic-associated (C. difficile)", "Bowel prep effect"],
    Reactive: ["Celiac disease", "Inflammatory bowel disease"],
    Infection: ["Viral gastroenteritis", "Bacterial dysentery", "Parasitic infection"],
    "Congenital/Cancer": ["Cystic fibrosis (pancreatic insufficiency)", "Colon cancer"],
  },
  "Rash": {
    Metabolic: ["Uremic pruritus", "Diabetic dermopathy"],
    Environmental: ["Contact dermatitis", "Sunburn"],
    Technique: ["Drug eruption (e.g., penicillin)", "Adhesive allergy post-procedure"],
    Reactive: ["Psoriasis", "Atopic dermatitis"],
    Infection: ["Varicella", "Cellulitis", "Impetigo"],
    "Congenital/Cancer": ["Neurofibromatosis", "Cutaneous T-cell lymphoma"],
  },
  "Fatigue": {
    Metabolic: ["Hypothyroidism", "Anemia", "Adrenal insufficiency"],
    Environmental: ["Sleep deprivation", "Shift work", "Depression"],
    Technique: ["Beta-blockers", "Post-surgical recovery"],
    Reactive: ["Rheumatoid arthritis", "SLE"],
    Infection: ["Mononucleosis", "Chronic infections"],
    "Congenital/Cancer": ["Congenital heart disease", "Cancer"],
  },
};

// Track currently selected symptoms on the canvas
const selectedSymptoms = new Set();

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  });
  for (const child of children) {
    if (child == null) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function initSymptoms() {
  const list = document.getElementById("symptom-list");
  list.innerHTML = "";
  SYMPTOMS.forEach((name) => {
    const btn = el(
      "button",
      {
        class: "symptom",
        draggable: "true",
        type: "button",
        title: `Drag ${name} to canvas`,
        dataset: { symptom: name },
        ondragstart: handleDragStart,
        onkeydown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            // Keyboard users: send to canvas directly
            addToCanvas(name);
            renderSieve(name);
          }
        },
      },
      name
    );
    list.appendChild(btn);
  });
}

function handleDragStart(e) {
  const symptom = e.target?.dataset?.symptom;
  if (!symptom) return;
  e.dataTransfer.setData("text/plain", symptom);
  e.dataTransfer.effectAllowed = "copy";
}

function setupCanvas() {
  const canvas = document.getElementById("canvas");
  const chips = el("div", { class: "chips", id: "chips" });
  canvas.appendChild(chips);

  canvas.addEventListener("dragover", (e) => {
    e.preventDefault();
    canvas.classList.add("dragover");
  });
  canvas.addEventListener("dragleave", () => canvas.classList.remove("dragover"));
  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    canvas.classList.remove("dragover");
    const symptom = e.dataTransfer.getData("text/plain");
    if (!symptom) return;
    addToCanvas(symptom);
    renderAllSieve();
  });
}

function addToCanvas(symptom) {
  const empty = document.querySelector(".canvas-empty");
  if (empty) empty.remove();
  const chips = document.getElementById("chips");
  if (!selectedSymptoms.has(symptom)) {
    selectedSymptoms.add(symptom);
    const chip = el("div", { class: "chip" }, symptom);
    chips.appendChild(chip);
  }
}

function buildSieveCard(title, data) {
  const card = el("article", { class: "sieve-card" });
  const header = el(
    "div",
    { class: "sieve-header" },
    el("h3", {}, title),
    el("div", { class: "sieve-badge", title: "Abridged surgical sieve" }, "⭐ METRICC")
  );
  const cats = el("div", { class: "category-list" });
  ORDER.forEach((cat) => {
    const uniq = Array.from(new Set((data[cat] || []).filter(Boolean)));
    const list = el("ul", {}, ...uniq.map((i) => el("li", {}, i)));
    cats.appendChild(el("div", { class: "category" }, el("h4", {}, cat), list));
  });
  card.appendChild(header);
  card.appendChild(cats);
  return card;
}

function renderAllSieve() {
  const results = document.getElementById("results");
  const empty = results.querySelector(".results-empty");
  if (empty) empty.remove();
  results.setAttribute("aria-busy", "true");
  results.innerHTML = "";

  // Combined first
  if (selectedSymptoms.size > 0) {
    const combined = {};
    ORDER.forEach((cat) => (combined[cat] = []));
    selectedSymptoms.forEach((sym) => {
      const d = KB[sym] || {};
      ORDER.forEach((cat) => {
        const items = d[cat] || [];
        combined[cat].push(...items);
      });
    });
    const combinedCard = buildSieveCard(
      `Combined (${Array.from(selectedSymptoms).join(", ")})`,
      combined
    );
    results.appendChild(combinedCard);
  }

  // Then per symptom
  selectedSymptoms.forEach((symptom) => {
    const data = KB[symptom] || {};
    const card = buildSieveCard(symptom, data);
    results.appendChild(card);
  });

  if (selectedSymptoms.size === 0) {
    results.appendChild(
      el("div", { class: "results-empty" }, "Drop a symptom to see ⭐ METRICC suggestions here.")
    );
  }

  results.setAttribute("aria-busy", "false");
}

function setupActions() {
  const clear = document.getElementById("clear-all");
  clear.addEventListener("click", () => {
    // Reset chips
    const canvas = document.getElementById("canvas");
    const chips = document.getElementById("chips");
    if (chips) chips.remove();
    canvas.insertAdjacentElement("afterbegin", el("div", { class: "canvas-empty" }, el("span", {}, "Drag symptoms here")));
    canvas.appendChild(el("div", { class: "chips", id: "chips" }));

    // Reset results
    const results = document.getElementById("results");
    results.innerHTML = "";
    results.appendChild(el("div", { class: "results-empty" }, "Drop a symptom to see ⭐ METRICC suggestions here."));

    // Reset state
    selectedSymptoms.clear();
  });
}

function boot() {
  initSymptoms();
  setupCanvas();
  setupActions();
}

document.addEventListener("DOMContentLoaded", boot);
