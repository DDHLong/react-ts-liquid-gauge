import React from "react";

export interface GradientProps {
  id: string;
  x1?: string;
  x2?: string;
  y1?: string;
  y2?: string;
  children: React.ReactNode;
}

const Gradient: React.FC<GradientProps> = ({
  id,
  x1 = "0%",
  x2 = "0%",
  y1 = "100%",
  y2 = "0%",
  children,
}) => {
  return (
    <defs>
      <linearGradient id={id} x1={x1} x2={x2} y1={y1} y2={y2}>
        {children}
      </linearGradient>
    </defs>
  );
};

export default Gradient;
