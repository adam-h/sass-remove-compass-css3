#!/usr/bin/env node
var glob = require("glob");
var path = require("path");
var fs = require("fs");
var XRegExp = require("xregexp");
var chalk = require('chalk');

var argv = require("yargs")
  .default("b", "./")
  .alias("b", "base")
  .describe("b", "Base path to search")
  .alias("f", "file")
  .describe("f", "Single file processing")
  .boolean("d")
  .alias("d", "dry-run")
  .describe("d", "Don't actually change the files")
  .boolean("i")
  .alias("i", "ignored")
  .describe("i", "Show ignored mixins")
  .boolean("v")
  .alias("v", "verbose")
  .describe("v", "Be more noisy")
  .help("h")
  .alias("h", "help")
  .argv;

// These just output the arguments as a string
var simple_mixins = [
  "background-size",
  "border-radius",
  "border-top-right-radius",
  "border-top-left-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
  "box-sizing",
  "box-shadow",
  "text-shadow",
  "opacity",
  "transition-duration",
  "transition-property",
  "transition",
  "word-break",
  "user-select"
];

var mixins = {
  "border-top-radius": function(args) {
    return "border-top-left-radius: " + args;
    return "border-top-right-radius: " + args;
  },
  "border-bottom-radius": function(args) {
    return "border-bottom-left-radius: " + args;
    return "border-bottom-right-radius: " + args;
  },
  "border-left-radius": function(args) {
    return "border-top-left-radius: " + args;
    return "border-bottom-left-radius: " + args;
  },
  "border-right-radius": function(args) {
    return "border-top-right-radius: " + args;
    return "border-bottom-right-radius: " + args;
  },
  "rotate": function(args) {
    args = args.split(",");
    if(args.length === 1) {
      return "transform: rotate(" + args[0].trim() + ")";
    } else {
      // Not handling perspective or 3d compass options
      return false;
    }
  }
};

simple_mixins.forEach(function(m) {
  mixins[m] = function(args) {
    return m + ": " + args;
  }
})

var mixins_re = XRegExp(
  "(?<rule>                                     # Whole rule group \n\
    \\+                                           # sass mixin start character \n\
    (?<mixin> "+Object.keys(mixins).join("|")+" ) # Mixin name  \n\
      \\(                                         # Mixin function brace start \n\
        (?<args> [^\)]*                         ) # Mixin arguments \n\
      \\)                                         # Mixin function brace end \n\
  )                                             # End whole rule \n\
  \\s*$                                         # Optional whitespace to line end \n\
  ", "gmx");

other_mixin_re = /(\+[\w-]+\([^\)]*\))\s*$/gm;

function processSass(filepath) {
  console.log("Processing %s", filepath)
  var original_sass = fs.readFileSync(filepath, "utf8")

  var sass = XRegExp.replace(original_sass, mixins_re, function(match) {
    var replacement = mixins[match.mixin](match.args);

    if(replacement) {
      if(argv["dry-run"] || argv.verbose) {
        console.log("Replacing");
        console.log("\t", chalk.red(match.rule));
        console.log("\t", chalk.green(replacement));
      }
      return replacement;
    } else {
      console.error(chalk.bgRed("Cannot replace %s"), match.rule);
      return match.rule;
    }
  });

  if(argv.ignored) {
    if(other_mixin_re.test(sass)) {
      console.log("Ignored:")
      XRegExp.forEach(sass, other_mixin_re, function(match, i) {
        console.log("\t", chalk.magenta(match[1]))
      });
    }
  }

  if(argv["dry-run"]) {
    console.log("Done (*not* saved)");
  } else {
    fs.writeFileSync(filepath, sass, "utf8");
    console.log("Saved");
  }
}

if(argv.file) {
  processSass(argv.file);
} else {
  glob(path.join(argv.base, "**/*.sass"), function (err, files) {
    if(err) {
      throw err;
    }
    files.forEach(processSass);
  })
}
