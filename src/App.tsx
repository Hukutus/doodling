import React from 'react';
import './styles.css';
import paper from "./images/paper.png";

import styled from "styled-components";

const FullPageContainer = styled.div`
  display: grid;
  
  height: 100vh;
  width: 100vw;
`;

const CanvasContainer = styled.div`
  position: relative;
  
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: url(${paper});
`;

const BrushSelector = styled.div`
  position: absolute;
  left: 1vw;
  top: 0;
  
  display: flex;
  flex-direction: column;
`;

const BrushIcon = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  
  cursor: pointer;
  margin-top: 1vw;
  background: #f2f2f2;
  border-radius: 50%;
`;

export type DrawingState = {
  drawing: boolean;
  canvasWidth: number;
  canvasHeight: number;
};

export type CanvasLog = {
  type: string;

  x?: number;
  y?: number;

  lineWidth?: number;
  lineCap?: CanvasLineCap;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
};

export default class App extends React.Component<any, DrawingState> {
  public canvasContainer: HTMLDivElement;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  private canvasLog: CanvasLog[] = [];
  private resizeTimeout: number;

  constructor(props: any) {
    super(props);

    this.state = {
      drawing: false,
      canvasWidth: 500,
      canvasHeight: 500,
    };
  }

  static createRandomHsl(alpha?: number): string {
    const hue = (Math.random() + 0.618033988749895) * 360;
    return alpha ? 'hsla(' + hue + ', 75%, 50%, ' + alpha + ')' : 'hsl(' + hue + ', 75%, 50%)';
  }

  componentDidMount(): void {
    this.setUpCanvas();

    window.addEventListener("resize", this.waitForResize.bind(this));
  }

  private waitForResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      // Wait for user to stop resize
      this.resizeTimeout = null;
      this.resizeCanvas();
    }, 200);
  }

  private resizeCanvas(): void {
    this.setState({
      canvasWidth: this.canvasContainer.clientWidth,
      canvasHeight: this.canvasContainer.clientHeight
    });

    if (this.canvasLog.length) {
      for (const event of this.canvasLog) {
        if (event.type === "beginPath") {
          this.setLine(event.lineWidth, event.lineCap, event.strokeStyle);
          this.ctx.beginPath();
          continue;
        }

        if (event.type === "stroke") {
          this.ctx.stroke();
          continue;
        }

        if (event.type === "moveTo") {
          this.ctx.moveTo(event.x, event.y);
          continue;
        }

        if (event.type === "lineTo") {
          this.ctx.lineTo(event.x, event.y);
          continue;
        }

        console.log("Unknown event type", event);
      }
    }

    console.log("Resize", this.canvas.width, this.canvas.height);
  }

  private setUpCanvas(): void {
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(0.5, 0.5);
    this.resizeCanvas();
  }

  private setLine(lineWidth?: number, lineCap?: CanvasLineCap, strokeStyle?: string | CanvasGradient | CanvasPattern): void {
    if (lineWidth) {
      this.ctx.lineWidth = lineWidth;
    }

    if (lineCap) {
      this.ctx.lineCap = lineCap;
    }

    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle;
    }
  }

  private toggleDrawing(value: boolean): void {
    console.log("Toggle drawing", value);

    if (value) {
      this.resetLine();
    }

    this.setState({
      drawing: value
    });
  }

  private resetLine(changeColor: boolean = true): void {
    if (changeColor) {
      this.ctx.strokeStyle = App.createRandomHsl();
    }

    this.ctx.beginPath();

    this.canvasLog.push({
      type: "beginPath",
      lineWidth: this.ctx.lineWidth,
      lineCap: this.ctx.lineCap,
      strokeStyle: this.ctx.strokeStyle,
    });
  }

  private addPoint(x: number, y: number): void {
    if (!this.state.drawing) {
      // Not drawing
      return;
    }

    this.ctx.lineTo(x, y);
    this.canvasLog.push({type: "lineTo", x: x, y: y});

    this.ctx.stroke();
    this.canvasLog.push({type: "stroke"});

    this.ctx.moveTo(x, y);
    this.canvasLog.push({type: "moveTo", x: x, y: y});
  }

  render() {
    return (
      <FullPageContainer>
        <CanvasContainer
          ref={(ref) => this.canvasContainer = ref}
        >
          <BrushSelector>
            {
              [5, 10, 15, 20, 25, 30, 100].map(size => {
                return(
                  <BrushIcon
                    key={'brush-icon-' + size}
                    style={{width: size + 'px', height: size + 'px', fontSize: (size / 2) + 'px'}}
                    onClick={() => this.setLine(size, "round")}
                  >
                    {size}
                  </BrushIcon>
                );
              })
            }
          </BrushSelector>

          <canvas
            width={this.state.canvasWidth}
            height={this.state.canvasHeight}
            ref={(ref) => this.canvas = ref}

            onMouseDown={() => this.toggleDrawing(true)}
            onMouseUp={() => this.toggleDrawing(false)}
            onMouseMove={(e) => this.addPoint(e.pageX, e.pageY)}
            onMouseLeave={() => this.resetLine(false)}
            onMouseEnter={() => this.resetLine(false)}

            onTouchStart={() => this.toggleDrawing(true)}
            onTouchEnd={() => this.toggleDrawing(true)}
            onTouchMove={(e) => this.addPoint(e.touches[0].pageX, e.touches[0].pageY)}
          >Canvas not supported</canvas>
        </CanvasContainer>
      </FullPageContainer>
    )
  }
}
