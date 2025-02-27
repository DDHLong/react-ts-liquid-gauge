import { selection } from "d3-selection";
import { transition, interrupt } from "d3-transition";

// Add the transition and interrupt methods to the selection prototype if they don't exist
(selection.prototype as any).transition =
  (selection.prototype as any).transition || transition;
(selection.prototype as any).interrupt =
  (selection.prototype as any).interrupt || interrupt;
