class MusGame {
  constructor(ui) {
    this.ui = ui;
    this.reset();
    this.bindUI();
  }

  reset() {
    this.scoreUs = 0;
    this.scoreThem = 0;
    this.dealer = 3;
    this.handNumber = 0;
    this.deck = [];
    this.hands = [[], [], [], []];
    this.phase = "idle";
    this.musVotes = [null, null, null, null];
    this.discardDone = [false, false, false, false];
    this.selectedDiscard = new Set();
    this.currentPlayer = 0;
    this.categoryIndex = 0;
    this.currentBet = 0;
    this.pot = 0;
    this.betAccepted = false;
    this.lastBidder = null;
    this.passCount = 0;
    this.ordago = false;
    this.results = [];
    this.logMessages = [];
  }

  bindUI() {
    this.ui.on("newGame", () => this.startGame());
    this.ui.on("newHand", () => this.startHand());
    this.ui.on("mus", () => this.playerMus(true));
    this.ui.on("noMus", () => this.playerMus(false));
    this.ui.on("discard", () => this.playerDiscard());
    this.ui.on("keep", () => this.playerKeep());
    this.ui.on("envido", () => this.playerBet("envido"));
    this.ui.on("doble", () => this.playerBet("doble"));
    this.ui.on("hacer", () => this.playerBet("hacer"));
    this.ui.on("paso", () => this.playerBet("paso"));
    this.ui.on("ordago", () => this.playerBet("ordago"));
    this.ui.on("nextHand", () => this.startHand());
    this.ui.on("toggleCard", (id) => this.toggleDiscard(id));
  }

  log(msg) {
    this.logMessages.unshift(msg);
    if (this.logMessages.length > 8) this.logMessages.pop();
    this.ui.render(this);
  }

  startGame() {
    this.reset();
    this.ui.render(this);
    this.startHand();
  }

