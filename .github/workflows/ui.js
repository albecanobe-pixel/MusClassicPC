class GameUI {
  constructor() {
    this.handlers = {};
    this.selectable = false;
    this.cacheEls();
  }

  cacheEls() {
    this.els = {
      scoreUs: document.getElementById("score-us"),
      scoreThem: document.getElementById("score-them"),
      phaseLabel: document.getElementById("phase-label"),
      statusText: document.getElementById("status-text"),
      deckCount: document.getElementById("deck-count"),
      potValue: document.getElementById("pot-value"),
      messageLog: document.getElementById("message-log"),
      betCategory: document.getElementById("bet-category"),
      betHint: document.getElementById("bet-hint"),
      showdownResults: document.getElementById("showdown-results"),
      panels: {
        mus: document.getElementById("panel-mus"),
        discard: document.getElementById("panel-discard"),
        bet: document.getElementById("panel-bet"),
        showdown: document.getElementById("panel-showdown"),
        start: document.getElementById("panel-start"),
      },
      hands: [
        document.getElementById("hand-0"),
        document.getElementById("hand-1"),
        document.getElementById("hand-2"),
        document.getElementById("hand-3"),
      ],
      slots: document.querySelectorAll(".player-slot"),
    };

    document.getElementById("btn-new-game").addEventListener("click", () => this.emit("newGame"));
    document.getElementById("btn-new-hand").addEventListener("click", () => this.emit("newHand"));
    document.getElementById("btn-mus").addEventListener("click", () => this.emit("mus"));
    document.getElementById("btn-no-mus").addEventListener("click", () => this.emit("noMus"));
    document.getElementById("btn-discard").addEventListener("click", () => this.emit("discard"));
    document.getElementById("btn-keep").addEventListener("click", () => this.emit("keep"));
    document.getElementById("btn-envido").addEventListener("click", () => this.emit("envido"));
    document.getElementById("btn-doble").addEventListener("click", () => this.emit("doble"));
    document.getElementById("btn-hacer").addEventListener("click", () => this.emit("hacer"));
    document.getElementById("btn-paso").addEventListener("click", () => this.emit("paso"));
    document.getElementById("btn-ordago").addEventListener("click", () => this.emit("ordago"));
    document.getElementById("btn-next-hand").addEventListener("click", () => this.emit("nextHand"));
  }

  on(event, fn) {
    this.handlers[event] = fn;
  }

  emit(event, data) {
    this.handlers[event]?.(data);
  }

  showPanel(name) {
    Object.entries(this.els.panels).forEach(([key, el]) => {
      if (key === "start") {
        el.classList.toggle("hidden", name === "showdown" || name === "mus" && false);
        return;
      }
      el.classList.toggle("hidden", key !== name);
    });
  }

  setSelectable(player, enabled) {
    this.selectable = enabled && player === 0;
  }

  renderCard(card, { selected = false, selectable = false } = {}) {
    const el = document.createElement("div");
    el.className = `card ${card.color}${selected ? " selected" : ""}${selectable ? " selectable" : ""}`;
    el.dataset.id = card.id;
    el.innerHTML = `
      <span class="card-rank">${card.label}</span>
      <span class="card-suit">${card.suitSymbol}</span>
      <span class="card-rank-bottom">${card.label}</span>
    `;
    if (selectable) {
      el.addEventListener("click", () => this.emit("toggleCard", card.id));
    }
    return el;
  }

  render(game) {
    this.els.scoreUs.textContent = game.scoreUs;
    this.els.scoreThem.textContent = game.scoreThem;
    this.els.deckCount.textContent = game.deck.length;
    this.els.potValue.textContent = game.pot;

    this.els.phaseLabel.textContent = `Mano ${game.handNumber || 0}`;
    this.els.statusText.textContent = this.statusMessage(game);

    this.els.messageLog.innerHTML = game.logMessages.map((m) => `<p>${m}</p>`).join("");

    game.hands.forEach((hand, i) => {
      const container = this.els.hands[i];
      container.innerHTML = "";
      hand.forEach((card) => {
        const selected = game.selectedDiscard?.has(card.id);
        const selectable = this.selectable && i === 0;
        container.appendChild(this.renderCard(card, { selected, selectable }));
      });
      while (container.children.length < 4) {
        const empty = document.createElement("div");
        empty.className = "card empty";
        container.appendChild(empty);
      }
    });

    this.els.slots.forEach((slot) => {
      const p = Number(slot.dataset.player);
      slot.classList.toggle("active", p === game.currentPlayer && !["idle", "showdown", "gameover"].includes(game.phase));
    });

    if (game.phase === "bet") {
      const cat = CATEGORIES[game.categoryIndex];
      this.els.betCategory.textContent = cat.name;
      this.els.betHint.textContent = game.currentBet
        ? `Apuesta actual: ${game.currentBet} piedras. Pot: ${game.pot}.`
        : `Apuesta base ${cat.base} piedra(s).`;
    }

    if (game.phase === "showdown" || game.phase === "gameover") {
      this.showPanel("showdown");
      this.els.showdownResults.innerHTML = game.results
        .map((r) => {
          const win = r.winner === "us" ? "win" : r.winner === "them" ? "lose" : "";
          const who = r.winner === "us" ? "Ganáis" : r.winner === "them" ? "Pierdes" : "Empate";
          return `<p class="${win}"><strong>${r.category}:</strong> ${who} (${r.pot} piedras) — ${r.detail}</p>`;
        })
        .join("");

      if (game.scoreUs >= 40) {
        this.els.showdownResults.innerHTML += `<p class="win"><strong>¡Victoria! Llegáis a 40 piedras.</strong></p>`;
      } else if (game.scoreThem >= 40) {
        this.els.showdownResults.innerHTML += `<p class="lose"><strong>Derrota: rivales a 40 piedras.</strong></p>`;
      }
    }

    document.getElementById("btn-new-hand").disabled = game.phase === "idle" || game.phase === "gameover";
  }

  statusMessage(game) {
    switch (game.phase) {
      case "idle":
        return "Pulsa «Nueva partida» para empezar";
      case "mus":
        return game.currentPlayer === 0 ? "Tu turno: Mus o No mus" : `${PLAYER_NAMES[game.currentPlayer]} piensa...`;
      case "discard":
        return game.currentPlayer === 0 ? "Selecciona cartas para cambiar" : "Fase de cambio";
      case "bet":
        return game.currentPlayer === 0
          ? `Apuesta en ${CATEGORIES[game.categoryIndex].name}`
          : `${PLAYER_NAMES[game.currentPlayer]} apuesta...`;
      case "showdown":
        return "Mano terminada";
      case "gameover":
        return "Partida terminada";
      default:
        return "";
    }
  }
}
