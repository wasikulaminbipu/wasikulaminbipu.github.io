const svgContents = require("eleventy-plugin-svg-contents");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(svgContents);
  eleventyConfig.addPassthroughCopy("assets");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    }
  };
};
