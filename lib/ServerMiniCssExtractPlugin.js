const MiniCssExtractPlugin = require('mini-css-extract-plugin')

class ServerMiniCssExtractPlugin extends MiniCssExtractPlugin {
  getCssChunkObject (mainChunk) {
    return {}
  }
}

module.exports = ServerMiniCssExtractPlugin
