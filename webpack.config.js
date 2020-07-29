const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = (env, argv) => {

    console.log("----------------------------")
    console.log(" ", argv.bundle, " | ", argv.mode);
    console.log("----------------------------\n")

    const res = {
        entry: "REPLACE",
        output: {
            path: "REPLACE",
            filename: "REPLACE"
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: [/node_modules/],
                    use: [
                        {
                            loader: "babel-loader",
                        },
                        {
                            loader: "eslint-loader",
                            options: {
                                configFile: path.resolve(__dirname, "eslintrc.js")
                            }
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader"
                    ]
                },
                {
                    test: /\.(ico)$/,
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]"
                    }
                }
            ]
        },
        plugins: []
    };

    if (argv.bundle === "dist") {
        res.entry = path.resolve(__dirname, "src/index.js");
        res.output.path = path.resolve(__dirname, "dist");
        res.output.filename = argv.mode === "production"
            ? "owp.graph.min.js"
            : "owp.graph.js"
        res.output.libraryTarget = "umd";
        res.devtool = "source-map";
    }
    else if (argv.bundle === "docs") {
        res.entry = path.resolve(__dirname, "demo/index.js");
        res.output.path = path.resolve(__dirname, "docs");
        res.output.filename = "index.js";
        res.plugins = [
            new HtmlWebPackPlugin({
                template: path.resolve(__dirname, "demo/index.html")
            }),
            //Extract css styles as external file.
            new MiniCssExtractPlugin({
                filename: "styles.css"
            })
        ];
    }

    return res;
};