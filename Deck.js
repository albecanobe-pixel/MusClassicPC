// src/engine/Deck.js

export const SUITS = [
    "oros",
    "copas",
    "espadas",
    "bastos"
];

export const VALUES = [
    1,   // As
    2,
    3,
    4,
    5,
    6,
    7,
    10,  // Sota
    11,  // Caballo
    12   // Rey
];

export default class Deck {

    constructor() {
        this.reset();
    }

    reset() {
        this.cards = [];

        for (const suit of SUITS) {
            for (const value of VALUES) {
                this.cards.push({
                    suit,
                    value
                });
            }
        }
    }

    shuffle() {

        for (let i = this.cards.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [
                this.cards[i],
                this.cards[j]
            ] = [
                this.cards[j],
                this.cards[i]
            ];
        }

        return this;
    }

    draw() {

        if (this.cards.length === 0)
            return null;

        return this.cards.pop();
    }

    remaining() {
        return this.cards.length;
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    deal(players = 4, cardsPerPlayer = 4) {

        const hands = [];

        for (let i = 0; i < players; i++)
            hands.push([]);

        for (let c = 0; c < cardsPerPlayer; c++) {

            for (let p = 0; p < players; p++) {

                hands[p].push(this.draw());

            }

        }

        return hands;
    }

}
