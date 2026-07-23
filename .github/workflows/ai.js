function decideMus(hand) {
  const high = hand.filter((c) => [3, 12, 11, 10].includes(c.value)).length;
  const low = hand.filter((c) => [1, 2, 4].includes(c.value)).length;
  if (high >= 2) return "mus";
  if (low >= 3) return "no-mus";
  return Math.random() > 0.45 ? "mus" : "no-mus";
}

function decideDiscard(hand) {
  const sorted = [...hand].sort((a, b) => rankKeepScore(a) - rankKeepScore(b));
  const discardCount = hand.length <= 2 ? 0 : Math.random() > 0.55 ? 0 : Math.floor(Math.random() * 3) + 1;
  if (discardCount === 0) return [];
  return sorted.slice(0, discardCount).map((c) => c.id);
}

function rankKeepScore(card) {
  const keep = { 3: 10, 12: 9, 11: 8, 10: 7, 7: 5, 6: 4, 5: 3, 4: 2, 2: 1, 1: 0 };
  return keep[card.value] ?? 0;
}

function decideBet(state, player, categoryId) {
  const { hands, pot, currentBet } = state;
  const team = player % 2 === 0 ? "us" : "them";
  const strength = handStrength(hands, player, categoryId);

  if (categoryId === "pares" || categoryId === "juego") {
    const has = teamHasCategory(hands, team, categoryId);
    if (!has) return "paso";
  }

  if (currentBet === 0 && strength < 2) return "paso";
  if (strength >= 7 && currentBet < 4) return Math.random() > 0.3 ? "envido" : "doble";
  if (strength >= 4 && currentBet === 0) return Math.random() > 0.4 ? "envido" : "paso";
  if (strength >= 5 && currentBet > 0) return Math.random() > 0.5 ? "hacer" : "paso";
  if (strength >= 8 && pot >= 4) return Math.random() > 0.7 ? "ordago" : "doble";
  if (currentBet > 0 && strength < 3) return "paso";
  return Math.random() > 0.6 ? "paso" : "hacer";
}

async function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
