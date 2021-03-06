import * as PropTypes from "prop-types";
import * as React from "react";
import { GenericComponent, functor } from "@react-financial-charts/core";

interface LabelProps {
    readonly className?: string;
    readonly fillStyle?:
        | string
        | CanvasGradient
        | CanvasPattern
        | ((datum: unknown) => string | CanvasGradient | CanvasPattern);
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly rotate?: number;
    readonly selectCanvas?: (canvases: unknown) => unknown;
    readonly text?: string | ((datum: unknown) => string);
    readonly textAlign?: CanvasTextAlign;
    readonly x?: number | any; // func
    readonly xAccessor?: any; // func
    readonly xScale?: any; // func
    readonly y?: number | any; // func
    readonly yScale?: any; // func
    readonly datum?: unknown;
}

export class Label extends React.Component<LabelProps> {
    public static defaultProps = {
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        fillStyle: "#000000",
        rotate: 0,
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
        selectCanvas: (canvases) => canvases.bg,
    };

    public static contextTypes = {
        canvasOriginX: PropTypes.number,
        canvasOriginY: PropTypes.number,
        margin: PropTypes.object.isRequired,
        ratio: PropTypes.number.isRequired,
    };

    public render() {
        const { selectCanvas } = this.props;

        return <GenericComponent canvasToDraw={selectCanvas} canvasDraw={this.drawOnCanvas} drawOn={[]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        ctx.save();

        const { textAlign = "center", fontFamily, fontSize, rotate } = this.props;

        const { canvasOriginX, canvasOriginY, margin, ratio } = this.context;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);

        if (canvasOriginX !== undefined) {
            ctx.translate(canvasOriginX, canvasOriginY);
        } else {
            ctx.translate(margin.left + 0.5 * ratio, margin.top + 0.5 * ratio);
        }

        const { xScale, chartConfig, xAccessor } = moreProps;

        const yScale = Array.isArray(chartConfig) ? undefined : chartConfig.yScale;

        const { xPos, yPos, fillStyle, text } = this.helper(moreProps, xAccessor, xScale, yScale);

        ctx.save();
        ctx.translate(xPos, yPos);
        if (rotate !== undefined) {
            const radians = (rotate / 180) * Math.PI;

            ctx.rotate(radians);
        }

        if (fontFamily !== undefined) {
            ctx.font = `${fontSize}px ${fontFamily}`;
        }
        if (fillStyle !== undefined) {
            ctx.fillStyle = fillStyle;
        }
        if (textAlign !== undefined) {
            ctx.textAlign = textAlign;
        }

        ctx.beginPath();
        ctx.fillText(text, 0, 0);
        ctx.restore();
    };

    private readonly helper = (moreProps, xAccessor, xScale, yScale) => {
        const { x, y, datum, fillStyle, text } = this.props;

        const { plotData } = moreProps;

        const xFunc = functor(x);
        const yFunc = functor(y);

        const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

        return {
            xPos,
            yPos,
            text: functor(text)(datum),
            fillStyle: functor(fillStyle)(datum),
        };
    };
}
