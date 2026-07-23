// src/engine/PhaseManager.js

import { PHASE } from "./GameState.js";

export default class PhaseManager {

    constructor(gameState, dealer) {
        this.gameState = gameState;
        this.dealer = dealer;
    }

    startGame() {

        this.gameState.phase = PHASE.DEAL;

        this.dealer.dealNewHand();

        this.gameState.phase = PHASE.MUS;

    }

    playerVote(player, wantsMus) {

        this.gameState.voteMus(player, wantsMus);

        if (!this.gameState.everyoneVoted())
            return;

        if (this.gameState.allWantMus()) {

            this.gameState.phase = PHASE.DISCARD;

        } else {

            this.gameState.phase = PHASE.GRANDE;

        }

    }

    playerDiscard(player, indexes) {

        this.dealer.discard(player, indexes);

        const finished = this.gameState.discards.every(d => d !== null);

        if (finished) {

            this.gameState.phase = PHASE.GRANDE;

        }

    }

    finishGrande() {

        this.gameState.phase = PHASE.CHICA;

    }

    finishChica() {

        this.gameState.phase = PHASE.PARES;

    }

    finishPares(hasPares) {

        if (hasPares)
            this.gameState.phase = PHASE.JUEGO;
        else
            this.gameState.phase = PHASE.PUNTO;

    }

    finishJuego() {

        this.gameState.phase = PHASE.SCORE;

    }

    finishPunto() {

        this.gameState.phase = PHASE.SCORE;

    }

    finishScore() {

        this.gameState.nextDealer();

        this.startGame();

    }

}
