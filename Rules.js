// src/engine/Rules.js

// Valor para Grande
const GRANDE_VALUE = {
    12: 10, // Rey
    3: 10,  // Tres = Rey
    11: 9,  // Caballo
    10: 8,  // Sota
    7: 7,
    6: 6,
    5: 5,
    4: 4,
    2: 1,   // Dos = As
    1: 1
};

// Valor para Juego
const GAME_VALUE = {
    12: 10,
    11: 10,
    10: 10,
    7: 7,
    6: 6,
    5: 5,
    4: 4,
    3: 10,
    2: 1,
    1: 1
};

export default class Rules {

    static sortGrande(hand) {
        return [...hand].sort(
            (a, b) => GRANDE_VALUE[b.value] - GRANDE_VALUE[a.value]
        );
    }

    static sortChica(hand) {
        return [...hand].sort(
            (a, b) => GRANDE_VALUE[a.value] - GRANDE_VALUE[b.value]
        );
    }

    static gameValue(hand) {
        return hand.reduce(
            (sum, card) => sum + GAME_VALUE[card.value],
            0
        );
    }

    static hasJuego(hand) {
        return this.gameValue(hand) >= 31;
    }

    static hasPares(hand) {

        const values = {};

        hand.forEach(card => {

            const v =
                card.value === 3 ? 12 :
                card.value === 2 ? 1 :
                card.value;

            values[v] = (values[v] || 0) + 1;

        });

        return Object.values(values).some(v => v >= 2);
    }

    static pairType(hand) {

        const values = {};

        hand.forEach(card => {

            const v =
                card.value === 3 ? 12 :
                card.value === 2 ? 1 :
                card.value;

            values[v] = (values[v] || 0) + 1;

        });

        const counts = Object.values(values).sort((a, b) => b - a);

        if (counts[0] === 4)
            return "DUPLES";

        if (counts[0] === 3)
            return "MEDIAS";

        if (counts[0] === 2 && counts[1] === 2)
            return "DUPLES";

        if (counts[0] === 2)
            return "PARES";

        return null;
    }

}
