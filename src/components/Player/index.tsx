import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Segment, Grid, Label } from "semantic-ui-react";
import PileOfCards from "../PileOfCards";
import PlayMaker, { IPlayer, PlayerPiles } from "../../logic/store";
import { observable, computed } from "mobx";
import PlayArea from "../PlayArea";
import PlayingCard from "../PlayingCard";

interface IProps {
  playerId: string;
  store?: PlayMaker;
}
@inject("store")
@observer
class Player extends Component<IProps> {
  @observable player: IPlayer | undefined = undefined;

  componentDidMount() {
    const player = this.props.store!.players.filter(
      player => player.id === this.props.playerId
    );
    if (player.length === 0) {
      return;
    }

    this.player = player[0];
  }

  @computed
  get points() {
    const { store } = this.props;

    if (!store) {
      return 0;
    }

    let pointCardIds = store.getCardsForPile(
      `${store.playerId}_${PlayerPiles.POINTS}`
    );

    let mulleCardIds = store.getCardsForPile(
      `${store.playerId}_${PlayerPiles.MULLE}`
    );

    let svupperCardIds = store.getCardsForPile(
      `${store.playerId}_${PlayerPiles.SVUPPER}`
    );

    let points = 0;

    for (const cardId of pointCardIds
      .concat(mulleCardIds)
      .concat(svupperCardIds)) {
      const card = store.getPlayingCard(cardId);
      points += card.points;
    }

    return points;
  }

  @computed
  get loosePoints() {
    const { store } = this.props;

    if (!store) {
      return 0;
    }

    let svuppereCardIds = store.getCardsForPile(
      `${store.playerId}_${PlayerPiles.SVUPPER}`
    );

    let mulleCardIds = store.getCardsForPile(
      `${store.playerId}_${PlayerPiles.MULLE}`
    );

    let points = 0;

    for (const cardId of svuppereCardIds) {
      points++;
    }

    for (const cardId of mulleCardIds) {
      points += 5;
    }

    return points;
  }

  render() {
    if (!this.player) {
      return null;
    }

    const { store } = this.props;

    return (
      <Segment>
        <h2>{this.props.playerId}</h2>
        <Segment>
          <PileOfCards
            piled={false}
            backsideUp={this.props.playerId !== this.props.store!.playerId}
            cardIds={store!.getCardsForPile(
              `${this.player.id}_${PlayerPiles.HAND}`
            )}
          />
        </Segment>
        <Segment>
          <Label content={`Faste point: ${this.points}`} />
          <Label content={`Løse point: ${this.loosePoints}`} />
          <Grid columns={3}>
            <Grid.Column>
              <PlayArea
                piled={true}
                backsideUp={false}
                position={`${this.player.id}_${PlayerPiles.SVUPPER}`}
                title={"Svuppere"}
              />
            </Grid.Column>
            <Grid.Column>
              <PlayArea
                piled={true}
                backsideUp={true}
                position={`${this.player.id}_${PlayerPiles.POINTS}`}
                title={"Bunken"}
              />
            </Grid.Column>
            <Grid.Column>
              <PlayArea
                piled={true}
                backsideUp={false}
                position={`${this.player.id}_${PlayerPiles.MULLE}`}
                title={"Muller"}
              />
            </Grid.Column>
          </Grid>
        </Segment>
        <Segment>
          {store &&
            store.selectedCardId &&
            this.props.playerId === store.playerId && (
              <PlayingCard
                backsideUp={false}
                cardId={store.selectedCardId}
                selectable={false}
              />
            )}
        </Segment>
      </Segment>
    );
  }
}

export default Player;
