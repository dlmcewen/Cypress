(function() {
  var CI_PROVIDERS, _, _detectProviderName, _get, _providerCiParams, _providerCommitParams, check, ciParams, commitDefaults, commitParams, detectableCiBuildIdProviders, extract, isCodeship, isGitlab, isJenkins, isWercker, join, la, list, omitUndefined, provider, toCamelObject,
    slice = [].slice;

  _ = require("lodash");

  la = require("lazy-ass");

  check = require("check-more-types");

  join = function() {
    var char, pieces;
    char = arguments[0], pieces = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return _.chain(pieces).compact().join(char).value();
  };

  toCamelObject = function(obj, key) {
    return _.set(obj, _.camelCase(key), process.env[key]);
  };

  extract = function(envKeys) {
    return _.transform(envKeys, toCamelObject, {});
  };

  isCodeship = function() {
    return process.env.CI_NAME && process.env.CI_NAME === "codeship";
  };

  isGitlab = function() {
    return process.env.GITLAB_CI || (process.env.CI_SERVER_NAME && process.env.CI_SERVER_NAME === "GitLab CI");
  };

  isJenkins = function() {
    return process.env.JENKINS_URL || process.env.JENKINS_HOME || process.env.JENKINS_VERSION || process.env.HUDSON_URL || process.env.HUDSON_HOME;
  };

  isWercker = function() {
    return process.env.WERCKER || process.env.WERCKER_MAIN_PIPELINE_STARTED;
  };

  CI_PROVIDERS = {
    "appveyor": "APPVEYOR",
    "bamboo": "bamboo.buildNumber",
    "buildkite": "BUILDKITE",
    "circle": "CIRCLECI",
    "codeship": isCodeship,
    "drone": "DRONE",
    "gitlab": isGitlab,
    "jenkins": isJenkins,
    "semaphore": "SEMAPHORE",
    "shippable": "SHIPPABLE",
    "snap": "SNAP_CI",
    "teamcity": "TEAMCITY_VERSION",
    "teamfoundation": "TF_BUILD",
    "travis": "TRAVIS",
    "wercker": isWercker
  };

  _detectProviderName = function() {
    var env;
    env = process.env;
    return _.findKey(CI_PROVIDERS, function(value, key) {
      switch (false) {
        case !_.isString(value):
          return env[value];
        case !_.isFunction(value):
          return value();
      }
    });
  };

  _providerCiParams = function() {
    return {
      appveyor: extract(["APPVEYOR_JOB_ID", "APPVEYOR_ACCOUNT_NAME", "APPVEYOR_PROJECT_SLUG", "APPVEYOR_BUILD_NUMBER", "APPVEYOR_BUILD_VERSION", "APPVEYOR_PULL_REQUEST_NUMBER", "APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH"]),
      bamboo: extract(["bamboo.resultsUrl", "bamboo.buildNumber", "bamboo.buildResultsUrl", "bamboo.planRepository.repositoryUrl"]),
      buildkite: extract(["BUILDKITE_REPO", "BUILDKITE_SOURCE", "BUILDKITE_JOB_ID", "BUILDKITE_BUILD_ID", "BUILDKITE_BUILD_URL", "BUILDKITE_BUILD_NUMBER", "BUILDKITE_PULL_REQUEST", "BUILDKITE_PULL_REQUEST_REPO", "BUILDKITE_PULL_REQUEST_BASE_BRANCH"]),
      circle: extract(["CIRCLE_JOB", "CIRCLE_BUILD_NUM", "CIRCLE_BUILD_URL", "CIRCLE_PR_NUMBER", "CIRCLE_PR_REPONAME", "CIRCLE_PR_USERNAME", "CIRCLE_COMPARE_URL", "CIRCLE_WORKFLOW_ID", "CIRCLE_PULL_REQUEST", "CIRCLE_REPOSITORY_URL", "CI_PULL_REQUEST"]),
      codeship: extract(["CI_BUILD_ID", "CI_REPO_NAME", "CI_BUILD_URL", "CI_PROJECT_ID", "CI_BUILD_NUMBER", "CI_PULL_REQUEST"]),
      drone: extract(["DRONE_JOB_NUMBER", "DRONE_BUILD_LINK", "DRONE_BUILD_NUMBER", "DRONE_PULL_REQUEST"]),
      gitlab: extract(["CI_JOB_ID", "CI_JOB_URL", "CI_BUILD_ID", "GITLAB_HOST", "CI_PROJECT_ID", "CI_PROJECT_URL", "CI_REPOSITORY_URL", "CI_ENVIRONMENT_URL"]),
      jenkins: extract(["BUILD_ID", "BUILD_URL", "BUILD_NUMBER", "ghprbPullId"]),
      semaphore: extract(["SEMAPHORE_REPO_SLUG", "SEMAPHORE_BUILD_NUMBER", "SEMAPHORE_PROJECT_NAME", "SEMAPHORE_TRIGGER_SOURCE", "PULL_REQUEST_NUMBER"]),
      shippable: extract(["JOB_ID", "BUILD_URL", "PROJECT_ID", "JOB_NUMBER", "COMPARE_URL", "BASE_BRANCH", "BUILD_NUMBER", "PULL_REQUEST", "REPOSITORY_URL", "PULL_REQUEST_BASE_BRANCH", "PULL_REQUEST_REPO_FULL_NAME"]),
      snap: null,
      teamcity: null,
      teamfoundation: null,
      travis: extract(["TRAVIS_JOB_ID", "TRAVIS_BUILD_ID", "TRAVIS_REPO_SLUG", "TRAVIS_JOB_NUMBER", "TRAVIS_EVENT_TYPE", "TRAVIS_COMMIT_RANGE", "TRAVIS_BUILD_NUMBER", "TRAVIS_PULL_REQUEST", "TRAVIS_PULL_REQUEST_BRANCH"]),
      wercker: null
    };
  };

  _providerCommitParams = function() {
    var env;
    env = process.env;
    return {
      appveyor: {
        sha: env.APPVEYOR_REPO_COMMIT,
        branch: env.APPVEYOR_REPO_BRANCH,
        message: join('\n', env.APPVEYOR_REPO_COMMIT_MESSAGE, env.APPVEYOR_REPO_COMMIT_MESSAGE_EXTENDED),
        authorName: env.APPVEYOR_REPO_COMMIT_AUTHOR,
        authorEmail: env.APPVEYOR_REPO_COMMIT_AUTHOR_EMAIL
      },
      bamboo: {
        branch: env["bamboo.planRepository.branch"]
      },
      buildkite: {
        sha: env.BUILDKITE_COMMIT,
        branch: env.BUILDKITE_BRANCH,
        message: env.BUILDKITE_MESSAGE,
        authorName: env.BUILDKITE_BUILD_CREATOR,
        authorEmail: env.BUILDKITE_BUILD_CREATOR_EMAIL,
        remoteOrigin: env.BUILDKITE_REPO,
        defaultBranch: env.BUILDKITE_PIPELINE_DEFAULT_BRANCH
      },
      circle: {
        sha: env.CIRCLE_SHA1,
        branch: env.CIRCLE_BRANCH,
        authorName: env.CIRCLE_USERNAME
      },
      codeship: {
        sha: env.CI_COMMIT_ID,
        branch: env.CI_BRANCH,
        message: env.CI_COMMIT_MESSAGE,
        authorName: env.CI_COMMITTER_NAME,
        authorEmail: env.CI_COMMITTER_EMAIL
      },
      drone: {
        sha: env.DRONE_COMMIT_SHA,
        branch: env.DRONE_COMMIT_BRANCH,
        message: env.DRONE_COMMIT_MESSAGE,
        authorName: env.DRONE_COMMIT_AUTHOR,
        authorEmail: env.DRONE_COMMIT_AUTHOR_EMAIL,
        defaultBranch: env.DRONE_REPO_BRANCH
      },
      gitlab: {
        sha: env.CI_COMMIT_SHA,
        branch: env.CI_COMMIT_REF_NAME,
        message: env.CI_COMMIT_MESSAGE,
        authorName: env.GITLAB_USER_NAME,
        authorEmail: env.GITLAB_USER_EMAIL
      },
      jenkins: {
        sha: env.GIT_COMMIT,
        branch: env.GIT_BRANCH
      },
      semaphore: {
        sha: env.REVISION,
        branch: env.BRANCH_NAME
      },
      shippable: {
        sha: env.COMMIT,
        branch: env.BRANCH,
        message: env.COMMIT_MESSAGE,
        authorName: env.COMMITTER
      },
      snap: null,
      teamcity: null,
      teamfoundation: null,
      travis: {
        sha: env.TRAVIS_COMMIT,
        branch: env.TRAVIS_PULL_REQUEST_BRANCH || env.TRAVIS_BRANCH,
        message: env.TRAVIS_COMMIT_MESSAGE
      },
      wercker: null
    };
  };

  provider = function() {
    var ref;
    return (ref = _detectProviderName()) != null ? ref : null;
  };

  omitUndefined = function(ret) {
    if (_.isObject(ret)) {
      return _.omitBy(ret, _.isUndefined);
    }
  };

  _get = function(fn) {
    return _.chain(fn()).get(provider()).thru(omitUndefined).defaultTo(null).value();
  };

  ciParams = function() {
    return _get(_providerCiParams);
  };

  commitParams = function() {
    return _get(_providerCommitParams);
  };

  commitDefaults = function(existingInfo) {
    var commitParamsObj;
    commitParamsObj = commitParams() || {};
    return _.transform(existingInfo, function(memo, value, key) {
      return memo[key] = _.defaultTo(value != null ? value : commitParamsObj[key], null);
    });
  };

  list = function() {
    return _.keys(CI_PROVIDERS);
  };

  detectableCiBuildIdProviders = function() {
    return _.chain(_providerCiParams()).omitBy(_.isNull).keys().value();
  };

  module.exports = {
    list: list,
    provider: provider,
    ciParams: ciParams,
    commitParams: commitParams,
    commitDefaults: commitDefaults,
    detectableCiBuildIdProviders: detectableCiBuildIdProviders
  };

}).call(this);
