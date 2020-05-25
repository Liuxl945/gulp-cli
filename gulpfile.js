const path = require("path")
const gulp = require("gulp")
const bs = require("browser-sync").create() /* 热更新 */
const reload = bs.reload
const plumber = require("gulp-plumber") /* 防止编译出错跳出watch */
const clean = require("gulp-clean") /* 清理文件插件 */
const fileinclude = require("gulp-file-include") /* 合并html */
const postcss = require("gulp-postcss") /* postcss */
const sass = require("gulp-sass") /* 编译scss */
const autoprefixer = require("autoprefixer") /* 自动添加前缀 */
const cssmin = require("gulp-cssmin") /* 压缩css */
const rename = require("gulp-rename") /* 重命名 */

const jsmin = require("gulp-uglify") /* 压缩js */
const babel = require("gulp-babel") /* babel转es6 */
const rev = require("gulp-rev")
const revCollector = require("gulp-rev-collector")
const runSequence = require("run-sequence") /* gulp同步执行任务 */
const imagemin = require("gulp-imagemin")

const htmlRoot = "./src/**/*.html"
const distRoot = "./dist"
const scssRoot = "./src/assets/scss/**/*.scss"
const esRoot = "./src/assets/js/**/*.js"
const staticRoot = "./src/static/**/*"

/* 打包地址 */
const cssRoot = "./dist/assets/css"
const jsRoot = "./dist/assets/js"


gulp.task("clean", () => {
    return gulp.src(distRoot)
    .pipe(clean())
})

gulp.task("fileinclude",() => {
    return gulp.src(htmlRoot)
    .pipe(plumber())
    .pipe(fileinclude({
        prefix: "@@",
    }))
    .pipe(gulp.dest(distRoot))
})

// 编译scss
gulp.task("postcss", () => {
    return gulp.src(scssRoot)
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([autoprefixer({
            browsers: ["last 2 versions"],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg)
            //        transform: rotate(45deg)
            remove: true //是否去掉不必要的前缀 默认：true
        })]))
        .pipe(cssmin())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(cssRoot))
        .pipe(reload({
            stream: true
        }))
})

gulp.task("es6",() => {
    return gulp.src(esRoot)
        .pipe(plumber())
        .pipe(babel({
            presets: ["es2015"]
        }))
        .pipe(jsmin())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(reload({
            stream: true
        }))
        .pipe(gulp.dest(jsRoot))
})

/* 移动静态资源 */
gulp.task("static", () => {
    return gulp.src(staticRoot)
        .pipe(gulp.dest(path.join(distRoot, "/static")))
})

// 图片压缩
gulp.task("image",() => {
    return gulp.src("./src/image/**/*")
    .pipe(imagemin())
    .pipe(gulp.dest(path.join(distRoot,"/image")))
})



//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task("revCss", () => {
    return gulp.src(`${cssRoot}/*.css`)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest("./rev/css"))
})
//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task("revJs", () => {
    return gulp.src(`${jsRoot}/*.js`)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest("./rev/js"))
})
//Html替换css、js文件版本
gulp.task("revHtml", () => {
    return gulp.src(["./rev/**/*.json", html])
        .pipe(revCollector())
        .pipe(gulp.dest(htmlrev))
})


gulp.task("build",gulp.series("postcss","es6","fileinclude","static","image"))

gulp.task("serve", gulp.series("build",() => {
    bs.init({
        server: distRoot
    })
    
    gulp.watch(scssRoot, gulp.series("postcss"))
    gulp.watch(esRoot, gulp.series("es6"))
    gulp.watch(htmlRoot, gulp.series("fileinclude"))
    gulp.watch(htmlRoot).on("change",reload)
}))


gulp.task("default", gulp.series("serve"))
