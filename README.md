# pr-check-action

🚨: This is a **public repository** - don’t ever put private stuff in here

An action to validate that PR's contain a link to a change request. Originally duplicated from [delivered/trello-github-action](https://github.com/delivered/trello-github-action).

# Usage

Add a new workflow in your repo that runs this action. Here's an example:

```yml
name: Require PR links to change request

# Controls when the action will run.
on:
  # Triggers the workflow on pull request events but only for the main branch
  pull_request:
    branches: [main]

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "check-pr"
  check-pr:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # You may want to ignore some users like dependabot
    if: github.actor != 'dependabot[bot]'

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      - name: Confirm link to change request included in PR
        uses: aminohealth/pr-check-action@master
```

## Parameters

### Inputs

- `link-regex`: A regex that matches your expected change request urls
  - default: '(https:\/\/(?:www.)?(?:pivotaltracker\.com|sentry\.io))'
- `success-message`: The message set on success
  - default: "Found a change request link"
- `failure-message`: The message set on failure
  - default: "Unable to find a change request link matching {link-regex}"
- `debug`: If true, prints debug info while running
  - default: false

### Outputs

- `msg`: Will be set to the value of `success-message` if the action is successful
