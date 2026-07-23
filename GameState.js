// src/engine/GameState.js

export const PHASE = Object.freeze({
    WAITING: "WAITING",
    DEAL: "DEAL",
    MUS: "MUS",
    DISCARD: "DISCARD",
    GRANDE: "GRANDE",
    CHICA: "CHICA",
    PARES: "PARES",
    JUEGO: "JUEGO",
    PUNTO: "PUNTO",
    SCORE: "SCORE",
    FINISHED: "FINISHED"
});

export default class GameState {

    constructor() {
        this.resetMatch();
    }

    resetMatch() {

        this.phase = PHASE.WAITING;

        this.players = [];

        this.hands = [
            [],
            [],
            [],
            []
        ];

        this.discards = [
    null,
    null,
    null,
    null
];

        this.musVotes = [
            null,
            null,
            null,
            null
        ];

        this.score = [
            0,
            0
        ];

        this.dealer = 0;

        this.mano = 0;

        this.turn = 0;

        this.deck = null;

        this.lastWinner = null;

        this.envite = null;

        this.history = [];
    }

    startHand(deck, hands) {

        this.phase = PHASE.MUS;

        this.deck = deck;

        this.hands = hands;

        this.discards = [
            [],
            [],
            [],
            []
        ];

        this.musVotes = [
            null,
            null,
            null,
            null
        ];

        this.turn = this.mano;

        this.envite = null;

        this.lastWinner = null;
    }

    nextDealer() {

        this.dealer = (this.dealer + 1) % 4;
        this.mano = this.dealer;
    }

    voteMus(player, value) {

        this.musVotes[player] = value;
    }

    everyoneVoted() {

        return this.musVotes.every(v => v !== null);
    }

    allWantMus() {

        return this.musVotes.every(v => v === true);
    }

    nextPhase() {

        switch (this.phase) {

            case PHASE.MUS:
                this.phase = PHASE.DISCARD;
                break;

            case PHASE.DISCARD:
                this.phase = PHASE.GRANDE;
                break;

            case PHASE.GRANDE:
                this.phase = PHASE.CHICA;
                break;

            case PHASE.CHICA:
                this.phase = PHASE.PARES;
                break;

            case PHASE.PARES:
                this.phase = PHASE.JUEGO;
                break;

            case PHASE.JUEGO:
                this.phase = PHASE.SCORE;
                break;

            case PHASE.SCORE:
                this.phase = PHASE.DEAL;
                break;
        }
    }

    addScore(team, stones) {

        this.score[team] += stones;

        if (this.score[team] >= 40) {
            this.phase = PHASE.FINISHED;
        }
    }

}
