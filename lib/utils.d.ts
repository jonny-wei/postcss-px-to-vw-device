import type { OptionType, ParentExtendType } from './types';
export declare const getUnit: (prop: string | string[], opts: OptionType) => string | undefined;
/**
 * 转换
 * e.g. 将 px 转换为 vw
 * @param opts
 * @param viewportUnit
 * @param viewportSize
 * @returns
 */
export declare const createPxReplace: (opts: OptionType, viewportUnit: string | number, viewportSize: number, force?: boolean) => (m: any, $1: string) => any;
export declare const toFixed: (number: number, precision: number) => number;
export declare const blacklistedSelector: (blacklist: (RegExp | string)[], selector: string) => boolean | undefined;
/**
 * 判断声明数组中是否存在具有指定属性名和属性值
 * @param decls
 * @param prop
 * @param value
 * @returns
 */
export declare const declarationExists: (decls: ParentExtendType[], prop: string, value: string) => boolean;
export declare const validateParams: (params: string, mediaQuery: boolean) => boolean | "";
export declare const getWidth: (widthOption: number | ((filePath: string) => number | undefined), file: any) => number | undefined;
