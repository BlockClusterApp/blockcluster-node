LAST_COMMIT_MESSAGE="$(git log --no-merges -1 --pretty=%B)"
git config --global user.email "${GITHUB_EMAIL}"
git config --global user.name "Blockcluster BOT"
git add package.json
git commit -a -m "${COMMIT_MESSAGE}" -m '[ci skip]' -n
git tag -a "${COMMIT_MESSAGE}" -m "${LAST_COMMIT_MESSAGE}" -m "" -m "[ci skip]"
git remote remove origin
git remote add origin https://${GITHUB_TOKEN}@github.com/BlockClusterApp/blockcluster-node.git
