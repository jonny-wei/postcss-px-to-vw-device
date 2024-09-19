import { Root, Helpers } from 'postcss';

type OptionType = {
    viewportWidth?: number | ((filePath: string) => number | undefined);
    viewportHeight?: number;
    unitToConvert?: string;
    viewportUnit?: string;
    fontViewportUnit?: string;
    unitPrecision?: number;
    minPixelValue?: number;
    enable?: boolean;
    include?: RegExp | RegExp[];
    exclude?: RegExp | RegExp[];
    selectorBlackList?: (RegExp | string)[];
    propList?: string[];
    replace?: boolean;
    mediaQuery?: boolean;
    mediaOptions?: MediaOption[];
};
type MediaOption = {
    viewportWidth?: number | ((filePath: string) => number | undefined);
    unitToConvert?: string;
    viewportUnit?: string;
    fontViewportUnit?: string;
    enable?: boolean;
    mediaParam: string;
};

declare const postcssPxToViewport: {
    (options?: OptionType): {
        postcssPlugin: string;
        Once(css: Root, { result }: Helpers): void;
        OnceExit(css: Root, { AtRule }: Helpers): void;
    };
    postcss: boolean;
};

export { postcssPxToViewport as default };
