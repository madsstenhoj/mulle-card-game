import React from "react";
import { observer, inject } from "mobx-react";
import PlayMaker from "../../logic/store";
import PlayingCard from "../PlayingCard";
import { Card, Popup, Button } from "semantic-ui-react";

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

    const displayTooltip =
      props.piled && !props.backsideUp && props.cardIds.length > 1;

    return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: -30 }}>
          {props.piled && (
            <Button
              size={"small"}
              onClick={() => props.store!.putCard(props.position)}
              icon={"arrow alternate circle down"}
            />
          )}
          {props.title && <span>{props.title}</span>}
        </div>
        {upperCardId !== undefined && (
          <>
            {props.piled ? (
              <div style={{ paddingTop: 20 }}>
                <PlayingCard
                  cardId={upperCardId}
                  backsideUp={props.backsideUp}
                  selectable={props.store!.selectedCardId === undefined}
                />
                <Button.Group>
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
                  {displayTooltip && (
                    <Popup
                      trigger={
                        <Button
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
              </div>
            ) : (
              <Card.Group itemsPerRow={10}>
                {props.cardIds.sort().map(cardId => (
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
      </div>
    );
  })
);

export default PileOfCards;
