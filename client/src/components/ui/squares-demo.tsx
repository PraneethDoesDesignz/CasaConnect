import React from "react"
import { Squares } from "../ui/squares-background"
import { GooeyText } from "../ui/gooey-text-morphing"

export function SquaresDemo() {
  return (
    <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden rounded-lg">
      <Squares 
        direction="diagonal"
        speed={0.5}
        squareSize={40}
        borderColor="#000" 
        hoverFillColor="#a3e635"
        className="absolute inset-0 w-full h-full z-0"
      />
      <div className="relative z-10 w-full flex items-center justify-center h-full pointer-events-none">
        <GooeyText
          texts={["CasaConnect", "For", "Your", "Perfection"]}
          morphTime={2}
          cooldownTime={0.25}
          className="font-bold"
        />
      </div>
    </div>
  )
}
