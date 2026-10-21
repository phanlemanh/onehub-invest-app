import { Frame, FramePanel } from "@/components/reui/frame"

import { CardItem } from "./card-item"
import { CARDS } from "./data"

export function CardGrid() {
  return (
    <div className="@container w-full">
      <Frame className="w-full">
        <FramePanel className="p-0!">
          <div className="grid overflow-hidden @2xl:grid-cols-2 @4xl:grid-cols-4">
            {CARDS.map((card, index) => (
              <CardItem
                key={card.description}
                card={card}
                index={index}
                total={CARDS.length}
              />
            ))}
          </div>
        </FramePanel>
      </Frame>
    </div>
  )
}