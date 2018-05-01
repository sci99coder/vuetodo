const path=require('path')
const HTMLPlugin=require('html-webpack-plugin')
const webpack=require('webpack')

//package.json  cross-env  不同的平台可以使用同一个命令
//把非js的东西，单独打包成文件 如：抽取css
const ExtractPlugin=require('extract-text-webpack-plugin')

const isDev=process.env.NODE_ENV==='development'

config={
    //配置devServer
    target:'web',
    //输入
    entry:path.join(__dirname,'src/index.js'),//__dirname 当前文件的目录地址
    //输出
    output:{
        filename:'bundle.js',
        path:path.join(__dirname,'dist')
    },
    module:{
        rules:[
            {
                test:/\.vue$/,
                loader:'vue-loader'
            },
            {
                test:/\.jsx$/,
                loader:'babel-loader'
            },
            {
                test:/\.css$/,
                use:[
                    'style-loader',//提取出css 插入到html中
                    'css-loader'//从css文件读取css
                ]
            },            
            {
                test:/\.(gif|jpg|jpeg|png|svg)$/,
                use:[
                    {
                        loader:'url-loader',//把图片转化为base64
                        options:{
                            limit:1024,
                            name:'[name]-aa.[ext]'//重命名
                        }
                    }

                ]
            }
        ]
    },
    plugins:[
        //业务代码中可以直接调用 process.env
        new webpack.DefinePlugin({
            'process.env':{
                NODE_ENV:isDev?'"development"':'"production"'
            }
        }),
        //将js 文件放到html中
        new HTMLPlugin()
    ]
}

if(isDev){//开发环境
    config.module.rules.push({
        test:/\.styl/,
        use:[
            'style-loader',
            'css-loader',
            {
                loader:"postcss-loader",
                options:{
                    sourceMap:true,//会用前面生成的sourceMap
                }
            },
            'stylus-loader'
        ]
    }),
    //加上这行，webpack 调试时还是显示源代码
    config.devtool='#cheap-module-eval-source-map',
    config.devServer={
        port:8000,
        host:'0.0.0.0',
        //有任何的错都显示到网页上
        overlay:{
            errors:true
        },
        //自动打开一个新页面
        open:true,
        hot:true    //---渲染某个组件不会加载整个页面，加上以下三行代码就不用刷新页面
    },
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),//---
        new webpack.NoEmitOnErrorsPlugin() //--
    )
}else{
    //
    config.entry={
        app:path.join(__dirname,'src/index.js'),
        //把第三方类库如vue jquery 单独打包成一个文件，因为这部分文件一般不会更新，要和业务代码区分开来。
        vendor:['vue']
    }
    //修改正式环境打包生成的文件名  这个文件一定要注意要选择chunkhash  不要是hash值
    config.output.filename='[name].[chunkhash:8].js'
    //css 文件会单独打包
    config.module.rules.push({
        test:/\.styl/,
        use:ExtractPlugin.extract({
            fallback:'style-loader',
            use:[                
                'css-loader',
                {
                    loader:"postcss-loader",
                    options:{
                        sourceMap:true,//会用前面生成的sourceMap
                    }
                },
                'stylus-loader'
            ]
        })
    })
    config.plugins.push(
        new ExtractPlugin('styles.[contenthash:8].css'),
        //把第三方类库如vue jquery 单独打包成一个文件 生成的文件名
        new webpack.optimize.CommonsChunkPlugin({
            name:'vendor'
        }),
        //把生成的app.js 中webpack 相关的代码，单独打包到一个文件中
        new webpack.optimize.CommonsChunkPlugin({
            name:'runtime'
        })
    )
}
module.exports=config