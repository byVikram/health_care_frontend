import { PaletteColorOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        neutral: PaletteColor; // add your custom palette key
        infoLight: PaletteColor; // example additional palette
    }
    interface PaletteOptions {
        neutral?: PaletteColorOptions;
        infoLight?: PaletteColorOptions;
    }
}

declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        neutral: true;
        infoLight: true;
    }
}