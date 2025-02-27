import React, { useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { color } from "d3-color";
import * as ease from "d3-ease";
import { interpolateNumber } from "d3-interpolate";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import { arc, area } from "d3-shape";
import { timer } from "d3-timer";
import "./transition-polyfill";
import Gradient from "./gradient";

// Modified ID generation function to be more deterministic
const generateId = (prefix: string = "liquid-fill-", seed?: string): string => {
  if (typeof window === "undefined") {
    // Server-side: use a fixed ID with optional seed
    return `${prefix}${seed || "server"}`;
  }
  // Client-side: can use random ID
  return `${prefix}${Math.random().toString(36).substring(2, 11)}`;
};

const ucfirst = (s: string): string => {
  return s && s[0].toUpperCase() + s.slice(1);
};

type GradientStop =
  | {
      key?: string;
      stopColor: string;
      stopOpacity: number;
      offset: string;
    }
  | React.ReactNode;

export interface LiquidFillGaugeProps {
  // A unique identifier (ID) to identify the element.
  id?: string;
  // The width of the component.
  width?: number;
  // The height of the component.
  height?: number;
  // Component style
  style?: React.CSSProperties;

  // The percent value (0-100).
  value?: number;
  // The unit string (%) or SVG text element.
  unit?: string | React.ReactNode;

  // The relative height of the text to display in the wave circle. A value of 1 equals 50% of the radius of the outer circle.
  textScale?: number;
  textOffsetX?: number;
  textOffsetY?: number;

  // Specifies a custom text renderer for rendering a value.
  textRenderer?: (props: LiquidFillGaugeProps) => React.ReactNode;

  // Controls if the wave should rise from 0 to it's full height, or start at it's full height.
  riseAnimation?: boolean;
  // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
  riseAnimationTime?: number;
  // [d3-ease](https://github.com/d3/d3-ease) options:
  // See the [easing explorer](http://bl.ocks.org/mbostock/248bac3b8e354a9103c4) for a visual demostration.
  riseAnimationEasing?: string;
  // Progress callback function.
  riseAnimationOnProgress?: (data: { value: number; container: any }) => void;
  // Complete callback function.
  riseAnimationOnComplete?: (data: { value: number; container: any }) => void;

  // Controls if the wave scrolls or is static.
  waveAnimation?: boolean;
  // The amount of time in milliseconds for a full wave to enter the wave circle.
  waveAnimationTime?: number;
  // [d3-ease](https://github.com/d3/d3-ease) options:
  // See the [easing explorer](http://bl.ocks.org/mbostock/248bac3b8e354a9103c4) for a visual demostration.
  waveAnimationEasing?: string;

  // The wave amplitude.
  waveAmplitude?: number;
  // The number of full waves per width of the wave circle.
  waveFrequency?: number;

  // Whether to apply linear gradients to fill the wave circle.
  gradient?: boolean;
  // An array of the <stop> SVG element defines the ramp of colors to use on a gradient, which is a child element to either the <linearGradient> or the <radialGradient> element.
  gradientStops?: GradientStop[] | React.ReactNode;

  // onClick event handler.
  onClick?: () => void;

  // The radius of the inner circle.
  innerRadius?: number;
  // The radius of the outer circle.
  outerRadius?: number;
  // The size of the gap between the outer circle and wave circle as a percentage of the outer circle's radius.
  margin?: number;

  // The fill and stroke of the outer circle.
  shapeStyle?: React.SVGAttributes<SVGPathElement>;
  // The fill and stroke of the fill wave.
  waveStyle?: React.SVGAttributes<SVGElement> & { fill: string };
  // The fill and stroke of the value text when the wave does not overlap it.
  textStyle?: React.SVGAttributes<SVGTextElement>;
  // The fill and stroke of the value text when the wave overlaps it.
  waveTextStyle?: React.SVGAttributes<SVGTextElement>;
  // The shape of the container
  shapeType?: "circle" | "rectangle"; // default is circle
}

const LiquidFillGauge: React.FC<LiquidFillGaugeProps> = (props) => {
  const containerRef = useRef<SVGGElement | null>(null);
  const clipPathRef = useRef<SVGPathElement | null>(null);
  const waveRef = useRef<any>(null);
  const oldValueRef = useRef<number>(0);
  const componentId = useRef<string>("");

  useEffect(() => {
    componentId.current =
      props.id || generateId("liquid-fill-", props.value?.toString());
  }, [props.id, props.value]);

  const {
    width = 400,
    height = 400,
    value = 0,
    unit = "%",
    textScale = 1,
    textOffsetX = 0,
    textOffsetY = 0,
    riseAnimation = false,
    riseAnimationTime = 2000,
    riseAnimationEasing = "cubicInOut",
    riseAnimationOnProgress = () => {},
    riseAnimationOnComplete = () => {},
    waveAnimation = false,
    waveAnimationTime = 2000,
    waveAnimationEasing = "linear",
    waveAmplitude = 1,
    waveFrequency = 2,
    gradient = false,
    gradientStops = null,
    onClick = () => {},
    innerRadius = 0.9,
    outerRadius = 1.0,
    margin = 0.025,
    shapeStyle = {
      fill: "rgb(23, 139, 202)",
    },
    waveStyle = {
      fill: "rgb(23, 139, 202)",
    },
    textStyle = {
      fill: "rgb(0, 0, 0)",
    },
    waveTextStyle = {
      fill: "rgb(255, 255, 255)",
    },
    style,
    shapeType = "circle",
  } = props;

  const radius = Math.min(height / 2, width / 2);

  const defaultTextRenderer = (props: LiquidFillGaugeProps) => {
    const value = Math.round(props.value || 0);
    const fontSize = (textScale * radius) / 2;
    const valueStyle = {
      fontSize: `${fontSize}px`,
      dominantBaseline: "middle" as const,
    };
    const unitStyle = {
      fontSize: `${fontSize * 0.6}px`,
      dominantBaseline: "middle" as const,
    };

    return (
      <tspan>
        <tspan style={valueStyle}>{value}</tspan>
        <tspan style={unitStyle}>{unit}</tspan>
      </tspan>
    );
  };

  const textRenderer = props.textRenderer || defaultTextRenderer;

  const animateWave = () => {
    if (!clipPathRef.current || !waveRef.current) return;

    const waveWidth = (width * (innerRadius - margin)) / 2;
    const waveAnimationScale = scaleLinear<number>()
      .range([-waveWidth, waveWidth])
      .domain([0, 1]);
    const easingName = `ease${ucfirst(waveAnimationEasing)}`;
    const easingFn = (ease as any)[easingName]
      ? (ease as any)[easingName]
      : ease.easeLinear;

    waveRef.current
      .attr(
        "transform",
        "translate(" + waveAnimationScale(waveRef.current.attr("T")) + ", 0)"
      )
      .transition()
      .duration(waveAnimationTime * (1 - waveRef.current.attr("T")))
      .ease(easingFn)
      .attr("transform", "translate(" + waveAnimationScale(1) + ", 0)")
      .attr("T", "1")
      .on("end", () => {
        waveRef.current.attr("T", "0");
        if (waveAnimation) {
          animateWave();
        }
      });
  };

  const draw = () => {
    if (!clipPathRef.current || !containerRef.current) return;

    const data = [];
    const samplePoints = 40;
    for (let i = 0; i <= samplePoints * waveFrequency; ++i) {
      data.push({
        x: i / (samplePoints * waveFrequency),
        y: i / samplePoints,
      });
    }

    waveRef.current = select(clipPathRef.current).datum(data).attr("T", "0");

    const waveHeightScale = scaleLinear<number>()
      .range([0, waveAmplitude, 0])
      .domain([0, 50, 100]);

    const fillWidth = width * (innerRadius - margin);
    const waveScaleX = scaleLinear<number>()
      .range([-fillWidth, fillWidth])
      .domain([0, 1]);

    const fillHeight = height * (innerRadius - margin);
    const waveScaleY = scaleLinear<number>()
      .range([fillHeight / 2, -fillHeight / 2])
      .domain([0, 100]);

    if (waveAnimation) {
      animateWave();
    }

    if (riseAnimation) {
      const clipArea = area<{ x: number; y: number }>()
        .x((d) => waveScaleX(d.x))
        .y1(() => height / 2);
      const timeScale = scaleLinear<number>()
        .range([0, 1])
        .domain([0, riseAnimationTime]);
      // Use the old value if available
      const startValue = oldValueRef.current || 0;
      const interpolate = interpolateNumber(startValue, value);
      const easingName = `ease${ucfirst(riseAnimationEasing)}`;
      const easingFn = (ease as any)[easingName]
        ? (ease as any)[easingName]
        : ease.easeCubicInOut;
      const riseAnimationTimer = timer((t) => {
        const currentValue = interpolate(easingFn(timeScale(t)));
        clipArea.y0((d) => {
          const radians = Math.PI * 2 * (d.y * 2); // double width
          return waveScaleY(
            waveHeightScale(currentValue) * Math.sin(radians) + currentValue
          );
        });

        waveRef.current.attr("d", clipArea);

        const renderedElement = textRenderer({
          ...props,
          value: currentValue,
        });
        select(containerRef.current)
          .selectAll(".text, .waveText")
          .html(renderToString(renderedElement));

        riseAnimationOnProgress({
          value: currentValue,
          container: select(containerRef.current),
        });

        if (t >= riseAnimationTime) {
          riseAnimationTimer.stop();

          const finalValue = interpolate(1);
          clipArea.y0((d) => {
            const radians = Math.PI * 2 * (d.y * 2); // double width
            return waveScaleY(
              waveHeightScale(finalValue) * Math.sin(radians) + finalValue
            );
          });

          waveRef.current.attr("d", clipArea);

          const renderedElement = textRenderer({
            ...props,
            value: finalValue,
          });
          select(containerRef.current)
            .selectAll(".text, .waveText")
            .html(renderToString(renderedElement));

          riseAnimationOnComplete({
            value: finalValue,
            container: select(containerRef.current),
          });
        }
      });

      // Store the current value for the next animation
      oldValueRef.current = value;
    } else {
      const currentValue = value;
      const clipArea = area<{ x: number; y: number }>()
        .x((d) => waveScaleX(d.x))
        .y0((d) => {
          const radians = Math.PI * 2 * (d.y * 2); // double width
          return waveScaleY(
            waveHeightScale(currentValue) * Math.sin(radians) + currentValue
          );
        })
        .y1(() => height / 2);

      waveRef.current.attr("d", clipArea);
    }
  };

  useEffect(() => {
    draw();
  }, [
    width,
    height,
    value,
    waveFrequency,
    waveAmplitude,
    waveAnimation,
    riseAnimation,
  ]);

  const fillCircleRadius = radius * (innerRadius - margin);

  const circlePath = arc<any>()
    .outerRadius(outerRadius * radius)
    .innerRadius(innerRadius * radius)
    .startAngle(0)
    .endAngle(Math.PI * 2);

  const rectanglePath = () => {
    const width = radius * 2 * outerRadius;
    const height = radius * 2 * outerRadius;
    const innerWidth = radius * 2 * innerRadius;
    const innerHeight = radius * 2 * innerRadius;
    const x = -width / 2;
    const y = -height / 2;
    const innerX = -innerWidth / 2;
    const innerY = -innerHeight / 2;

    // Create a path with two rectangles, using the SVG path "evenodd" fill rule
    // The outer rectangle is drawn clockwise, inner counterclockwise to create a hole
    return `M ${x},${y} h ${width} v ${height} h ${-width} z M ${innerX},${innerY} v ${innerHeight} h ${innerWidth} v ${-innerHeight} h ${-innerWidth} z`;
  };

  const cX = width / 2;
  const cY = height / 2;
  const fillColor = waveStyle.fill;

  const defaultGradientStops = [
    {
      key: "0%",
      stopColor: color(fillColor)?.darker(0.5)?.toString() || fillColor,
      stopOpacity: 1,
      offset: "0%",
    },
    {
      key: "50%",
      stopColor: fillColor,
      stopOpacity: 0.75,
      offset: "50%",
    },
    {
      key: "100%",
      stopColor: color(fillColor)?.brighter(0.5)?.toString() || fillColor,
      stopOpacity: 0.5,
      offset: "100%",
    },
  ];

  const stops = gradientStops || defaultGradientStops;
  const id = componentId.current;

  return (
    <div
      style={{
        width: width,
        height: height,
        ...style,
      }}
    >
      <svg width="100%" height="100%">
        <g ref={containerRef} transform={`translate(${cX},${cY})`}>
          <defs>
            <clipPath id={`clipWave-${id}`}>
              <path ref={clipPathRef} />
            </clipPath>
          </defs>
          <text
            className="text"
            style={{
              textAnchor: "middle",
            }}
            transform={`translate(${textOffsetX},${textOffsetY})`}
            {...textStyle}
          >
            {textRenderer(props)}
          </text>
          <g clipPath={`url(#clipWave-${id})`}>
            {shapeType === "circle" ? (
              <circle
                className="wave"
                r={fillCircleRadius}
                {...waveStyle}
                fill={gradient ? `url(#gradient-${id})` : waveStyle.fill}
              />
            ) : (
              <rect
                className="wave"
                x={-fillCircleRadius}
                y={-fillCircleRadius}
                width={fillCircleRadius * 2}
                height={fillCircleRadius * 2}
                {...waveStyle}
                fill={gradient ? `url(#gradient-${id})` : waveStyle.fill}
              />
            )}

            <text
              className="waveText"
              style={{
                textAnchor: "middle",
              }}
              transform={`translate(${textOffsetX},${textOffsetY})`}
              {...waveTextStyle}
            >
              {textRenderer(props)}
            </text>
          </g>
          {shapeType === "circle" ? (
            <>
              <path
                className="circle"
                d={circlePath({}) || undefined}
                {...shapeStyle}
              />
              <circle
                r={radius}
                fill="rgba(0, 0, 0, 0)"
                stroke="rgba(0, 0, 0, 0)"
                style={{ pointerEvents: "all" }}
                onClick={onClick}
              />
            </>
          ) : (
            <>
              <path
                className="rectangle"
                d={rectanglePath()}
                {...shapeStyle}
                fillRule="evenodd"
              />
              <rect
                x={-radius}
                y={-radius}
                width={radius * 2}
                height={radius * 2}
                fill="rgba(0, 0, 0, 0)"
                stroke="rgba(0, 0, 0, 0)"
                style={{ pointerEvents: "all" }}
                onClick={onClick}
              />
            </>
          )}
        </g>
        <Gradient id={`gradient-${id}`}>
          {Array.isArray(stops)
            ? stops.map((stop, index) => {
                if (!React.isValidElement(stop)) {
                  const stopObj = stop as any;
                  const key = stopObj.key || index;
                  // Create a new object without the key property
                  const { key: _, ...stopProps } = stopObj;
                  return <stop key={key} {...stopProps} />;
                }
                return stop;
              })
            : stops}
        </Gradient>
      </svg>
    </div>
  );
};

export default LiquidFillGauge;
