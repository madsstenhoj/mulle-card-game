import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { observable, computed } from "mobx";
import "./App.css";
import {
  Button,
  Grid,
  Input,
  InputOnChangeData,
  Header,
  Label
} from "semantic-ui-react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import PlayArea from "./components/PlayArea";
import PlayMaker, { PileType } from "./logic/store";
import PileOfCards from "./components/PileOfCards";
import Player from "./components/Player";

export const ItemTypes = {
  CARD: "card"
};

interface IProps {
  store?: PlayMaker;
}
@inject("store")
@observer
class App extends Component<IProps> {
  @observable showBackside: boolean = false;
  @observable putInStack: boolean = false;
  @observable isOver: boolean = false;
  @observable dealAmount: string = "8";

  componentDidMount() {
    const playerId = this.getPlayerId();
    this.props.store!.init("test", playerId);
  }

  getPlayerId() {
    const urlParts = window.location.href.split("?");

    if (urlParts.length < 2) {
      return "";
    }

    const param = urlParts[1].split("=");

    if (param[0] === "playerId") {
      return param[1];
    }

    return "";
  }

  changeDealAmount = (event: any, input: InputOnChangeData) => {
    this.dealAmount = input.value;
  };

  @computed
  get points() {
    const { store } = this.props;

    if (!store) {
      return 0;
    }

    let points = 0;
    for (const cardId of store.getCardsForPile("main")) {
      const card = store.getPlayingCard(cardId);
      points += card.points;
    }

    return points;
  }

  render() {
    const { store } = this.props;

    if (!store || store.cards.length === 0) {
      return null;
    }

    return (
      <DndProvider backend={Backend}>
        <Header as={"h1"}>Mulle!</Header>

        {store!.playerId === "player1" && (
          <div
            style={{ padding: 30, marginBottom: 50, backgroundColor: "#AAA" }}
          >
            <PileOfCards
              piled={true}
              cardIds={store.getCardsForPile("main")}
              backsideUp={true}
            />
            <Button
              onClick={() =>
                store.dealCardsToAllPlayers(Number(this.dealAmount))
              }
            >
              Fordel kort
            </Button>
            <Input value={this.dealAmount} onChange={this.changeDealAmount} />
            <Label content={this.points} />
          </div>
        )}

        <Grid columns={10} style={{ width: "80%", margin: "0 auto" }}>
          {store.cardPiles
            .filter(pile => pile.pileType === PileType.PLAY_AREA)
            .map(pile => (
              <Grid.Column>
                <PlayArea
                  position={pile.position}
                  piled={true}
                  backsideUp={false}
                />
              </Grid.Column>
            ))}
        </Grid>

        <Grid columns={3} divided={true}>
          <Grid.Row>
            <Grid.Column>
              <Player playerId={"player1"} />
            </Grid.Column>
            <Grid.Column>
              <Player playerId={"player2"} />
            </Grid.Column>
            <Grid.Column>
              <Player playerId={"player3"} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </DndProvider>
    );
  }
}

export default App;
