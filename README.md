# Tool remove compass dependencies from sass

Focusing on the compass/css3 mixins, this tool converts them to
standard CSS rules which can then be handled by autoprefixer.

_Not an exhaustive list of the compass mixins, just some common ones_

## Usage

Run it as a 'dry-run' (no files changed) on all sass files from your current path:

    sass-remove-compass-css3 --dry-run --ignored

This will list all changes it would make, along with the mixins it finds that it will not handle.

If you're happy with the changes, go for it with just `sass-remove-compass-css3`.

Under the hood this uses the file glob `**/*.sass`. You can modify the base directory with `--base`. See `--help` for all options.

### Single file

It can also be ran against a single file with `--file`, e.g.

    sass-remove-compass-css3 --dry-run --ignored --file stylesheets/main.sass
