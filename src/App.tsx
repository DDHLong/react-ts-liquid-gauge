import LiquidFillGauge from "./components/LiquidFillGauge/liquid-fill-gauge";

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
