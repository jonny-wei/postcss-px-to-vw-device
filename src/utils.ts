import type { OptionType, ParentExtendType } from './types';

export const getUnit = (prop: string | string[], opts: OptionType) => {
  return prop.indexOf('font') === -1 ? opts.viewportUnit : opts.fontViewportUnit;
};

/**
 * 转换
 * e.g. 将 px 转换为 vw
 * @param opts 
 * @param viewportUnit 
 * @param viewportSize 
 * @returns 
 */
export const createPxReplace = (
  opts: OptionType,
  viewportUnit: string | number,
  viewportSize: number,
  force?: boolean
) => {
  return function (m: any, $1: string) {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (pixels <= opts.minPixelValue! && !force) return m;
    const parsedVal = toFixed((pixels / viewportSize) * 100, opts.unitPrecision!);
    return parsedVal === 0 ? '0' : `${parsedVal}${viewportUnit}`;
  };
};

export const toFixed = (number: number, precision: number) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
};

export const blacklistedSelector = (blacklist:  (RegExp | string)[], selector: string) => {
  if (typeof selector !== 'string') return;
  return blacklist.some((regex) => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
};

/**
 * 判断声明数组中是否存在具有指定属性名和属性值
 * @param decls 
 * @param prop 
 * @param value 
 * @returns 
 */
export const declarationExists = (decls: ParentExtendType[], prop: string, value: string) => {
  return decls?.some((decl: ParentExtendType) => {
    return decl.prop === prop && decl.value === value;
  });
};

export const validateParams = (params: string, mediaQuery: boolean) => {
  return !params || (params && mediaQuery);
};

export const getWidth = (widthOption: number | ((filePath: string) => number | undefined), file: any) => {
  return typeof widthOption == 'function' ? widthOption(file) : widthOption
}