# colorful-wallpaper

### start
```
# cmd
git clone git@github.com:xiaomingTang/colorful-wallpaper.git
cd colorful-wallpaper
yarn
yarn start
```

### 项目特点
- typescript + react
- eslint
- autoprefixer全家桶
- scss module (利用了typings-for-css-modules-loader)
- dev模式下代码不经过eslint-loader, 以加速开发时的编译(该阶段配合编辑器进行eslint)
- prod模式下启用eslint-loader, 以使代码更加严谨
- 集成`webpack-bundle-analyzer`, 一键(`yarn run bundle`)分析打包状况

### warning
由于该项目主要个人独自使用, 因此将`.vscode`配置也上传到了git, 如其他人使用, 则你需要自主考虑将`.vscode`上传到git是否合适(可能会影响到同时使用该项目的其他人)
