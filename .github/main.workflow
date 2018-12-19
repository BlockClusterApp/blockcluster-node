workflow "New workflow" {
  on = "push"
  resolves = ["Push"]
}

action "GitHub Action for npm" {
  uses = "actions/npm@c555744"
  runs = "npm run jsdoc"
}

action "Push" {
  uses = "actions/docker/cli@76ff57a"
  needs = ["GitHub Action for npm"]
  runs = "git push origin master"
  secrets = ["GITHUB_TOKEN"]
}
