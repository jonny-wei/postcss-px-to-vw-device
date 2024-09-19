import postcss from 'postcss';
import pxToViewport from '../src';
import { filterPropList } from '../src/prop-list-matcher';
const basicCSS = '.rule { font-size: 15px }';

describe('px-to-viewport', function () {
  it('should work on the readme example', function () {
    const input = 'h1 { margin: 0 0 20px; font-size: 32px; line-height: var(--line-height); letter-spacing: 1px; height: calc(10px * var(--font-scale, 1px)); width: max(var(--width, 1px), 10px); min-height: calc(210px - var(--safe-area-inset-top) - var(--nav-bar-height)); }';
    const output = 'h1 { margin: 0 0 6.25vw; font-size: 10vw; line-height: var(--line-height); letter-spacing: 1px; height: calc(3.125vw * var(--font-scale, 0.3125vw)); width: max(var(--width, 0.3125vw), 3.125vw); min-height: calc(65.625vw - var(--safe-area-inset-top) - var(--nav-bar-height)); }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(input).css;

    expect(processed).toBe(output);
  });

  it('should replace the px unit with vw', function () {
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(basicCSS).css;
    const expected = '.rule { font-size: 4.6875vw }';

    expect(processed).toBe(expected);
  });

  it('should handle < 1 values and values without a leading 0', function () {
    const rules = '.rule { margin: 0.5rem .5px -0.2px -.2em }';
    const expected = '.rule { margin: 0.5rem 0.15625vw -0.0625vw -.2em }';
    const options = {
      minPixelValue: 0,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should remain unitless if 0', function () {
    const expected = '.rule { font-size: 0px; font-size: 0; }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(expected).css;

    expect(processed).toBe(expected);
  });

  it('should not add properties that already exist', function () {
    const expected = '.rule { font-size: 16px; font-size: 5vw;  }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(expected).css;

    expect(processed).toBe(expected);
  });

  it('should not replace units inside mediaQueries by default', function () {
    const expected = '@media (min-width: 500px) { .rule { font-size: 16px } }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process('@media (min-width: 500px) { .rule { font-size: 16px } }').css;

    expect(processed).toBe(expected);
  });
});

describe('value parsing', function () {
  it('should not replace values in double quotes or single quotes', function () {
    const options = {
      propList: ['*'],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const rules = '.rule { content: \'16px\'; font-family: "16px"; font-size: 16px; }';
    const expected = '.rule { content: \'16px\'; font-family: "16px"; font-size: 5vw; }';
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should not replace values in `url()`', function () {
    const rules = '.rule { background: url(16px.jpg); font-size: 16px; }';
    const expected = '.rule { background: url(16px.jpg); font-size: 5vw; }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should not replace values with an uppercase P or X', function () {
    const rules = '.rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }';
    const expected = '.rule { margin: 3.75vw calc(100% - 14PX); height: calc(100% - 6.25vw); font-size: 12Px; line-height: 5vw; }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('unitToConvert', function () {
  it('should ignore non px values by default', function () {
    const expected = '.rule { font-size: 2em }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(expected).css;

    expect(processed).toBe(expected);
  });

  it('should convert only values described in options', function () {
    const rules = '.rule { font-size: 5em; line-height: 2px }';
    const expected = '.rule { font-size: 1.5625vw; line-height: 2px }';
    const options = {
      unitToConvert: 'em',
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('viewportWidth', function () {
  it('should should replace using 320px by default', function () {
    const expected = '.rule { font-size: 4.6875vw }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(basicCSS).css;

    expect(processed).toBe(expected);
  });

  it('should replace using viewportWidth from options', function () {
    const expected = '.rule { font-size: 3.125vw }';
    const processed = postcss(pxToViewport({ viewportWidth: 480, unitPrecision: 5 })).process(basicCSS).css;

    expect(processed).toBe(expected);
  });
});

describe('unitPrecision', function () {
  it('should replace using a decimal of 2 places', function () {
    const expected = '.rule { font-size: 4.69vw }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 2 })).process(basicCSS).css;

    expect(processed).toBe(expected);
  });
});

describe('viewportUnit', function () {
  it('should replace using unit from options', function () {
    const rules = '.rule { margin-top: 15px }';
    const expected = '.rule { margin-top: 4.6875vh }';
    const options = {
      viewportUnit: 'vh',
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('fontViewportUnit', function () {
  it('should replace only font-size using unit from options', function () {
    const rules = '.rule { margin-top: 15px; font-size: 8px; }';
    const expected = '.rule { margin-top: 4.6875vw; font-size: 2.5vmax; }';
    const options = {
      fontViewportUnit: 'vmax',
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('selectorBlackList', function () {
  it('should ignore selectors in the selector black list', function () {
    const rules = '.rule { font-size: 15px } .rule2 { font-size: 15px }';
    const expected = '.rule { font-size: 4.6875vw } .rule2 { font-size: 15px }';
    const options = {
      selectorBlackList: ['.rule2'],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should ignore every selector with `body$`', function () {
    const rules = 'body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }';
    const expected = 'body { font-size: 5vw; } .class-body$ { font-size: 16px; } .simple-class { font-size: 5vw; }';
    const options = {
      selectorBlackList: ['body$'],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should only ignore exactly `body`', function () {
    const rules = 'body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }';
    const expected = 'body { font-size: 16px; } .class-body { font-size: 5vw; } .simple-class { font-size: 5vw; }';
    const options = {
      selectorBlackList: [/^body$/],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('propList', function () {
  it('should only replace properties in the prop list', function () {
    const css = '.rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }';
    const expected = '.rule { font-size: 5vw; margin: 5vw; margin-left: 5px; padding: 5px; padding-right: 5vw }';
    const options = {
      propList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad'],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should only replace properties in the prop list with wildcard', function () {
    const css = '.rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }';
    const expected = '.rule { font-size: 16px; margin: 5vw; margin-left: 5px; padding: 5px; padding-right: 16px }';
    const options = {
      propList: ['*', '!margin-left', '!*padding*', '!font*'],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should replace all properties when prop list is not given', function () {
    const rules = '.rule { margin: 16px; font-size: 15px }';
    const expected = '.rule { margin: 5vw; font-size: 4.6875vw }';
    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('minPixelValue', function () {
  it('should not replace values below minPixelValue', function () {
    const options = {
      minPixelValue: 1,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const rules =
      '.rule { border: 1px solid #000; font-size: 16px; line-height: calc(20 * var(--font-scale) * 1px); margin: 1px 10px; width: var(--mobile-width, 1px); } .rule::before { border: 1px solid #000; }';
    const expected =
      '.rule { border: 1px solid #000; font-size: 5vw; line-height: calc(20 * var(--font-scale) * 0.3125vw); margin: 1px 3.125vw; width: var(--mobile-width, 0.3125vw); } .rule::before { border: 1px solid #000; }';
    const processed = postcss(pxToViewport(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe('exclude', function () {
  const rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
  const covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';

  it('when using regex at the time, the style should not be overwritten.', function () {
    const options = {
      exclude: /\/node_modules\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/node_modules/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using regex at the time, the style should be overwritten.', function () {
    const options = {
      exclude: /\/node_modules\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/example/main.css',
    }).css;

    expect(processed).toBe(covered);
  });

  it('when using array at the time, the style should not be overwritten.', function () {
    const options = {
      exclude: [/\/node_modules\//, /\/exclude\//],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/exclude/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using array at the time, the style should be overwritten.', function () {
    const options = {
      exclude: [/\/node_modules\//, /\/exclude\//],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/example/main.css',
    }).css;

    expect(processed).toBe(covered);
  });
});

describe('include', function () {
  const rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
  const covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';

  it('when using regex at the time, the style should not be overwritten.', function () {
    const options = {
      include: /\/mobile\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/pc/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using regex at the time, the style should be overwritten.', function () {
    const options = {
      include: /\/mobile\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/mobile/main.css',
    }).css;

    expect(processed).toBe(covered);
  });

  it('when using array at the time, the style should not be overwritten.', function () {
    const options = {
      include: [/\/flexible\//, /\/mobile\//],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/pc/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using array at the time, the style should be overwritten.', function () {
    const options = {
      include: [/\/flexible\//, /\/mobile\//],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/flexible/main.css',
    }).css;

    expect(processed).toBe(covered);
  });
});

describe('include-and-exclude', function () {
  const rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
  const covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';

  it('when using regex at the time, the style should not be overwritten.', function () {
    const options = {
      include: /\/mobile\//,
      exclude: /\/not-transform\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/mobile/not-transform/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using regex at the time, the style should be overwritten.', function () {
    const options = {
      include: /\/mobile\//,
      exclude: /\/not-transform\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/mobile/style/main.css',
    }).css;

    expect(processed).toBe(covered);
  });

  it('when using array at the time, the style should not be overwritten.', function () {
    const options = {
      include: [/\/flexible\//, /\/mobile\//],
      exclude: [/\/not-transform\//, /pc/],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/flexible/not-transform/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using regex at the time, the style should be overwritten.', function () {
    const options = {
      include: [/\/flexible\//, /\/mobile\//],
      exclude: [/\/not-transform\//, /pc/],
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/mobile/style/main.css',
    }).css;

    expect(processed).toBe(covered);
  });
});

describe('regex', function () {
  const rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
  const covered = '.rule { border: 1px solid #000; font-size: 5vw; margin: 1px 3.125vw; }';

  it('when using regex at the time, the style should not be overwritten.', function () {
    const options = {
      exclude: /pc/,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/pc-project/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using regex at the time, the style should be overwritten.', function () {
    const options = {
      exclude: /\/pc\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/pc-project/main.css',
    }).css;

    expect(processed).toBe(covered);
  });

  it('when using regex at the time, the style should not be overwritten.', function () {
    const options = {
      include: /\/pc\//,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/pc-project/main.css',
    }).css;

    expect(processed).toBe(rules);
  });

  it('when using regex at the time, the style should be overwritten.', function () {
    const options = {
      include: /pc/,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(rules, {
      from: '/pc-project/main.css',
    }).css;

    expect(processed).toBe(covered);
  });
});

describe('replace', function () {
  it('should leave fallback pixel unit with root em value', function () {
    const options = {
      replace: false,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process(basicCSS).css;
    const expected = '.rule { font-size: 15px; font-size: 4.6875vw }';

    expect(processed).toBe(expected);
  });
});

describe('filter-prop-list', function () {
  it('should find "exact" matches from propList', function () {
    const propList = ['font-size', 'margin', '!padding', '*border*', '*', '*y', '!*font*'];
    const expected = 'font-size,margin';
    expect(filterPropList.exact(propList).join()).toBe(expected);
  });

  it('should find "contain" matches from propList and reduce to string', function () {
    const propList = ['font-size', '*margin*', '!padding', '*border*', '*', '*y', '!*font*'];
    const expected = 'margin,border';
    expect(filterPropList.contain(propList).join()).toBe(expected);
  });

  it('should find "start" matches from propList and reduce to string', function () {
    const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
    const expected = 'border';
    expect(filterPropList.startWith(propList).join()).toBe(expected);
  });

  it('should find "end" matches from propList and reduce to string', function () {
    const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
    const expected = 'y';
    expect(filterPropList.endWith(propList).join()).toBe(expected);
  });

  it('should find "not" matches from propList and reduce to string', function () {
    const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
    const expected = 'padding';
    expect(filterPropList.notExact(propList).join()).toBe(expected);
  });

  it('should find "not contain" matches from propList and reduce to string', function () {
    const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
    const expected = 'font';
    expect(filterPropList.notContain(propList).join()).toBe(expected);
  });

  it('should find "not start" matches from propList and reduce to string', function () {
    const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
    const expected = 'border';
    expect(filterPropList.notStartWith(propList).join()).toBe(expected);
  });

  it('should find "not end" matches from propList and reduce to string', function () {
    const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '!*y', '!*font*'];
    const expected = 'y';
    expect(filterPropList.notEndWith(propList).join()).toBe(expected);
  });
});

describe('/* px-to-viewport-ignore */ & /* px-to-viewport-ignore-next */', function () {
  it('should ignore right-commented', function () {
    const css = '.rule { font-size: 15px; /* simple comment */ width: 100px; /* px-to-viewport-ignore */ height: 50px; }';
    const expected = '.rule { font-size: 4.6875vw; /* simple comment */ width: 100px; height: 15.625vw; }';

    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should ignore right-commented in multiline-css', function () {
    const css = '.rule {\n  font-size: 15px;\n  width: 100px; /*px-to-viewport-ignore*/\n  height: 50px;\n}';
    const expected = '.rule {\n  font-size: 4.6875vw;\n  width: 100px;\n  height: 15.625vw;\n}';

    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should ignore before-commented in multiline-css', function () {
    const css = '.rule {\n  font-size: 15px;\n  /*px-to-viewport-ignore-next*/\n  width: 100px;\n  /*px-to-viewport-ignore*/\n  height: 50px;\n}';
    const expected = '.rule {\n  font-size: 4.6875vw;\n  width: 100px;\n  /*px-to-viewport-ignore*/\n  height: 15.625vw;\n}';

    const processed = postcss(pxToViewport({ viewportWidth: 320, unitPrecision: 5 })).process(css).css;

    expect(processed).toBe(expected);
  });
});

describe('mediaQuery', function () {
  it('should replace px inside media queries if opts.mediaQuery', function () {
    const options = {
      mediaQuery: true,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process('.rule { font-size: 32px } @media (min-width: 500px) { .rule { font-size: 16px } }').css;
    const expected = '.rule { font-size: 10vw } @media (min-width: 500px) { .rule { font-size: 5vw } }';

    expect(processed).toBe(expected);
  });

  it('should not replace px inside media queries if not opts.mediaQuery', function () {
    const options = {
      mediaQuery: false,
      viewportWidth: 320,
      unitPrecision: 5,
    };
    const processed = postcss(pxToViewport(options)).process('@media (min-width: 500px) { .rule { font-size: 16px } }').css;
    const expected = '@media (min-width: 500px) { .rule { font-size: 16px } }';

    expect(processed).toBe(expected);
  });
});

describe('enable', function () {
  it('should enable transform', function () {
    const css = '.rule { font-size: 15px; width: 100px; height: 50px; }';
    const expected = '.rule { font-size: 15px; width: 100px; height: 50px; }';

    const processed = postcss(pxToViewport({ enable: false, viewportWidth: 320, unitPrecision: 5 })).process(css).css;

    expect(processed).toBe(expected);
  });
});

describe('mediaOptions', function () {
  it('should only compatible with pad, not phone', function () {
    const css = '.rule { font-size: 32px; background-color: #ffffff; }';
    const expected =
      '.rule { font-size: 32px; background-color: #ffffff; }@media screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape) {.rule { font-size: 2.34261vw; } }';

    const options = {
      viewportWidth: 320,
      unitPrecision: 5,
      enable: false,
      mediaOptions: [
        {
          enable: true,
          viewportWidth: 1366,
          mediaParam: 'screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape)',
        },
      ],
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should adapting to pad and adapting to phone', function () {
    const css = '.rule { font-size: 32px; background-color: #ffffff; } @media (min-width: 500px) { .rule { font-size: 16px } }';
    const expected =
      '.rule { font-size: 10vw; background-color: #ffffff; } @media (min-width: 500px) { .rule { font-size: 5vw } } @media screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape) {.rule { font-size: 2.34261vw; } }';

    const options = {
      viewportWidth: 320,
      unitPrecision: 5,
      enable: true,
      mediaQuery: true,
      mediaOptions: [
        {
          enable: true,
          viewportWidth: 1366,
          mediaParam: 'screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape)',
        },
      ],
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should adapting to pad and adapting to phone with default enable value', function () {
    const css = '.rule { font-size: 32px; background-color: #ffffff; }';
    const expected =
      '.rule { font-size: 10vw; background-color: #ffffff; }@media screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape) {.rule { font-size: 2.34261vw; } }@media screen and (min-width: 1600px) {.rule { font-size: 1.66667vw; } }';

    const options = {
      viewportWidth: 320,
      unitPrecision: 5,
      mediaOptions: [
        {
          viewportWidth: 1366,
          mediaParam: 'screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape)',
        },
        {
          viewportWidth: 1920,
          mediaParam: 'screen and (min-width: 1600px)',
        },
      ],
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should adapting to phone, pad or pc', function () {
    const css = '.rule { font-size: 32px; background-color: #ffffff; }';
    const expected =
      '.rule { font-size: 10vw; background-color: #ffffff; }@media screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape) {.rule { font-size: 2.34261vw; } }';

    const options = {
      viewportWidth: 320,
      unitPrecision: 5,
      mediaOptions: [
        {
          viewportWidth: 1366,
          mediaParam: 'screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape)',
        },
        {
          enable: false,
          viewportWidth: 1920,
          mediaParam: 'screen and (min-width: 1600px)',
        },
      ],
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should adapting to phone, pad or pc with enable default value', function () {
    const css = '.rule { font-size: 32px; background-color: #ffffff; }';
    const expected =
      '.rule { font-size: 10vw; background-color: #ffffff; }@media screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape) {.rule { font-size: 2.34261vw; } }@media screen and (min-width: 1600px) {.rule { font-size: 1.66667vw; } }';

    const options = {
      viewportWidth: 320,
      unitPrecision: 5,
      enable: true,
      mediaOptions: [
        {
          viewportWidth: 1366,
          mediaParam: 'screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape)',
        },
        {
          viewportWidth: 1920,
          mediaParam: 'screen and (min-width: 1600px)',
        },
      ],
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });

  it('should not adapting to phone, pad or pc with enable default value', function () {
    const css = '.rule { font-size: 32px; background-color: #ffffff; }';
    const expected =
      '.rule { font-size: 32px; background-color: #ffffff; }';

    const options = {
      viewportWidth: 320,
      unitPrecision: 5,
      enable: false,
      mediaOptions: [
        {
          viewportWidth: 1366,
          mediaParam: 'screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape)',
        },
        {
          viewportWidth: 1920,
          mediaParam: 'screen and (min-width: 1600px)',
        },
      ],
    };
    const processed = postcss(pxToViewport(options)).process(css).css;

    expect(processed).toBe(expected);
  });
});