  startHand() {
    if (this.scoreUs >= 40 || this.scoreThem >= 40) {
      this.log("¡Partida terminada! Pulsa Nueva partida.");
      this.phase = "gameover";
      this.ui.render(this);
      return;
    }

    this.handNumber += 1;
    this.dealer = (this.dealer + 1) % 4;
    this.deck = shuffle(createDeck());
    this.hands = [[], [], [], []];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.hands[i].push(this.deck.pop());
      }
    }
    this.phase = "mus";
    this.musVotes = [null, null, null, null];
    this.discardDone = [false, false, false, false];
    this.selectedDiscard.clear();
    this.categoryIndex = 0;
    this.currentBet = 0;
    this.pot = 0;
    this.betAccepted = false;
    this.lastBidder = null;
    this.passCount = 0;
    this.ordago = false;
    this.results = [];
    this.currentPlayer = (this.dealer + 1) % 4;

    this.log(`Mano ${this.handNumber}: reparto completado.`);
    this.ui.render(this);
    this.runTurn();
  }

  async runTurn() {
    if (this.phase === "mus") await this.runMusPhase();
    else if (this.phase === "discard") await this.runDiscardPhase();
    else if (this.phase === "bet") await this.runBetPhase();
  }

  async runMusPhase() {
    while (this.phase === "mus") {
      const p = this.currentPlayer;
      this.ui.render(this);

      if (p === 0) {
        this.ui.showPanel("mus");
        return;
      }

      await delay(500);
      const vote = decideMus(this.hands[p]);
      this.musVotes[p] = vote === "mus";
      this.log(`${PLAYER_NAMES[p]}: ${vote === "mus" ? "Mus" : "No mus"}`);
      this.advanceMus();
    }

    if (this.phase === "discard") {
      this.currentPlayer = (this.dealer + 1) % 4;
      await this.runDiscardPhase();
    }
  }

  advanceMus() {
    this.currentPlayer = (this.currentPlayer + 1) % 4;
    const votes = this.musVotes.filter((v) => v !== null);
    if (votes.length < 4) return;

    const allMus = this.musVotes.every((v) => v === true);
    const allNoMus = this.musVotes.every((v) => v === false);

    if (allMus || (!allMus && !allNoMus)) {
      this.phase = "discard";
      this.discardDone = [false, false, false, false];
      this.currentPlayer = (this.dealer + 1) % 4;
      this.log(allMus ? "Todos dicen Mus — fase de cambio." : "Hay distintos votos — fase de cambio.");
      this.musVotes = [null, null, null, null];
    } else if (allNoMus) {
      this.log("Todos dicen No mus — nueva mano.");
      setTimeout(() => this.startHand(), 800);
    }
  }

  playerMus(wantsMus) {
    if (this.phase !== "mus" || this.currentPlayer !== 0) return;
    this.musVotes[0] = wantsMus;
    this.log(`Tú: ${wantsMus ? "Mus" : "No mus"}`);
    this.advanceMus();
    this.ui.render(this);
    this.runTurn();
  }

  async runDiscardPhase() {
    while (this.phase === "discard") {
      const p = this.currentPlayer;
      this.ui.render(this);

      if (p === 0 && !this.discardDone[0]) {
        this.ui.showPanel("discard");
        this.ui.setSelectable(0, true);
        return;
      }

      if (!this.discardDone[p]) {
        await delay(550);
        const ids = decideDiscard(this.hands[p]);
        this.applyDiscard(p, ids);
        this.log(`${PLAYER_NAMES[p]} cambia ${ids.length} carta(s).`);
      }

      if (this.discardDone.every(Boolean)) {
        this.phase = "bet";
        this.categoryIndex = 0;
        this.startCategory();
        return;
      }

      this.currentPlayer = (this.currentPlayer + 1) % 4;
    }
  }

  toggleDiscard(cardId) {
    if (this.phase !== "discard" || this.currentPlayer !== 0) return;
    if (this.selectedDiscard.has(cardId)) this.selectedDiscard.delete(cardId);
    else if (this.selectedDiscard.size < 4) this.selectedDiscard.add(cardId);
    this.ui.render(this);
  }

  playerDiscard() {
    if (this.phase !== "discard" || this.currentPlayer !== 0) return;
    const changed = this.selectedDiscard.size;
    this.applyDiscard(0, [...this.selectedDiscard]);
    this.selectedDiscard.clear();
    this.ui.setSelectable(0, false);
    this.log(`Tú cambias ${changed} carta(s).`);
    this.currentPlayer = (this.currentPlayer + 1) % 4;
    this.ui.render(this);
    this.runDiscardPhase();
  }

  playerKeep() {
    if (this.phase !== "discard" || this.currentPlayer !== 0) return;
    this.applyDiscard(0, []);
    this.selectedDiscard.clear();
    this.ui.setSelectable(0, false);
    this.log("Te quedas con todas tus cartas.");
    this.currentPlayer = (this.currentPlayer + 1) % 4;
    this.ui.render(this);
    this.runDiscardPhase();
  }

  applyDiscard(player, cardIds) {
    const idSet = new Set(cardIds);
    const kept = this.hands[player].filter((c) => !idSet.has(c.id));
    const count = 4 - kept.length;
    for (let i = 0; i < count; i++) {
      if (this.deck.length > 0) kept.push(this.deck.pop());
    }
    this.hands[player] = kept.slice(0, 4);
    this.discardDone[player] = true;
  }

  startCategory() {
    const cat = CATEGORIES[this.categoryIndex];
    this.currentBet = 0;
    this.pot = cat.base;
    this.betAccepted = false;
    this.lastBidder = null;
    this.passCount = 0;
    this.ordago = false;
    this.currentPlayer = (this.dealer + 1) % 4;
    this.log(`Apuestas: ${cat.name} (${cat.base} piedras).`);
    this.ui.render(this);
    this.runBetPhase();
  }

  async runBetPhase() {
    while (this.phase === "bet") {
      const p = this.currentPlayer;
      this.ui.render(this);

      if (p === 0) {
        this.ui.showPanel("bet");
        return;
      }

      await delay(600);
      const cat = CATEGORIES[this.categoryIndex];
      const action = decideBet(
        { hands: this.hands, pot: this.pot, currentBet: this.currentBet },
        p,
        cat.id
      );
      this.applyBet(p, action);
    }
  }

  applyBet(player, action) {
    const cat = CATEGORIES[this.categoryIndex];
    const name = PLAYER_NAMES[player];

    if (action === "paso") {
      this.log(`${name}: Paso`);
      this.passCount += 1;
      if (this.betAccepted && this.passCount >= 3) {
        this.resolveCategory();
        return;
      }
      if (!this.betAccepted && this.passCount >= 4) {
        this.log(`Nadie apuesta en ${cat.name}.`);
        this.nextCategory();
        return;
      }
    } else if (action === "envido") {
      this.currentBet = 2;
      this.pot += 2;
      this.betAccepted = true;
      this.lastBidder = player;
      this.passCount = 0;
      this.log(`${name}: Envido (+2)`);
    } else if (action === "doble") {
      this.currentBet = Math.max(this.currentBet, 4);
      this.pot += 4;
      this.betAccepted = true;
      this.lastBidder = player;
      this.passCount = 0;
      this.log(`${name}: Doble (+4)`);
    } else if (action === "hacer") {
      this.betAccepted = true;
      this.lastBidder = player;
      this.passCount = 0;
      this.log(`${name}: Hacer (acepta ${this.currentBet || cat.base})`);
    } else if (action === "ordago") {
      this.ordago = true;
      this.betAccepted = true;
      this.lastBidder = player;
      this.passCount = 0;
      this.log(`${name}: ¡Órdago!`);
      this.resolveCategory(true);
      return;
    }

    this.currentPlayer = (this.currentPlayer + 1) % 4;
    this.ui.render(this);
  }

  playerBet(action) {
    if (this.phase !== "bet" || this.currentPlayer !== 0) return;
    this.applyBet(0, action);
    if (this.phase === "bet") this.runBetPhase();
  }

  awardPot(winnerTeam) {
    if (this.ordago) {
      if (winnerTeam === "us") this.scoreUs = 40;
      else this.scoreThem = 40;
      this.log(`¡Órdago ganado por ${winnerTeam === "us" ? "tu pareja" : "rivales"}!`);
    } else if (winnerTeam === "us") {
      this.scoreUs = Math.min(40, this.scoreUs + this.pot);
      this.log(`Ganáis ${this.pot} piedras en ${CATEGORIES[this.categoryIndex].name}.`);
    } else {
      this.scoreThem = Math.min(40, this.scoreThem + this.pot);
      this.log(`Rivales ganan ${this.pot} piedras.`);
    }
  }

  resolveCategory(fromOrdago = false) {
    const cat = CATEGORIES[this.categoryIndex];
    const winner = compareTeams(this.hands, cat.id);
    const usHand = evaluateCategory(this.hands[0], cat.id);

    let detail = "";
    if (cat.id === "grande" || cat.id === "chica") {
      detail = `Tú: ${usHand.card.label}${usHand.card.suitSymbol}`;
    } else if (cat.id === "pares") {
      detail = usHand.meta ? usHand.meta.label : "Sin pares";
    } else {
      detail = usHand.meta ? usHand.meta.label : "Sin juego";
    }

    this.results.push({
      category: cat.name,
      winner,
      detail,
      pot: this.pot,
    });

    if (winner === "tie") {
      this.log(`${cat.name}: empate, bote se pierde.`);
    } else {
      this.awardPot(winner);
    }

    if (fromOrdago || this.scoreUs >= 40 || this.scoreThem >= 40) {
      this.phase = "gameover";
      this.showShowdown();
      return;
    }
    this.nextCategory();
  }

  nextCategory() {
    this.categoryIndex += 1;
    if (this.categoryIndex >= CATEGORIES.length) {
      this.showShowdown();
      return;
    }
    this.startCategory();
  }

  showShowdown() {
    this.phase = "showdown";
    this.ui.showPanel("showdown");
    this.ui.render(this);
  }
}
