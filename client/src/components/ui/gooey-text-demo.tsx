import * as React from "react";
import { GooeyText } from "../ui/gooey-text-morphing";
import { Squares } from "../ui/squares-background";

function GooeyTextDemo() {
  return (
    <div className="relative h-[400px] flex items-center justify-center overflow-hidden rounded-lg">
      <Squares
        direction="diagonal"
        speed={0.5}
        squareSize={40}
        borderColor="#000"
        hoverFillColor="#f5f5f5"
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="relative z-10 w-full flex items-center justify-center h-full">
        <GooeyText
          texts={["CasaConnect", "For", "Your", "Perfection"]}
          morphTime={2}
          cooldownTime={0.25}
          className="font-bold"
        />
      </div>
    </div>
  );
}

export { GooeyTextDemo };