const svgContents = require("eleventy-plugin-svg-contents");
const Image = require("@11ty/eleventy-img");
const htmlmin = require("html-minifier-terser");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(svgContents);
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms.txt");
  eleventyConfig.addPassthroughCopy("src/llms-full.txt");

  // Shortcode for responsive images via @11ty/eleventy-img
  eleventyConfig.addNunjucksAsyncShortcode("image", async function(src, alt, sizes = "100vw", classNames = "") {
    let metadata = await Image(src, {
      widths: [300, 600, 900],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./_site/assets/images/generated/",
      urlPath: "/assets/images/generated/"
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
      class: classNames
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  // Minify HTML in production build
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    }
  };
};
