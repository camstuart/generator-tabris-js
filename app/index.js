const Generator = require('yeoman-generator');
const utilities = require('./utilities.js');

const PROJECT_TYPES = [{
  name: 'Basic JS App',
  value: 'basic'
}, {
  name: 'ES6 App (using Babel transpiler)',
  short: 'ES6 App',
  value: 'es6'
}, {
  name: 'TypeScript App',
  value: 'ts'
}];

module.exports = class extends Generator {

  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: this.appname, // defaults to current working dir
        filter: utilities.toId
      }, {
        type: 'input',
        name: 'version',
        message: 'Initial version',
        default: '0.1.0'
      }, {
        type: 'list',
        name: 'proj_type',
        message: 'Type of project',
        choices: PROJECT_TYPES
      }, {
        type: 'confirm',
        name: 'prep_build',
        message: 'Prepare app build',
        default: true
      }, {
        when: answers => answers.prep_build,
        type: 'input',
        name: 'app_id',
        message: 'App ID',
        default: answers => utilities.toAppId(answers.name),
        validate: input => utilities.appIdIsValid(input) ||
          'Invalid App ID, use alphanumeric characters and periods only, EG: com.domain.app'
      }, {
        when: answers => answers.prep_build,
        type: 'input',
        name: 'app_name',
        message: 'App name',
        default: answers => utilities.toName(answers.name)
      }, {
        when: answers => answers.prep_build,
        type: 'input',
        name: 'app_description',
        message: 'App description',
        default: 'Example Tabris.js App'
      }, {
        when: answers => answers.prep_build,
        type: 'input',
        name: 'author_name',
        message: 'Author',
        default: this.user.git.name
      }, {
        when: answers => answers.prep_build,
        type: 'input',
        name: 'author_email',
        message: 'Email',
        default: this.user.git.email
      }
    ]).then(answers => {
      let compile = answers.proj_type !== 'basic';
      this._props = Object.assign(answers, {main: compile ? 'dist/app.js' : 'src/app.js'});
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      this._props
    );
    if (this._props.prep_build) {
      this.fs.copyTpl(
        this.templatePath('cordova'),
        this.destinationPath('cordova'),
        this._props
      );
    }
    if (this._props.proj_type === 'es6') {
      this.fs.copyTpl(
        this.templatePath('es6/_babelrc'),
        this.destinationPath('.babelrc')
      );
      this.fs.copyTpl(
        this.templatePath('es6/_gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copyTpl(
        this.templatePath('es6/src'),
        this.destinationPath('src'),
        this._props
      );
    } else if (this._props.proj_type === 'ts') {
      this.fs.copyTpl(
        this.templatePath('ts/_gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copyTpl(
        this.templatePath('ts/src'),
        this.destinationPath('src'),
        this._props
      );
      this.fs.copyTpl(
        this.templatePath('ts/tsconfig.json'),
        this.destinationPath('tsconfig.json')
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('basic/_gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copyTpl(
        this.templatePath('basic/src'),
        this.destinationPath('src'),
        this._props
      );
    }
  }

  install() {
    this.npmInstall(['tabris@2.0.0-beta1'], {
      save: true
    });
    if (this._props.proj_type === 'es6') {
      this.npmInstall([
        'babel-cli',
        'babel-plugin-transform-es2015-arrow-functions',
        'babel-plugin-transform-es2015-block-scoping',
        'babel-plugin-transform-es2015-classes',
        'babel-plugin-transform-es2015-modules-commonjs',
        'babel-plugin-transform-es2015-computed-properties',
        'babel-plugin-transform-es2015-destructuring',
        'babel-plugin-transform-es2015-parameters',
        'babel-plugin-transform-es2015-shorthand-properties',
        'babel-plugin-transform-es2015-spread',
        'babel-plugin-transform-es2015-template-literals'
      ], {
        saveDev: true
      });
    } else if (this._props.proj_type === 'ts') {
      this.npmInstall(['typescript'], {
        saveDev: true
      });
    }
  }

};

