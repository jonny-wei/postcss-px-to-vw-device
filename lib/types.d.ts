import type { Rule } from 'postcss';
export type OptionType = {
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
export type MediaOption = {
    viewportWidth?: number | ((filePath: string) => number | undefined);
    unitToConvert?: string;
    viewportUnit?: string;
    fontViewportUnit?: string;
    enable?: boolean;
    mediaParam: string;
};
export type ParentExtendType = {
    prop: string;
    value: string;
    params: string;
};
export type ParentType = {
    parent: Rule['parent'] & ParentExtendType;
};
export type RuleType = Omit<Rule, 'parent'> & ParentType;
