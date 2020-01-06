// Type definitions for randomColor 0.5.2
// Project: https://github.com/davidmerfield/randomColor
// Definitions by: Mathias Feitzinger <https://github.com/feitzi>, Brady Liles <https://github.com/BradyLiles>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare function randomColor(options?: RandomColorOptionsBase & StringType): string;
declare function randomColor(options?: RandomColorOptionsBase & ArrayType): ColorArray;
declare function randomColor(options?: RandomColorOptionsBase & StringType & Multiple): string[];
declare function randomColor(options?: RandomColorOptionsBase & ArrayType & Multiple): ColorArray[];

type ColorArray = [number, number, number]

interface RandomColorOptionsBase {
  hue?: number | string;
  luminosity?: "bright" | "light" | "dark" | "random";
  seed?: number | string;
  alpha?: number;
}

interface StringType {
  format?: "hsl" | "hsla" | "rgb" | "rgba" | "hex";
}

interface ArrayType {
  format?: "hsvArray" | "hslArray" | "rgbArray";
}

interface Multiple {
  count: number;
}

declare module "randomcolor" {
  export default randomColor
}
