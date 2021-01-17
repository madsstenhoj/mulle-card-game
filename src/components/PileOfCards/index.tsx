import React from "react";
import { observer, inject } from "mobx-react";
import PlayMaker, { IPlayingCard } from "../../logic/store";
import PlayingCard from "../PlayingCard";
import { Card, Popup, Button, Segment } from "semantic-ui-react";

interface IProps {
  cardIds: number[];
  backsideUp: boolean;
  piled: boolean;
  position?: string;
  title?: string;
  store?: PlayMaker;
}

const PileOfCards = inject("store")(
  observer((props: IProps) => {
    const upperCardId = props.cardIds.length
      ? props.cardIds[props.cardIds.length - 1]
      : undefined;

    const secondUpperCardId =
      props.cardIds.length > 1 && props.piled && !props.backsideUp
        ? props.cardIds[props.cardIds.length - 2]
        : undefined;

    const displayTooltip =
      props.piled && !props.backsideUp && props.cardIds.length > 0;

    const sorting = (aCardId: number, bCardId: number) => {
      const a = props.store!.getPlayingCard(aCardId);
      const b = props.store!.getPlayingCard(bCardId);

      const diff = b.number - a.number;
      const pointDiff = b.points - a.points;

      if (a.color === "joker.png") {
        return -1;
      }

      if (pointDiff === 0) {
        return diff;
      }

      return pointDiff;
    };

    return (
      <Segment.Group style={{ minWidth: 70 }}>
        <Segment textAlign={"center"}>
          {props.piled && (
            <Button
              size={"large"}
              onClick={() => props.store!.putCard(props.position)}
              icon={"arrow alternate circle down"}
            />
          )}
          {props.title && <span>{props.title}</span>}
        </Segment>
        {upperCardId !== undefined && (
          <>
            {props.piled ? (
              <>
                <Segment piled={true} textAlign={"center"}>
                  {secondUpperCardId !== undefined && (
                    <PlayingCard
                      cardId={secondUpperCardId}
                      backsideUp={false}
                      selectable={false}
                    />
                  )}

                  <PlayingCard
                    cardId={upperCardId}
                    backsideUp={props.backsideUp}
                    selectable={props.store!.selectedCardId === undefined}
                  />
                  <Popup
                    flowing={true}
                    trigger={<Button content={props.cardIds.length} />}
                    content={
                      <span>
                        {props.cardIds.map(cardId => (
                          <PlayingCard
                            selectable={false}
                            backsideUp={props.backsideUp}
                            cardId={cardId}
                          />
                        ))}
                      </span>
                    }
                  />
                </Segment>
                <Segment textAlign={"center"}>
                  <Button.Group>
                    {displayTooltip && (
                      <Popup
                        trigger={
                          <Button
                            size={"large"}
                            icon={"globe"}
                            onClick={() =>
                              props.store!.takePileHome(props.position!)
                            }
                          />
                        }
                        content={"Tag bunken hjem"}
                        inverted={true}
                      />
                    )}
                  </Button.Group>
                </Segment>
              </>
            ) : (
              <Card.Group itemsPerRow={10}>
                {props.cardIds.sort(sorting).map(cardId => (
                  <PlayingCard
                    backsideUp={props.backsideUp}
                    cardId={cardId}
                    selectable={true}
                  />
                ))}
              </Card.Group>
            )}
          </>
        )}
      </Segment.Group>
    );
  })
);

export default PileOfCards;
