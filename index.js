const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const linkRegExInput = core.getInput("link-regex");
    const linkRegExp = new RegExp(linkRegExInput);

    // These inputs are always strings
    const isDebug = core.getInput("debug").toLowerCase() === "true";

    //matching in pr comments OR body of pr
    let matchedStrings = [];

    core.info(`Checking for links matching: ${linkRegExInput}!`);

    const token = core.getInput("repo-token");
    const octokit = new github.GitHub(token);
    const payload = github.context.payload;

    // personal repos have no org - allow for those as well as team ones
    const owner = (payload.organization || payload.repository.owner).login;
    const repo = payload.repository.name;

    // issue events (like create comment) supply #issue instead of #pull_request - handle both
    const issue_number = (payload.pull_request || payload.issue).number;

    const issuesArgs = { owner, repo, issue_number };

    const pull = await octokit.issues.get(issuesArgs);
    isDebug && console.log(`PR Body: \n${pull.data.body}\n`);

    const bodyMatches = linkRegExp.exec(pull.data.body);
    if (bodyMatches) {
      matchedStrings.push(bodyMatches[0]);
    }

    const includeComments =
      core.getInput("include-comments").toLowerCase() === "true";
    if (includeComments && matchedStrings.length < 1) {
      const prComments = await octokit.issues.listComments(issuesArgs);

      const commentsWithLinks = prComments.data.reduce((acc, curr) => {
        const matches = linkRegExp.exec(curr.body);
        if (matches) acc.push(matches[0]);
        return acc;
      }, []);

      matchedStrings = matchedStrings.concat(commentsWithLinks);

      isDebug && console.log("PR Comments:\n");
      isDebug && console.log(prComments.data.map((i) => i.body));
    }

    isDebug && console.log("matches:");
    isDebug && console.log(matchedStrings);

    const successMessage = core.getInput("success-message");
    core.setOutput("msg", successMessage);

    if (matchedStrings.length === 0) {
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
