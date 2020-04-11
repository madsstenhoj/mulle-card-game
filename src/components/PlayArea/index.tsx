import React from "react";
import { useDrop } from "react-dnd";
import { ItemTypes } from "../../App";
import PileOfCards from "../PileOfCards";
import { inject, observer } from "mobx-react";
import PlayMaker from "../../logic/store";

interface IProps {
  position: string;
  backsideUp: boolean;
  piled: boolean;
  title?: string;
  store?: PlayMaker;
}

const PlayArea = inject("store")(
  observer((props: IProps) => {
    const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.CARD,
      drop: () => ({ name: props.position }),
      collect: monitor => ({
        isOver: !!monitor.isOver(),
        getItem: monitor.getItem()
      })
    });

    const cardIds = props.store!.getCardsForPile(props.position);

    return (
      <>
        <div
          ref={drop}
          style={{
            backgroundColor: isOver ? "#DDD" : "#EEE",
            width: 80,
            height: 130,
            marginTop: 50
          }}
        >
          <PileOfCards
            piled={props.piled}
            cardIds={cardIds}
            backsideUp={props.backsideUp}
            title={props.title}
            position={props.position}
          />
        </div>
      </>
    );
  })
);

export default PlayArea;
