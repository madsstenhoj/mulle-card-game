import { observable, action, toJS } from "mobx";

export interface IPlayingCard {
  id: number;
  value: string;
  color: string;
  points: number;
  number: number;
}

export interface IPlayer {
  id: string;
  name: string;
  pointsInTotal: number;
}

export enum PlayerPiles {
  HAND = 0,
  SVUPPER = 1,
  MULLE = 2,
  POINTS = 3
}

export enum EventType {
  CARD_MOVE = 0
}

export enum PileType {
  MAIN = 0,
  PLAYER = 1,
  PLAY_AREA = 2
}

interface IGameStateMove {
  toPile: string;
  cardId: number;
}

interface IGameStateChange {
  type: EventType;
  move: IGameStateMove;
}

class PlayMaker {
  gameId: string = "";
  playerId: string = "";
  socket: WebSocket = new WebSocket(
    "wss://c0gv6ahxt5.execute-api.eu-west-1.amazonaws.com/Prod"
  );

  @observable cardPiles: {
    position: string;
    cardIds: number[];
    pileType?: PileType;
  }[] = [];
  @observable cards: IPlayingCard[] = [];
  @observable players: IPlayer[] = [];

  @observable selectedCardId: number | undefined = undefined;

  init = (gameId: string, playerId: string) => {
    this.gameId = gameId;
    this.playerId = playerId;
    this.cards = this.createDeck(2);
    this.shuffleCards();
    this.addPlayers(2);

    this.cardPiles.push({
      position: "main",
      cardIds: this.cards.map(card => card.id),
      pileType: PileType.MAIN
    });

    for (let i = 0; i < 10; i++) {
      this.cardPiles.push({
        position: `play_${i}`,
        cardIds: [],
        pileType: PileType.PLAY_AREA
      });
    }

    // Connection opened
    this.socket.addEventListener("open", event => {
      console.log("Websocket open");
    });

    // Listen for messages
    this.socket.addEventListener("message", event => {
      this.updateGameState(event.data);
    });
  };

  createDeck = (amount: number) => {
    const values = [
      "K",
      "Q",
      "J",
      "10",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
      "A"
    ];
    const colors = ["ruder.png", "kloer.png", "hjerter.png", "spar.png"];

    const deck: IPlayingCard[] = [];

    let cardId = 0;
    for (let i = 0; i < amount; i++) {
      for (const color of colors) {
        for (const value of values) {
          const points = this.getPointsForCard(color, value);

          deck.push({
            value: value,
            color: color,
            id: cardId,
            points: points,
            number: this.getNumberForCard(value)
          });
          cardId++;
        }
      }
      for (let i = 0; i < 3; i++) {
        deck.push({
          value: "Joker",
          color: "joker.png",
          id: cardId,
          points: 1,
          number: 1
        });
        cardId++;
      }
    }

    return deck;
  };

  getNumberForCard(value: string) {
    switch (value) {
      case "A":
        return 1;
      case "K":
        return 13;
      case "Q":
        return 12;
      case "J":
        return 11;
      default:
        return Number(value);
    }
  }

  getPointsForCard(color: string, value: string) {
    if (value === "A") {
      return 1;
    }

    if (
      (value === "2" && color === "spar.png") ||
      (value === "10" && color === "ruder.png")
    ) {
      return 2;
    }

    if (
      (value === "5" && color === "kloer.png") ||
      (value === "4" && color === "hjerter.png")
    ) {
      return 3;
    }

    if (value === "6" && color === "ruder.png") {
      return 4;
    }

    return 0;
  }

  shuffleCards = () => {
    let currentIndex = this.cards.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = this.cards[currentIndex];
      this.cards[currentIndex] = this.cards[randomIndex];
      this.cards[randomIndex] = temporaryValue;
    }
  };

  addPlayers(amount: number) {
    for (let playerIndex = 1; playerIndex < amount + 1; playerIndex++) {
      const playerId = `player${playerIndex}`;

      this.players.push({
        id: playerId,
        name: "",
        pointsInTotal: 0
      });

      this.cardPiles.push({
        position: `${playerId}_${PlayerPiles.HAND}`,
        cardIds: [],
        pileType: PileType.PLAYER
      });

      this.cardPiles.push({
        position: `${playerId}_${PlayerPiles.SVUPPER}`,
        cardIds: [],
        pileType: PileType.PLAYER
      });

      this.cardPiles.push({
        position: `${playerId}_${PlayerPiles.POINTS}`,
        cardIds: [],
        pileType: PileType.PLAYER
      });

      this.cardPiles.push({
        position: `${playerId}_${PlayerPiles.MULLE}`,
        cardIds: [],
        pileType: PileType.PLAYER
      });
    }
  }

  dealCardsToAllPlayers(amount: number) {
    let currentCards = this.getCardsForPile("main");

    for (const player of this.players) {
      for (let i = 0; i < amount; i++) {
        const cardIdToBeSent = currentCards.pop();
        this.emitCardMove(`${player.id}_${PlayerPiles.HAND}`, cardIdToBeSent!);
      }
    }
  }

  getCardsForPile(position: string) {
    const cardPile = this.cardPiles.filter(
      cardPile => cardPile.position === position
    );

    if (!cardPile.length) {
      return [];
    }

    return cardPile[0].cardIds;
  }

  emitCardMove(toPile: string, cardId: number) {
    const data = {
      type: EventType.CARD_MOVE,
      move: {
        toPile: toPile,
        cardId: cardId
      }
    };
    this.socket.send(
      JSON.stringify({ message: "sendmessage", data: JSON.stringify(data) })
    );
  }

  getPlayingCard(cardId: number | undefined): IPlayingCard {
    return this.cards.find(card => card.id === cardId)!;
  }

  @action
  moveCardFromOnePileToAnother(cardId: number, newPilePosition: string) {
    for (const pile of this.cardPiles) {
      if (pile.position === newPilePosition) {
        if (pile.cardIds.indexOf(cardId) === -1) {
          pile.cardIds.push(cardId);
        }
      } else {
        pile.cardIds = pile.cardIds.filter(id => id !== cardId);
      }
    }
  }

  takePileHome(fromPile: string) {
    const cardIds = this.getCardsForPile(fromPile);

    const toPile = `${this.playerId}_${PlayerPiles.POINTS}`;

    for (const cardId of cardIds!) {
      this.moveCardFromOnePileToAnother(cardId, toPile);
    }
  }

  updateGameState(event: string) {
    try {
      const gameStateChange = JSON.parse(event) as IGameStateChange;
      if (gameStateChange.move) {
        const pile = this.cardPiles.find(
          pile => pile.position === gameStateChange.move.toPile
        );
        if (pile) {
          this.moveCardFromOnePileToAnother(
            gameStateChange.move.cardId,
            gameStateChange.move.toPile
          );
        }
      }
    } catch (e) {
      console.log(e);
      return;
    }
  }

  selectCard(cardId: number) {
    this.selectedCardId = cardId;
  }

  putCard(position: string | undefined) {
    if (!this.selectedCardId || !position) {
      return;
    }

    this.emitCardMove(position, this.selectedCardId);
    this.selectedCardId = undefined;
  }
}

export default PlayMaker;
