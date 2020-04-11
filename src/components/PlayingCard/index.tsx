import React from "react";
import { observer, inject } from "mobx-react";
import { Card } from "semantic-ui-react";
import { useDrag, DragSourceMonitor } from "react-dnd";
import { ItemTypes } from "../../App";
import PlayMaker from "../../logic/store";

interface IProps {
  cardId: number;
  backsideUp: boolean;
  selectable: boolean;
  store?: PlayMaker;
}

const PlayingCard = inject("store")(
  observer((props: IProps) => {
    const { backsideUp, cardId, store } = props;

    const [{ isDragging }, drag] = useDrag({
      item: { name: cardId, type: ItemTypes.CARD },
      end: (item: { name: string } | undefined, monitor: DragSourceMonitor) => {
        const dropResult = monitor.getDropResult();
        if (item && dropResult) {
          props.store!.emitCardMove(dropResult.name, Number(item.name));
        }
      },
      collect: monitor => ({
        isDragging: !!monitor.isDragging()
      })
    });

    const card = store!.getPlayingCard(cardId);

    const displayValue = card.value === "Joker" ? "" : card.value;

    return (
      <div
        ref={drag}
        style={{
          width: 60,
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
          margin: 5
        }}
      >
        <Card
          onClick={() => {
            if (props.selectable) {
              props.store?.selectCard(props.cardId);
            }
          }}
          style={{ width: 60, height: 80 }}
        >
          {backsideUp ? (
            <img src={"/img/bagside.png"} alt="" style={{ width: "100%" }} />
          ) : (
            <div
              style={{
                position: "relative",
                height: 80,
                width: 60,
                padding: 8,
                fontWeight: "bold",
                border: "1px solid #DDD",
                borderRadius: 5
              }}
            >
              <span style={{ position: "absolute", right: 0, top: 0 }}>
                {displayValue}
              </span>
              <span style={{ position: "absolute", left: 0, top: 0 }}>
                {displayValue}
              </span>
              <span style={{ position: "absolute", right: 0, bottom: 0 }}>
                {displayValue}
              </span>
              <span style={{ position: "absolute", left: 0, bottom: 0 }}>
                {displayValue}
              </span>
              <div style={{ right: 10, top: 10 }}>
                {[...Array(card.number)].map(i => (
                  <img
                    src={`/img/${card.color}`}
                    alt=""
                    style={{ width: 12, height: 12 }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  })
);

export default observer(PlayingCard);
