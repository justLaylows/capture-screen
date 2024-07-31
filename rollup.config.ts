import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from "autoprefixer";
import postcssUrl from "postcss-url";
import url from "@rollup/plugin-url";
const pkg = require('./package.json');
const banner = `/*!
 * ${pkg.title} ${pkg.version} <${pkg.homepage}>
 * Copyright (c) ${(new Date()).getFullYear()} ${pkg.author.name} <${pkg.author.url}>
 * Released under ${pkg.license} License
 */`;

export default {
    input: `src/index.ts`,
    output: [
        { file: pkg.main, name: pkg.name, format: 'umd', banner, },
        { file: pkg.module, format: 'esm', banner },
    ],
    watch: {
        include: 'src/**',
    },
    plugins: [
        typescript(),
        commonjs(),
        postcss({
            minimize: true,
            sourceMap: false,
            extensions: [".css"],
            plugins: [
                autoprefixer(),
                // 再次调用将css中引入的图片按照规则进行处理
                postcssUrl([
                    {
                        url: "inline",
                        maxSize: 8, // 最大文件大小（单位为KB），超过该大小的文件将不会被编码为base64
                        fallback: "copy", // 如果文件大小超过最大大小，则使用copy选项复制文件
                        useHash: true, // 进行hash命名
                        encodeType: "base64" // 指定编码类型为base64
                    }
                ])
            ]
        }),
        // 处理通过img标签引入的图片
        url({
            include: ["**/*.jpg", "**/*.png", "**/*.svg"],
            // 输出路径
            destDir: "dist/assets",
            // 超过10kb则拷贝否则转base64
            limit: 10 * 1024 // 10KB
        }),
        resolve(),
        terser({
            // 可选的配置选项
            format: {
                comments: false, // 移除所有注释
            },
            mangle: true, // 变量名混淆
            compress: {
                drop_console: true, // 移除 console.log 等
                pure_funcs: ['console.log'] // 移除 console.log 函数调用
            }
        }),
    ],
}
