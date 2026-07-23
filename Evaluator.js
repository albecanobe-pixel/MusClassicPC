// src/engine/Evaluator.js

import Rules from "./Rules.js";

export default class Evaluator {

    /*
     * Devuelve el orden de juego empezando por mano
     */
    static playerOrder(mano) {

        const order = [];

        for (let i = 0; i < 4; i++) {
            order.push((mano + i) % 4);
        }

        return order;
    }

    /*
     * GRANDE
     */
    static evaluateGrande(hands, mano) {

        const order = this.playerOrder(mano);

        let winner = order[0];
        let best = Rules.sortGrande(hands[winner]);

        for (const player of order.slice(1)) {

            const current = Rules.sortGrande(hands[player]);

            if (this.compareGrande(current, best) > 0) {

                best = current;
                winner = player;

            }

        }

        return winner;
    }

    static compareGrande(handA, handB) {

        for (let i = 0; i < 4; i++) {

            const a = handA[i];
            const b = handB[i];

            const va = this.grandeValue(a.value);
            const vb = this.grandeValue(b.value);

            if (va > vb) return 1;
            if (va < vb) return -1;

        }

        return 0;
    }

    /*
     * CHICA
     */
    static evaluateChica(hands, mano) {

        const order = this.playerOrder(mano);

        let winner = order[0];
        let best = Rules.sortChica(hands[winner]);

        for (const player of order.slice(1)) {

            const current = Rules.sortChica(hands[player]);

            if (this.compareChica(current, best) > 0) {

                best = current;
                winner = player;

            }

        }

        return winner;
    }

    static compareChica(handA, handB) {

        for (let i = 0; i < 4; i++) {

            const va = this.grandeValue(handA[i].value);
            const vb = this.grandeValue(handB[i].value);

            if (va < vb) return 1;
            if (va > vb) return -1;

        }

        return 0;
    }

    /*
     * PARES
     */
    static evaluatePares(hands, mano) {

        const order = this.playerOrder(mano);

        for (const player of order) {

            if (Rules.hasPares(hands[player])) {
                return player;
            }

        }

        return null;
    }

    /*
     * JUEGO
     */
    static evaluateJuego(hands, mano) {

        const order = this.playerOrder(mano);

        let winner = null;
        let best = -1;

        for (const player of order) {

            if (!Rules.hasJuego(hands[player]))
                continue;

            const value = Rules.gameValue(hands[player]);

            if (value > best) {

                best = value;
                winner = player;

            }

        }

        return winner;
    }

    /*
     * Valores internos
     */
    static grandeValue(value) {

        if (value === 12) return 10;
        if (value === 3) return 10;

        if (value === 11) return 9;
        if (value === 10) return 8;

        if (value === 2) return 1;
        if (value === 1) return 1;

        return value;
    }

}
