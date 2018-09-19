(function() {
  var ELECTRON_APP_DATA_PATH, OS_DATA_PATH, PRODUCT_NAME, Promise, check, cwd, fs, getSymlinkType, isProduction, la, log, os, ospath, path, pkg,
    slice = [].slice;

  os = require("os");

  path = require("path");

  ospath = require("ospath");

  Promise = require("bluebird");

  la = require("lazy-ass");

  check = require("check-more-types");

  log = require("debug")("cypress:server:appdata");

  pkg = require("@packages/root");

  fs = require("../util/fs");

  cwd = require("../cwd");

  PRODUCT_NAME = pkg.productName || pkg.name;

  OS_DATA_PATH = ospath.data();

  ELECTRON_APP_DATA_PATH = path.join(OS_DATA_PATH, PRODUCT_NAME);

  if (!PRODUCT_NAME) {
    throw new Error("Root package is missing name");
  }

  getSymlinkType = function() {
    if (os.platform() === "win32") {
      return "junction";
    } else {
      return "dir";
    }
  };

  isProduction = function() {
    return process.env.CYPRESS_ENV === "production";
  };

  module.exports = {
    ensure: function() {
      var ensure;
      ensure = (function(_this) {
        return function() {
          return _this.removeSymlink().then(function() {
            return Promise.join(fs.ensureDirAsync(_this.path()), !isProduction() ? _this.symlink() : void 0);
          });
        };
      })(this);
      return ensure()["catch"](ensure);
    },
    symlink: function() {
      var dest, src, symlinkType;
      src = path.dirname(this.path());
      dest = cwd(".cy");
      log("symlink folder from %s to %s", src, dest);
      symlinkType = getSymlinkType();
      return fs.ensureSymlinkAsync(src, dest, symlinkType);
    },
    removeSymlink: function() {
      return fs.removeAsync(cwd(".cy"))["catch"](function() {});
    },
    path: function() {
      var env, folder, p, paths;
      paths = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      env = process.env;
      la(check.unemptyString(env.CYPRESS_ENV), "expected CYPRESS_ENV, found", env.CYPRESS_ENV);
      folder = env.CYPRESS_KONFIG_ENV || env.CYPRESS_ENV;
      p = path.join.apply(path, [ELECTRON_APP_DATA_PATH, "cy", folder].concat(slice.call(paths)));
      log("path: %s", p);
      return p;
    },
    electronPartitionsPath: function() {
      return path.join(ELECTRON_APP_DATA_PATH, "Partitions");
    },
    projectsPath: function() {
      var paths;
      paths = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.path.apply(this, ["projects"].concat(slice.call(paths)));
    },
    remove: function() {
      return Promise.join(fs.removeAsync(this.path()), this.removeSymlink());
    }
  };

}).call(this);
