const SUITS = [
  { id: "oros", symbol: "🪙", name: "Oros", color: "red" },
  { id: "copas", symbol: "🏆", name: "Copas", color: "red" },
  { id: "espadas", symbol: "⚔️", name: "Espadas", color: "black" },
  { id: "bastos", symbol: "🪵", name: "Bastos", color: "black" },
];

const RANKS = [
  { value: 1, label: "As" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 10, label: "S" },
  { value: 11, label: "C" },
  { value: 12, label: "R" },
];

/** Grande: 3 > Rey > Caballo > Sota > 7 > 6 > 5 > 4 > 2 > As */
const GRANDE_ORDER = { 3: 1, 12: 2, 11: 3, 10: 4, 7: 5, 6: 6, 5: 7, 4: 8, 2: 9, 1: 10 };

const PLAYER_NAMES = ["Tú", "Este", "Norte", "Oeste"];

/** Partnership: 0+2 vs 1+3 */
function teamOf(player) {
  return player % 2 === 0 ? "us" : "them";
}

function partnerOf(player) {
  return (player + 2) % 4;
}

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit.id}-${rank.value}`,
        suit: suit.id,
        suitSymbol: suit.symbol,
        suitName: suit.name,
        color: suit.color,
        value: rank.value,
        label: rank.label,
      });
    }
  }
  return deck;
}

function shuffle(deck) {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function compareGrande(a, b) {
  const oa = GRANDE_ORDER[a.value];
  const ob = GRANDE_ORDER[b.value];
  if (oa !== ob) return oa - ob;
  return a.suit.localeCompare(b.suit);
}

function compareChica(a, b) {
  return compareGrande(b, a);
}

function bestGrandeCard(hand) {
  return [...hand].sort(compareGrande)[0];
}

function bestChicaCard(hand) {
  return [...hand].sort(compareChica)[0];
}

function cardJuegoValue(card) {
  if (card.value >= 10) return 10;
  return card.value;
}

function juegoSum(hand) {
  return hand.reduce((sum, c) => sum + cardJuegoValue(c), 0);
}

function analyzeJuego(hand) {
  const sum = juegoSum(hand);
  if (sum === 31) return { type: "juego", points: 3, sum, label: "31" };
  if (sum >= 32) return { type: "juego", points: 2, sum, label: String(sum) };
  if (sum >= 30) return { type: "juego", points: 1, sum, label: String(sum) };

  const values = hand.map(cardJuegoValue).sort((a, b) => b - a);
  if (values[0] === 10 && values[1] === 10) return { type: "punto", points: 4, sum, label: "Punto 4" };
  if (values[0] === 10) return { type: "punto", points: 3, sum, label: "Punto 3" };
  if (values[0] === 9) return { type: "punto", points: 2, sum, label: "Punto 2" };
  if (values[0] === 8) return { type: "punto", points: 1, sum, label: "Punto 1" };
  return null;
}

function analyzePares(hand) {
  const byValue = {};
  for (const card of hand) {
    byValue[card.value] = (byValue[card.value] || 0) + 1;
  }
  const counts = Object.values(byValue).sort((a, b) => b - a);
  const pairs = counts.filter((c) => c >= 2).length;
  const hasKingPair = hand.filter((c) => c.value === 12).length >= 2;
  const hasTrio = counts.some((c) => c >= 3);

  if (pairs >= 2) return { type: "duples", points: 3, label: "Duples" };
  if (hasKingPair) return { type: "medias", points: 2, label: "Medias" };
  if (hasTrio) return { type: "trio", points: 2, label: "Trío" };
  if (pairs >= 1) return { type: "par", points: 1, label: "Par" };
  return null;
}

function comparePares(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  if (a.points !== b.points) return a.points - b.points;
  return a.type.localeCompare(b.type);
}

function compareJuego(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  if (a.points !== b.points) return a.points - b.points;
  return a.sum - b.sum;
}

const CATEGORIES = [
  { id: "grande", name: "Grande", base: 1 },
  { id: "chica", name: "Chica", base: 1 },
  { id: "pares", name: "Pares", base: 1 },
  { id: "juego", name: "Juego", base: 2 },
];

function evaluateCategory(hand, categoryId) {
  switch (categoryId) {
    case "grande":
      return { card: bestGrandeCard(hand), meta: null };
    case "chica":
      return { card: bestChicaCard(hand), meta: null };
    case "pares":
      return { meta: analyzePares(hand) };
    case "juego":
      return { meta: analyzeJuego(hand) };
    default:
      return {};
  }
}

function teamHasCategory(hands, team, categoryId) {
  const players = team === "us" ? [0, 2] : [1, 3];
  return players.some((p) => {
    const ev = evaluateCategory(hands[p], categoryId);
    if (categoryId === "pares" || categoryId === "juego") return ev.meta !== null;
    return true;
  });
}

function bestTeamHand(hands, team, categoryId) {
  const players = team === "us" ? [0, 2] : [1, 3];
  let best = null;
  let bestPlayer = null;

  for (const p of players) {
    const ev = evaluateCategory(hands[p], categoryId);
    if (categoryId === "grande") {
      if (!best || compareGrande(ev.card, best) < 0) {
        best = ev.card;
        bestPlayer = p;
      }
    } else if (categoryId === "chica") {
      if (!best || compareChica(ev.card, best) < 0) {
        best = ev.card;
        bestPlayer = p;
      }
    } else if (categoryId === "pares") {
      if (ev.meta && (!best || comparePares(ev.meta, best) > 0)) {
        best = ev.meta;
        bestPlayer = p;
      }
    } else if (categoryId === "juego") {
      if (ev.meta && (!best || compareJuego(ev.meta, best) > 0)) {
        best = ev.meta;
        bestPlayer = p;
      }
    }
  }

  return { value: best, player: bestPlayer };
}

function compareTeams(hands, categoryId) {
  const us = bestTeamHand(hands, "us", categoryId);
  const them = bestTeamHand(hands, "them", categoryId);

  if (categoryId === "grande") {
    const cmp = compareGrande(us.value, them.value);
    return cmp < 0 ? "us" : cmp > 0 ? "them" : "tie";
  }
  if (categoryId === "chica") {
    const cmp = compareChica(us.value, them.value);
    return cmp < 0 ? "us" : cmp > 0 ? "them" : "tie";
  }
  if (categoryId === "pares") {
    if (!us.value && !them.value) return "tie";
    if (!us.value) return "them";
    if (!them.value) return "us";
    const cmp = comparePares(us.value, them.value);
    return cmp > 0 ? "us" : cmp < 0 ? "them" : "tie";
  }
  if (categoryId === "juego") {
    if (!us.value && !them.value) return "tie";
    if (!us.value) return "them";
    if (!them.value) return "us";
    const cmp = compareJuego(us.value, them.value);
    return cmp > 0 ? "us" : cmp < 0 ? "them" : "tie";
  }
  return "tie";
}

function handStrength(hands, player, categoryId) {
  const ev = evaluateCategory(hands[player], categoryId);
  if (categoryId === "grande") {
    return 11 - GRANDE_ORDER[ev.card.value];
  }
  if (categoryId === "chica") {
    return GRANDE_ORDER[ev.card.value];
  }
  if (categoryId === "pares") {
    return ev.meta ? ev.meta.points * 3 : 0;
  }
  if (categoryId === "juego") {
    return ev.meta ? ev.meta.points * 4 + (ev.meta.sum || 0) / 10 : 0;
  }
  return 0;
}
