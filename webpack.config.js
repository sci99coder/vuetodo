const path=require('path')
const HTMLPlugin=require('html-webpack-plugin')
const webpack=require('webpack')

//抽取css
const ExtractPlugin=require('extract-text-webpack-plugin')

const isDev=process.env.NODE_ENV==='development'

config={
    target:'web',
    entry:path.join(__dirname,'src/index.js'),
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
                    'css-loader'
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
        //业务代码中调用
        new webpack.DefinePlugin({
            'process.env':{
                NODE_ENV:isDev?'"development"':'"production"'
            }
        }),
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
    config.devtool='#cheap-module-eval-source-map',
    config.devServer={
        port:8000,
        host:'0.0.0.0',
        overlay:{//有任何的错都显示到网页上
            errors:true
        },
        open:true,
        hot:true    //---加上以下三个就不用刷新页面
    },
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),//---
        new webpack.NoEmitOnErrorsPlugin() //--
    )
}else{
    config.entry={
        app:path.join(__dirname,'src/index.js'),
        vendor:['vue']
    }
    config.output.filename='[name].[chunkhash:8].js'
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
        new webpack.optimize.CommonsChunkPlugin({
            name:'vendor'
        }),
        //webpack 相关的代码，单独打包到一个文件中
        new webpack.optimize.CommonsChunkPlugin({
            name:'runtime'
        })
    )
}
module.exports=config