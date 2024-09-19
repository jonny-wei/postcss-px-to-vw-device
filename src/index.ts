import { AtRule, Declaration, Helpers, Root } from 'postcss';
import { getUnitRegexp, isInCalcOrVar } from './pixel-unit-regexp';
import { createPropListMatcher } from './prop-list-matcher';
import { OptionType, ParentExtendType, RuleType } from './types';
import { blacklistedSelector, createPxReplace, declarationExists, getUnit, getWidth, validateParams } from './utils';

const pluginName = 'postcss-px-to-vw-device';

const defaults: Required<Omit<OptionType, 'exclude' | 'include'>> = {
  unitToConvert: 'px',
  viewportUnit: 'vw',
  viewportWidth: 370,
  viewportHeight: 568,
  fontViewportUnit: 'vw',
  enable: true,
  minPixelValue: 1,
  unitPrecision: 6,
  selectorBlackList: [],
  propList: ['*'],
  replace: true,
  mediaQuery: false,
  mediaOptions: [],
};

const ignoreNextComment = 'px-to-viewport-ignore-next';
const ignorePrevComment = 'px-to-viewport-ignore';

const postcssPxToViewport = (options?: OptionType) => {
  const opts = Object.assign({}, defaults, options);

  const pxRegex = getUnitRegexp(opts.unitToConvert);
  const satisfyPropList = createPropListMatcher(opts.propList);
  let landscapeRules: AtRule[] = [];
  let mediaRules: Array<{
    mediaParam: string;
    rules: AtRule[];
  }> = [];

  return {
    postcssPlugin: pluginName,
    Once(css: Root, { result }: Helpers) {
      // @ts-ignore
      css.walkRules((rule: RuleType) => {
        const file = rule.source?.input.file || '';

        // 排除 include 配置之外的文件，不进行转换
        if (opts.include && file) {
          if (Object.prototype.toString.call(opts.include) === '[object RegExp]') {
            if (!(opts.include as RegExp).test(file)) return;
          } else if (opts.include instanceof Array) {
            let flag = false;
            for (let i = 0; i < opts.include.length; i++) {
              if (opts.include[i].test(file)) {
                flag = true;
                break;
              }
            }
            if (!flag) return;
          }
        }

        // 排除 exclude 配置的文件，不进行转换
        if (opts.exclude && file) {
          if (Object.prototype.toString.call(opts.exclude) === '[object RegExp]') {
            if ((opts.exclude as RegExp).test(file)) return;
          } else if (opts.exclude instanceof Array) {
            for (let i = 0; i < opts.exclude.length; i++) {
              if (opts.exclude[i].test(file)) return;
            }
          } else {
            throw new Error('options.exclude should be RegExp or Array.');
          }
        }

        // 排除 selectorBlackList 配置的黑名单选择器，不进行转换
        if (blacklistedSelector(opts.selectorBlackList, rule.selector)) return;

        // 添加媒体查询，不同尺寸设备使用不同的 viewportWidth 基准值进行转换
        if (opts.mediaOptions?.length && !rule.parent?.params) {
          const mediaOptions = opts.mediaOptions.filter((item) => (typeof item.enable === 'boolean' ? item.enable : opts.enable ?? false));
          for (let i = 0; i < mediaOptions.length; i++) {
            const {
              viewportWidth = opts.viewportWidth,
              unitToConvert = opts.unitToConvert,
              viewportUnit = opts.viewportUnit,
              fontViewportUnit = opts.fontViewportUnit,
              mediaParam,
            } = mediaOptions[i];

            const mediaRule = rule.clone().removeAll();
            rule.walkDecls((decl: Declaration) => {
              if (decl.value.indexOf(unitToConvert) === -1) return;
              if (!satisfyPropList(decl.prop)) return;

              const width = getWidth(viewportWidth!, file);
              if (!width) return;
              const unit = getUnit(decl.prop, { ...opts, viewportUnit, fontViewportUnit });

              mediaRule.append(
                decl.clone({
                  value: decl.value.replace(pxRegex, createPxReplace(opts, unit!, width, isInCalcOrVar(decl.value))),
                }),
              );
            });

            if (mediaRule.nodes.length > 0) {
              if (!mediaRules[i]) {
                mediaRules[i] = {
                  mediaParam,
                  rules: [],
                };
              }
              mediaRules[i].rules.push(mediaRule as unknown as AtRule);
            }
          }
        }

        // 是否排除媒体查询的转换
        if (!validateParams(rule.parent?.params, opts.mediaQuery)) return;

        // 遍历转换
        rule.walkDecls((decl, i) => {
          // 未开启，不进行转换
          if (!opts.enable) return;
          // 非目标单位，不进行转换
          if (decl.value.indexOf(opts.unitToConvert) === -1) return;
          // 非 propList 中的属性，不进行转换
          if (!satisfyPropList(decl.prop)) return;

          // 属性前注释了 ignoreNextComment, 不进行转换
          const prev = decl.prev();
          if (prev && prev.type === 'comment' && prev.text === ignoreNextComment) {
            prev.remove();
            return;
          }

          // 属性后注释了 ignorePrevComment, 不进行转换
          const next = decl.next();
          if (next && next.type === 'comment' && next.text === ignorePrevComment) {
            if (next?.raws?.before && /\n/.test(next.raws.before)) {
              result.warn('Unexpected comment /* ' + ignorePrevComment + ' */ must be after declaration at same line.', { node: next });
            } else {
              next.remove();
              return;
            }
          }

          let unit; // 转换后的单位
          let size; // 转换的基准值
          const { params } = rule.parent;

          // 获取转换单位和转换的基准值
          if (params && params.indexOf('landscape') !== -1) {
            return;
          } else {
            unit = getUnit(decl.prop, opts);
            const num = getWidth(opts.viewportWidth, file);
            if (!num) return;
            size = num;
          }

          // 计算并得到转换后的值
          const value = decl.value.replace(pxRegex, createPxReplace(opts, unit!, size, isInCalcOrVar(decl.value)));

          // 如果已经转换过则不替换
          if (declarationExists(decl.parent as unknown as ParentExtendType[], decl.prop, value)) return;

          // 替换转换后的值
          if (opts.replace) {
            decl.value = value;
          } else {
            decl.parent?.insertAfter(i, decl.clone({ value }));
          }
        });
      });
    },
    OnceExit(css: Root, { AtRule }: Helpers) {
      if (landscapeRules.length > 0) {
        const landscapeRoot = new AtRule({
          params: '(orientation: landscape)',
          name: 'media',
        });
        landscapeRules.forEach(function (rule) {
          landscapeRoot.append(rule);
        });
        css.append(landscapeRoot);
        landscapeRules = [];
      }

      if (mediaRules.length > 0) {
        for (let i = 0; i < mediaRules.length; i++) {
          let item = mediaRules[i];
          let { mediaParam, rules } = item;
          const mediaRoot = new AtRule({
            params: mediaParam,
            name: 'media',
          });
          rules.forEach(function (rule) {
            mediaRoot.append(rule);
          });
          css.append(mediaRoot);
        }
        mediaRules = [];
      }
    },
  };
};

postcssPxToViewport.postcss = true;
module.exports = postcssPxToViewport;
export default postcssPxToViewport;
