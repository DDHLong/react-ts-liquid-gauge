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

## License

MIT
