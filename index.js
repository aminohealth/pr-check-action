const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const linkRegExInput = core.getInput("link-regex");
    const linkRegExp = new RegExp(linkRegExInput);

    // These inputs are always strings
    const isDebug = core.getInput("debug").toLowerCase() === "true";

    core.info(`Checking for links matching: ${linkRegExInput}!`);

    // Get the PR body from the payload
    const payload = github.context.payload;
    isDebug && console.log("Payload:", payload);

    if (!(payload && payload.pull_request)) {
      core.setFailed(
        "The payload doesn't appear to be a pull request. Make sure you're only running this action on pull_request."
      );
    }

    const body = payload.pull_request.body || "";
    isDebug && console.log(`PR Body: \n${body}\n`);

    const matchFound = linkRegExp.test(body);

    if (matchFound) {
      const successMessage = core.getInput("success-message");
      core.setOutput("msg", successMessage);
    } else {
      const failureMessage = core
        .getInput("failure-message")
        .replace("{link-regex}", linkRegExInput);
      core.setFailed(failureMessage);
    }
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
}

run();
