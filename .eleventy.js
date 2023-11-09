const svgContents = require("eleventy-plugin-svg-contents");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
    // Return your Object options:
    return {
      passthroughFileCopy: true,
      dir: {
        input: "src",
        includes: "_includes",
        output: "dist"
      }
    }
  };