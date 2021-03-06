const path = require("path")

const appRoot = path.resolve(__dirname, "../")

const Paths = {
  Root: appRoot,
  Src: path.resolve(appRoot, "src"),
  Comps: path.resolve(appRoot, "src/components"),
  Public: path.resolve(appRoot, "public"),
  Dist: path.resolve(appRoot, "dist"),
  Config: path.resolve(appRoot, "config"),
}

module.exports = Paths
