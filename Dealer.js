// src/engine/Dealer.js

import Deck from "./Deck.js";

export default class Dealer {

    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Inicia una nueva mano
     */
    dealNewHand() {

        const deck = new Deck();

        deck.shuffle();

        const hands = deck.deal(4, 4);

        this.gameState.startHand(deck, hands);

        return hands;
    }

    /**
     * Reparte cartas después del descarte
     */
    refillHands() {

        const deck = this.gameState.deck;

        for (let player = 0; player < 4; player++) {

            while (this.gameState.hands[player].length < 4) {

                const card = deck.draw();

                if (!card)
                    break;

                this.gameState.hands[player].push(card);

            }

        }

        return this.gameState.hands;
    }

    /**
     * Descarta cartas de un jugador
     */
    discard(playerIndex, indexes) {

        indexes.sort((a,b)=>b-a);

        for (const index of indexes) {

            const card = this.gameState.hands[playerIndex].splice(index,1)[0];

            if(card){

                this.gameState.discards[playerIndex].push(card);

            }

        }

        return this.refillHands();

    }

}
