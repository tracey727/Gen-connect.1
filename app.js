(() => {
  "use strict";

  const STORAGE_KEY = "genevieve.connection.v2";
  const APP_VERSION = 2;

  const STAGES = [
    {
      n: 1,
      title: "Familiarity",
      copy: "Talk naturally when you cross paths. No pressure to manufacture contact."
    },
    {
      n: 2,
      title: "Deliberate Contact",
      copy: "Make one low-stakes invitation outside the original context."
    },
    {
      n: 3,
      title: "One-to-One Time",
      copy: "Spend time together outside the place where you originally met."
    },
    {
      n: 4,
      title: "Personal Depth",
      copy: "Let stories, values and opinions deepen naturally without interrogation."
    },
    {
      n: 5,
      title: "Reciprocity Check",
      copy: "Pause. If you stepped forward last time, notice whether they take a step too."
    },
    {
      n: 6,
      title: "Gentle Naming",
      copy: "Name the romantic possibility without demanding a label or immediate answer."
    }
  ];

  const ACTIVITY_IDEAS = [
    { max: 0, title: "Walk together", copy: "A short walk in a familiar public place." },
    { max: 0, title: "Dog-park chat", copy: "Stay with the natural shared routine and talk a little longer." },
    { max: 0, title: "Free community event", copy: "Look for a library, council or community activity." },
    { max: 0, title: "Bring-your-own drink", copy: "Meet in a public park and bring your own water or coffee." },
    { max: 10, title: "Simple coffee", copy: "One drink, short duration, easy to leave or extend." },
    { max: 10, title: "Shared snack", copy: "Keep it low-cost and low-pressure." },
    { max: 25, title: "Casual lunch", copy: "Choose somewhere relaxed rather than a high-stakes date setting." },
    { max: 25, title: "Local activity", copy: "A small museum, market, mini-golf or community venue if available." },
    { max: 50, title: "Comedy or small event", copy: "A ticketed activity with a clear start/end time and shared focus." }
  ];

  const RED_LABELS = {
    pressureAfterNo: "pressure after no",
    possessive: "possessiveness / jealousy",
    isolation: "isolation attempt",
    humiliation: "humiliation",
    monitoring: "intrusive monitoring",
    anger: "intimidating anger",
    sexualPressure: "sexual pressure",
    financialPressure: "financial pressure",
    boundaryPunishment: "boundary punishment"
  };

  const YELLOW_LABELS = {
    fastIntensity: "fast intensity",
    mixedSignals: "mixed signals",
    guessing: "constant guessing"
  };

  const POSITIVE_LABELS = {
    depth: "natural depth",
    memory: "active memory",
    curiosity: "mutual curiosity",
    silence: "comfortable silence",
    boundary: "boundary respected",
    autonomy: "autonomy respected"
  };

  const defaultState = () => ({
    version: APP_VERSION,
    activeConnectionId: null,
    settings: { budget: "0" },
    connections: []
  });

  let state = loadState();

  function byId(id) { return document.getElementById(id); }
  function qsa(selector, root = document) { return [...root.querySelectorAll(selector)]; }

  function uid() {
    if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function safeText(value) {
    return String(value ?? "");
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== APP_VERSION || !Array.isArray(parsed.connections)) {
        return defaultState();
      }
      parsed.settings = parsed.settings || { budget: "0" };
      return parsed;
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function activeConnection() {
    return state.connections.find(c => c.id === state.activeConnectionId) || null;
  }

  function toast(message) {
    const el = byId("toast");
    el.textContent = message;
    el.classList.remove("hidden");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.classList.add("hidden"), 3000);
  }

  function switchView(viewName) {
    qsa(".tab").forEach(btn => btn.classList.toggle("active", btn.dataset.view === viewName));
    qsa(".view").forEach(view => view.classList.toggle("active", view.id === `view-${viewName}`));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (viewName === "connections") renderConnections();
  }

  function interactionPercentages(connection) {
    const items = connection.interactions || [];
    if (!items.length) {
      return { myInit: 0, theirInit: 0, sharedInit: 0, myLogistics: 0, count: 0 };
    }
    const pct = count => Math.round((count / items.length) * 100);
    return {
      myInit: pct(items.filter(i => i.initiator === "me").length),
      theirInit: pct(items.filter(i => i.initiator === "them").length),
      sharedInit: pct(items.filter(i => i.initiator === "shared").length),
      myLogistics: pct(items.filter(i => i.logistics === "me").length),
      count: items.length
    };
  }

  function assess(connection) {
    const items = connection.interactions || [];
    const anyRed = items.some(i => (i.red || []).length > 0 || i.feltSafety === "unsafe");
    if (anyRed) {
      const latestRed = [...items].reverse().find(i => (i.red || []).length > 0 || i.feltSafety === "unsafe");
      const redNames = (latestRed?.red || []).map(x => RED_LABELS[x] || x);
      return {
        level: "red",
        label: "Red — freeze progression",
        lock: true,
        reason: redNames.length
          ? `A red safety indicator was logged: ${redNames.join(", ")}.`
          : "An interaction was logged as unsafe or pressured.",
        action: "Do not use attraction, loneliness, apology, or intensity as a reason to override this. Prioritise your safety and choose distance or support appropriate to the situation."
      };
    }

    if (items.length < 3) {
      return {
        level: "neutral",
        label: "Not enough data",
        lock: false,
        reason: `You have ${items.length} of 3 interactions needed before the app calls a pattern.`,
        action: "Keep the pace small and reversible. Notice behaviour rather than filling in missing information."
      };
    }

    const last3 = items.slice(-3);
    const threeMeInit = last3.every(i => i.initiator === "me");
    const threeMeLogistics = last3.every(i => i.logistics === "me");
    const pct = interactionPercentages(connection);
    const anyYellow = last3.some(i => (i.yellow || []).length > 0 || i.feltSafety === "uncertain");
    const overloaded = pct.myInit >= 70 || pct.myLogistics >= 70;

    if (threeMeInit || threeMeLogistics || overloaded || anyYellow) {
      const reasons = [];
      if (threeMeInit) reasons.push("you initiated all of the last three interactions");
      if (threeMeLogistics) reasons.push("you carried all logistics in the last three interactions");
      if (pct.myInit >= 70) reasons.push(`you initiated about ${pct.myInit}% of logged interactions`);
      if (pct.myLogistics >= 70) reasons.push(`you carried about ${pct.myLogistics}% of logged logistics`);
      if (anyYellow) reasons.push("a yellow indicator or uncertain internal state was logged recently");
      return {
        level: "yellow",
        label: "Yellow — pause and observe",
        lock: true,
        reason: reasons.join("; ") + ".",
        action: "Stop accelerating. Do not make the next relationship step. Give the other person room to create a counter-action, or step back one stage."
      };
    }

    const calm = items.filter(i => i.feltSafety === "calm").length;
    const positiveCount = items.reduce((sum, i) => sum + (i.positive || []).length, 0);
    const possible = items.length * 6;
    const positiveRate = possible ? Math.round((positiveCount / possible) * 100) : 0;
    const reciprocalInitiation = pct.myInit <= 60;

    if (reciprocalInitiation && calm >= Math.ceil(items.length / 2) && positiveRate >= 35) {
      return {
        level: "green",
        label: "Green — proceed naturally",
        lock: false,
        reason: "The logged pattern currently shows reciprocity, calm/safety, and multiple positive connection signals.",
        action: "You may consider one small next step, then notice whether the other person matches pace."
      };
    }

    return {
      level: "neutral",
      label: "Observe — pattern still forming",
      lock: false,
      reason: "There is enough history to observe, but not enough balanced evidence for a green pattern.",
      action: "Stay at the current stage. Keep the next interaction ordinary and look for reciprocal effort."
    };
  }

  function reciprocity(connection) {
    const items = connection.interactions || [];
    if (items.length < 3) return { score: null, text: "Pattern begins after three interactions." };

    const initPoints = items.reduce((sum, i) => sum + (i.initiator === "shared" ? 1 : i.initiator === "them" ? 1 : 0), 0);
    const logisticsPoints = items.reduce((sum, i) => sum + (i.logistics === "shared" ? 1 : i.logistics === "them" ? 1 : 0), 0);
    const positivePoints = items.reduce((sum, i) => sum + Math.min((i.positive || []).length / 3, 1), 0);
    const safetyPoints = items.reduce((sum, i) => sum + (i.feltSafety === "calm" ? 1 : i.feltSafety === "uncertain" ? .4 : 0), 0);

    const raw = (initPoints + logisticsPoints + positivePoints + safetyPoints) / (items.length * 4);
    const score = Math.max(0, Math.min(100, Math.round(raw * 100)));
    let text = "Uneven";
    if (score >= 70) text = "Strongly reciprocal pattern";
    else if (score >= 50) text = "Mixed but potentially reciprocal";
    else if (score >= 35) text = "More observation needed";
    return { score, text };
  }

  function renderDashboard() {
    const connection = activeConnection();
    byId("emptyDashboard").classList.toggle("hidden", Boolean(connection));
    byId("dashboardContent").classList.toggle("hidden", !connection);

    if (!connection) return;

    byId("summaryName").textContent = connection.name;
    byId("summaryContext").textContent = connection.context || "No context recorded";
    byId("summaryStage").textContent = `Stage ${connection.stage}: ${STAGES[connection.stage - 1].title}`;
    byId("stageAdvice").textContent = STAGES[connection.stage - 1].copy;
    byId("stageNumberPill").textContent = `Stage ${connection.stage}`;

    const assessment = assess(connection);
    const badge = byId("trafficBadge");
    badge.className = `traffic-badge ${assessment.level}`;
    badge.textContent = assessment.label;
    byId("trafficReason").textContent = assessment.reason;

    const r = reciprocity(connection);
    byId("reciprocityScore").textContent = r.score === null ? "—" : `${r.score}/100`;
    byId("reciprocityText").textContent = r.text;

    const lockCard = byId("actionLockCard");
    if (assessment.lock) {
      lockCard.classList.remove("hidden", "yellow-alert", "red-alert");
      lockCard.classList.add(assessment.level === "red" ? "red-alert" : "yellow-alert");
      byId("actionLockTitle").textContent = assessment.label;
      byId("actionLockText").textContent = assessment.action;
    } else {
      lockCard.classList.add("hidden");
    }

    const forward = byId("stageForwardBtn");
    const back = byId("stageBackBtn");
    back.disabled = connection.stage <= 1;
    forward.disabled = connection.stage >= 6 || assessment.lock;
    byId("stageLockMessage").textContent = assessment.lock
      ? "Advancement is locked by the traffic-light guardrail. You can always step back."
      : connection.stage >= 6
        ? "You are at Stage 6. The app does not push beyond gentle naming."
        : "Only advance one stage at a time. A step can always be reversed.";

    renderStages(connection);
    renderInteractions(connection);
    byId("isolationCheck").value = connection.sobriety?.isolation || "";
    byId("foundationCheck").value = connection.sobriety?.foundation || "";
    byId("budgetSelect").value = state.settings.budget || "0";
    renderActivityIdeas();
  }

  function renderStages(connection) {
    const list = byId("stageList");
    list.innerHTML = "";
    STAGES.forEach(stage => {
      const li = document.createElement("li");
      li.className = "stage-item";
      if (stage.n === connection.stage) li.classList.add("active");
      if (stage.n < connection.stage) li.classList.add("complete");

      const number = document.createElement("div");
      number.className = "stage-number";
      number.textContent = stage.n;

      const body = document.createElement("div");
      const title = document.createElement("p");
      title.className = "stage-title";
      title.textContent = stage.title;
      const copy = document.createElement("p");
      copy.className = "stage-copy";
      copy.textContent = stage.copy;
      body.append(title, copy);

      li.append(number, body);
      list.append(li);
    });
  }

  function renderInteractions(connection) {
    const items = connection.interactions || [];
    const pct = interactionPercentages(connection);
    byId("interactionStats").innerHTML = "";
    [
      `${items.length} interaction${items.length === 1 ? "" : "s"}`,
      `Me initiated: ${pct.myInit}%`,
      `Them initiated: ${pct.theirInit}%`,
      `Shared: ${pct.sharedInit}%`,
      `Me carried logistics: ${pct.myLogistics}%`
    ].forEach(text => {
      const span = document.createElement("span");
      span.className = "stat-chip";
      span.textContent = text;
      byId("interactionStats").append(span);
    });

    const list = byId("interactionList");
    list.innerHTML = "";
    if (!items.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "No interactions logged yet.";
      list.append(p);
      return;
    }

    [...items].reverse().forEach((item, reverseIndex) => {
      const article = document.createElement("article");
      article.className = "interaction";

      const header = document.createElement("div");
      header.className = "interaction-header";

      const left = document.createElement("div");
      const title = document.createElement("h4");
      title.textContent = new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric"
      });
      const meta = document.createElement("p");
      meta.className = "muted";
      meta.textContent = `Initiation: ${prettyParty(item.initiator)} · Logistics: ${prettyParty(item.logistics)} · Felt: ${item.feltSafety}`;
      left.append(title, meta);

      const remove = document.createElement("button");
      remove.className = "button secondary";
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => {
        const realIndex = items.length - 1 - reverseIndex;
        if (confirm("Delete this interaction entry?")) {
          connection.interactions.splice(realIndex, 1);
          saveState();
          renderAll();
          toast("Interaction deleted.");
        }
      });

      header.append(left, remove);
      article.append(header);

      const tags = document.createElement("div");
      tags.className = "tag-row";
      (item.positive || []).forEach(key => tags.append(makeTag(POSITIVE_LABELS[key] || key, "green")));
      (item.yellow || []).forEach(key => tags.append(makeTag(YELLOW_LABELS[key] || key, "yellow")));
      (item.red || []).forEach(key => tags.append(makeTag(RED_LABELS[key] || key, "red")));
      if (item.feltSafety === "unsafe") tags.append(makeTag("felt unsafe / pressured", "red"));
      if (item.feltSafety === "uncertain") tags.append(makeTag("felt uncertain", "yellow"));
      article.append(tags);

      if (item.note) {
        const note = document.createElement("p");
        note.textContent = item.note;
        article.append(note);
      }
      list.append(article);
    });
  }

  function makeTag(text, level) {
    const span = document.createElement("span");
    span.className = `tag ${level}`;
    span.textContent = text;
    return span;
  }

  function prettyParty(value) {
    if (value === "me") return "mostly me";
    if (value === "them") return "mostly them";
    return "shared";
  }

  function renderConnections() {
    const list = byId("connectionsList");
    list.innerHTML = "";

    if (!state.connections.length) {
      const card = document.createElement("div");
      card.className = "card empty-state";
      const h = document.createElement("h3");
      h.textContent = "No connections yet";
      const p = document.createElement("p");
      p.textContent = "Create a private record when there is a real person you are getting to know.";
      card.append(h, p);
      list.append(card);
      return;
    }

    state.connections.forEach(connection => {
      const card = document.createElement("article");
      card.className = "card connection-card";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = `Stage ${connection.stage}`;
      const title = document.createElement("h3");
      title.textContent = connection.name;
      const context = document.createElement("p");
      context.className = "muted";
      context.textContent = connection.context || "No context recorded";

      const assessment = assess(connection);
      const badge = document.createElement("div");
      badge.className = `traffic-badge ${assessment.level}`;
      badge.textContent = assessment.label;

      const count = document.createElement("p");
      count.className = "muted";
      count.textContent = `${connection.interactions.length} interaction${connection.interactions.length === 1 ? "" : "s"} logged`;

      const actions = document.createElement("div");
      actions.className = "button-row";

      const open = document.createElement("button");
      open.className = "button primary";
      open.type = "button";
      open.textContent = "Open";
      open.addEventListener("click", () => {
        state.activeConnectionId = connection.id;
        saveState();
        renderAll();
        switchView("dashboard");
      });

      const remove = document.createElement("button");
      remove.className = "button secondary";
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => {
        if (confirm(`Delete the private record for "${connection.name}"?`)) {
          state.connections = state.connections.filter(c => c.id !== connection.id);
          if (state.activeConnectionId === connection.id) {
            state.activeConnectionId = state.connections[0]?.id || null;
          }
          saveState();
          renderAll();
          toast("Connection deleted.");
        }
      });

      actions.append(open, remove);
      card.append(eyebrow, title, context, badge, count, actions);
      list.append(card);
    });
  }

  function renderActivityIdeas() {
    const budget = Number(state.settings.budget || 0);
    const wrap = byId("activityIdeas");
    wrap.innerHTML = "";
    ACTIVITY_IDEAS.filter(i => i.max <= budget).forEach(idea => {
      const el = document.createElement("article");
      el.className = "idea";
      const h = document.createElement("h4");
      h.textContent = idea.title;
      const p = document.createElement("p");
      p.textContent = idea.copy;
      el.append(h, p);
      wrap.append(el);
    });
  }

  function renderAll() {
    renderDashboard();
    renderConnections();
  }

  function openConnectionDialog() {
    byId("connectionForm").reset();
    byId("connectionDialog").showModal();
    window.setTimeout(() => byId("connectionName").focus(), 10);
  }

  function openInteractionDialog() {
    if (!activeConnection()) {
      toast("Add or open a connection first.");
      return;
    }
    byId("interactionForm").reset();
    byId("interactionDate").value = new Date().toISOString().slice(0, 10);
    byId("interactionDialog").showModal();
  }

  function collectChecked(name) {
    return qsa(`input[name="${name}"]:checked`, byId("interactionForm")).map(el => el.value);
  }

  function saveConnectionFromForm(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const name = byId("connectionName").value.trim();
    if (!name) return;

    const connection = {
      id: uid(),
      name,
      context: byId("connectionContext").value.trim(),
      note: byId("connectionNote").value.trim(),
      stage: 1,
      createdAt: new Date().toISOString(),
      sobriety: { isolation: "", foundation: "" },
      interactions: []
    };
    state.connections.push(connection);
    state.activeConnectionId = connection.id;
    saveState();
    byId("connectionDialog").close();
    renderAll();
    switchView("dashboard");
    toast("Connection added.");
  }

  function saveInteractionFromForm(event) {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const connection = activeConnection();
    if (!connection) return;

    connection.interactions.push({
      id: uid(),
      date: byId("interactionDate").value,
      initiator: byId("initiator").value,
      logistics: byId("logistics").value,
      feltSafety: byId("feltSafety").value,
      positive: collectChecked("positive"),
      yellow: collectChecked("yellow"),
      red: collectChecked("red"),
      note: byId("interactionNote").value.trim(),
      createdAt: new Date().toISOString()
    });

    connection.interactions.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare || a.createdAt.localeCompare(b.createdAt);
    });

    saveState();
    byId("interactionDialog").close();
    renderAll();
    const assessment = assess(connection);
    if (assessment.level === "red") toast("Red safety indicator logged. Progression is frozen.");
    else if (assessment.level === "yellow") toast("Yellow pattern detected. Progression is paused.");
    else toast("Interaction saved.");
  }

  function exportBackup() {
    const payload = {
      app: "GENEVIEVE Connection & Relationship System",
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      warning: "Private relationship data. Store this file securely.",
      data: state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genevieve-connection-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Private backup exported.");
  }

  async function importBackup(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming = parsed?.data || parsed;
      if (!incoming || incoming.version !== APP_VERSION || !Array.isArray(incoming.connections)) {
        throw new Error("This is not a compatible V2.0 backup.");
      }
      if (!confirm("Replace all current app data with this backup?")) return;
      state = incoming;
      saveState();
      renderAll();
      switchView("dashboard");
      toast("Backup imported.");
    } catch (err) {
      alert(err.message || "Could not import this backup.");
    } finally {
      byId("importInput").value = "";
    }
  }

  function bindEvents() {
    qsa(".tab").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));

    byId("newConnectionBtn").addEventListener("click", openConnectionDialog);
    byId("newConnectionBtn2").addEventListener("click", openConnectionDialog);
    byId("logInteractionBtn").addEventListener("click", openInteractionDialog);

    byId("connectionForm").addEventListener("submit", saveConnectionFromForm);
    byId("interactionForm").addEventListener("submit", saveInteractionFromForm);

    byId("stageBackBtn").addEventListener("click", () => {
      const c = activeConnection();
      if (!c || c.stage <= 1) return;
      c.stage -= 1;
      saveState();
      renderAll();
      toast(`Stepped back to Stage ${c.stage}.`);
    });

    byId("stageForwardBtn").addEventListener("click", () => {
      const c = activeConnection();
      if (!c || c.stage >= 6) return;
      const assessment = assess(c);
      if (assessment.lock) {
        toast("Progression is currently paused by a safety guardrail.");
        return;
      }
      if (!confirm(`Advance from Stage ${c.stage} to Stage ${c.stage + 1}? Keep the next step small and reversible.`)) return;
      c.stage += 1;
      saveState();
      renderAll();
      toast(`Advanced to Stage ${c.stage}.`);
    });

    byId("isolationCheck").addEventListener("change", event => {
      const c = activeConnection();
      if (!c) return;
      c.sobriety = c.sobriety || {};
      c.sobriety.isolation = event.target.value;
      saveState();
    });

    byId("foundationCheck").addEventListener("change", event => {
      const c = activeConnection();
      if (!c) return;
      c.sobriety = c.sobriety || {};
      c.sobriety.foundation = event.target.value;
      saveState();
    });

    byId("budgetSelect").addEventListener("change", event => {
      state.settings.budget = event.target.value;
      saveState();
      renderActivityIdeas();
    });

    byId("exportBtn").addEventListener("click", exportBackup);
    byId("importInput").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) importBackup(file);
    });

    byId("clearDataBtn").addEventListener("click", () => {
      const first = confirm("Delete every connection, interaction, sobriety check and budget setting from this browser?");
      if (!first) return;
      const second = confirm("This cannot be undone unless you exported a backup. Delete all data now?");
      if (!second) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      renderAll();
      switchView("dashboard");
      toast("All app data deleted.");
    });

    byId("quickHideBtn").addEventListener("click", () => {
      byId("hiddenScreen").classList.remove("hidden");
      byId("restoreScreenBtn").focus();
    });

    byId("restoreScreenBtn").addEventListener("click", () => {
      byId("hiddenScreen").classList.add("hidden");
      byId("quickHideBtn").focus();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !byId("hiddenScreen").classList.contains("hidden")) {
        byId("hiddenScreen").classList.add("hidden");
      }
    });
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").catch(() => {});
      });
    }
  }

  bindEvents();
  renderAll();
  registerServiceWorker();
})();
