# postcss-px-to-vw-device

<img align="right" width="95" height="95" alt="Philosopher’s stone, logo of PostCSS" src="https://postcss.org/logo.svg">

![Static Badge](https://img.shields.io/badge/build-passing-brightgreen?style=flat) ![Static Badge](https://img.shields.io/badge/coverage-100%25-green?style=flat)



将 px 单位转换为视口单位的 (vw, vh, vmin, vmax) 的 [PostCSS](https://github.com/postcss/postcss) 插件，支持多端适配，适配包括手机和手持设备、笔记本电脑、平板电脑、可穿戴设备、汽车、电视等。

## 简介

如果你的样式需要做根据视口大小来调整宽度，这个插件可以将你 CSS 中的 px 单位转化为 vw，1vw 等于 1/100 视口宽度。多端适配主要通过设置 `mediaOptions` ，设置不同的媒体查询条件及不同条件下的 viewportWidth 从而进行多端适配。具体配置和使用见文及详细的测试用例。

该插件的目的主要是通过编译时将 px 转为 vw，从而进行多端响应式高清适配。运行时请根据不同视口大小自行换算。

### 输入

```css
.class {
  margin: -10px .5vh;
  padding: 5vmin 9.5px 1px;
  border: 3px solid black;
  border-bottom-width: 1px;
  font-size: 14px;
  line-height: 20px;
}

.class2 {
  padding-top: 10px; /* px-to-viewport-ignore */
  /* px-to-viewport-ignore-next */
  padding-bottom: 10px;
  /* Any other comment */
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 20px;
  line-height: 30px;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

### 输出

```css
.class {
  margin: -3.125vw .5vh;
  padding: 5vmin 2.96875vw 1px;
  border: 0.9375vw solid black;
  border-bottom-width: 1px;
  font-size: 4.375vw;
  line-height: 6.25vw;
}

.class2 {
  padding-top: 10px;
  padding-bottom: 10px;
  /* Any other comment */
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 6.25vw;
  line-height: 9.375vw;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

## 上手

### 安装

使用 npm 安装

```
npm install postcss-px-to-vw-device --save-dev
```

或者使用 pnpm 进行安装

```
pnpm add postcss-px-to-vw-device -D 
```

### 配置参数

默认参数:

```js
{
  unitToConvert: 'px',
  viewportUnit: 'vw',
  viewportWidth: 375,
  viewportHeight: 568,
  fontViewportUnit: 'vw',
  enable: true,
  minPixelValue: 1,
  unitPrecision: 6,
  selectorBlackList: [],
  propList: ['*'],
  replace: true,
  mediaQuery: false,
  mediaOptions: []
}
```

- `unitToConvert` (String) 需要转换的单位，默认为"px"
- `viewportWidth` (Number) 设计稿的视口宽度
- `unitPrecision` (Number) 单位转换后保留的精度
- `propList` (Array) 能转化为vw的属性列表
  - 传入特定的CSS属性；
  - 可以传入通配符"*"去匹配所有属性，例如：['*']；
  - 在属性的前或后添加"*",可以匹配特定的属性. (例如['*position*'] 会匹配 background-position-y)
  - 在特定属性前加 "!"，将不转换该属性的单位 . 例如: ['*', '!letter-spacing']，将不转换letter-spacing
  - "!" 和 "*"可以组合使用， 例如: ['*', '!font*']，将不转换font-size以及font-weight等属性
- `viewportUnit` (String) 希望使用的视口单位
- `fontViewportUnit` (String) 字体使用的视口单位
- `selectorBlackList` (Array) 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
  - 如果传入的值为字符串的话，只要选择器中含有传入值就会被匹配
    - 例如 `selectorBlackList` 为 `['body']` 的话， 那么 `.body-class` 就会被忽略
  - 如果传入的值为正则表达式的话，那么就会依据CSS选择器是否匹配该正则
    - 例如 `selectorBlackList` 为 `[/^body$/]` , 那么 `body` 会被忽略，而 `.body` 不会
- `minPixelValue` (Number) 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
- `mediaQuery` (Boolean) 媒体查询里的单位是否需要转换单位
- `replace` (Boolean) 是否直接更换属性值，而不添加备用属性
- `exclude` (Array or Regexp) 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
  - 如果值是一个正则表达式，那么匹配这个正则的文件会被忽略
  - 如果传入的值是一个数组，那么数组里的值必须为正则
- `include` (Array or Regexp) 如果设置了`include`，那将只有匹配到的文件才会被转换，例如只转换 'src/mobile' 下的文件
    (`include: /\/src\/mobile\//`)
  - 如果值是一个正则表达式，将包含匹配的文件，否则将排除该文件
  - 如果传入的值是一个数组，那么数组里的值必须为正则
- `enable` (Boolean) 是否开启转换，默认 `true`, 开启转换
- `mediaOptions` (Array) 设置媒体查询，不同视口可以设置不同的 viewportWidth 从而进行多端适配。

> `exclude`和`include`是可以一起设置的，将取两者规则的交集。

#### 忽略转换

您可以使用特殊注释或者特殊写法来忽略转换：

- `/* px-to-viewport-ignore-next */` — 在单独的行上，可防止在下一行进行转换。
- `/* px-to-viewport-ignore */` — 在右侧的属性之后，阻止在同一行进行转换。
- `PX、Px` — 最简洁的是使用 `PX` 或者 `Px`，阻止转换（推荐）。

Example:

```css
/* example input: */
.class {
  /* px-to-viewport-ignore-next */
  width: 10px;
  padding: 10px;
  height: 10px; /* px-to-viewport-ignore */
  border: solid 2px #000; /* px-to-viewport-ignore */
}

/* example output: */
.class {
  width: 10px;
  padding: 3.125vw;
  height: 10px;
  border: solid 2px #000;
}
```

还有多种原因导致您的像素无法转换，以下选项可能会影响此情况：:
`propList`, `selectorBlackList`, `minPixelValue`, `mediaQuery`, `exclude`, `include`.

#### 使用PostCss配置文件时

在`postcss.config.js`添加如下配置

```js
module.exports = {
  plugins: {
    // ...
    'postcss-px-to-vw-device': {
      unitToConvert: 'px',
      viewportUnit: 'vw',
      viewportWidth: 375,  // 适配 phone
      fontViewportUnit: 'vw',
      enable: true,
      minPixelValue: 1,
      unitPrecision: 6,
      selectorBlackList: [],
      propList: ['*'],
      replace: true,
      mediaQuery: false,
      mediaOptions: [
        {
          enable: true,
          viewportWidth: 1366, // 适配 pad
          mediaParam: 'screen and (min-width: 600px) and (orientation: portrait), (min-width: 1024px) and (orientation: landscape)',
        },
        {
          enable: true,
          viewportWidth: 1600, // 适配 PC
          mediaParam: 'screen and (min-width: 1600px)',
        },
      ],
    }
  }
}
```

## 测试

为了跑测试案例，您需要安装开发套件:

```
npm install
```

然后输入下面的命令:

```
npm run test
```

## Changelog

变更日志在这儿 [CHANGELOG](CHANGELOG.md).

## 借鉴自

- 受 <https://github.com/evrone/postcss-px-to-viewport> 启发有了这个项目
