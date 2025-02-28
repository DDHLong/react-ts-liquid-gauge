# React TS Liquid Gauge component

React TS Liquid Gauge component with circle and rectangle shape. It's heavily inspired by [react-liquid-gauge](https://github.com/trendmicro-frontend/react-liquid-gauge).

![Image](https://github.com/user-attachments/assets/fc4f2a9a-daa4-433c-9feb-2aff51ddbd52)
![Image](https://github.com/user-attachments/assets/16c27256-672b-4b19-86e0-c389e999fa66)

## Installation

```bash
npm install react-ts-liquid-gauge
```

## Usage

```tsx
import LiquidFillGauge from "react-ts-liquid-gauge";

function App() {
  return (
    <>
      <LiquidFillGauge
        value={70}
        waveAnimation={true}
        waveFrequency={3}
        waveAmplitude={0.5}
        gradient={true}
        riseAnimation={true}
        riseAnimationTime={1000}
        textStyle={{ fill: "#fff" }}
        waveTextStyle={{ fill: "#85ebff" }}
        shapeStyle={{ fill: "#056" }}
        waveStyle={{ fill: "#056" }}
        shapeType="rectangle"
      />
    </>
  );
}

export default App;
```

## Props

| Prop Name           | Type                                   | Default                | Description                                |
| ------------------- | -------------------------------------- | ---------------------- | ------------------------------------------ |
| value               | number                                 | 0                      | The value to display in the gauge (0-100)  |
| width               | number                                 | 200                    | Width of the gauge                         |
| height              | number                                 | 200                    | Height of the gauge                        |
| shapeType           | 'circle' \| 'rectangle'                | 'circle'               | Shape of the gauge                         |
| textSize            | number                                 | 1                      | Size multiplier for the text               |
| textOffsetX         | number                                 | 0                      | X offset for the text position             |
| textOffsetY         | number                                 | 0                      | Y offset for the text position             |
| textRenderer        | (value: number) => string              | (value) => `${value}%` | Function to customize the displayed text   |
| riseAnimation       | boolean                                | false                  | Enable/disable rise animation              |
| riseAnimationTime   | number                                 | 2000                   | Duration of rise animation in milliseconds |
| riseAnimationEasing | string                                 | 'cubicInOut'           | Easing function for rise animation         |
| waveAnimation       | boolean                                | false                  | Enable/disable wave animation              |
| waveFrequency       | number                                 | 2                      | Number of waves                            |
| waveAmplitude       | number                                 | 1                      | Height of waves                            |
| waveSpeed           | number                                 | 0.25                   | Speed of wave animation                    |
| gradient            | boolean                                | false                  | Enable/disable gradient effect             |
| gradientStops       | Array<{offset: string, color: string}> | -                      | Custom gradient stops                      |
| onClick             | () => void                             | undefined              | Click handler for the gauge                |
| textStyle           | React.CSSProperties                    | {}                     | Style object for the text                  |
| waveTextStyle       | React.CSSProperties                    | {}                     | Style object for the text when inside wave |
| shapeStyle          | React.CSSProperties                    | {}                     | Style object for the gauge shape           |
| waveStyle           | React.CSSProperties                    | {}                     | Style object for the wave                  |

## License

MIT
