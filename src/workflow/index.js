const { getPrivacyLevel, storeReposLog, getUserRepoList, getOrgAllRepoList, getOrgPublicRepoList, ensureRepoFolder, updateRepo, cloneRepo, existsRepo, encryptPrivateRepos, decryptPrivateRepos } = require('../utils')
const { organizations, organizationsPublicOnly, users } = require('../config')

const repoSync = async () => {
  console.log('Repo sync has started...')
  let repos = []
  const userRepos = users.map(getUserRepoList)
  const orgRepos = organizations.map(getOrgAllRepoList)
  const orgPublicRepos = organizationsPublicOnly.map(getOrgPublicRepoList)
  const allRepos = await Promise.all([...userRepos, ...orgRepos, ...orgPublicRepos])
  repos = allRepos.flat()
  console.log(`Total Repos in scope from all organizations and users: (${repos.length})`)

  decryptPrivateRepos()

  for (let index = 0; index < repos.length; index++) {
    const repo = repos[index]
    console.log(`Current repo ${index + 1}/${repos.length} (${repo.fullName}) (${getPrivacyLevel(repo.isPrivate)})`)
    console.log(`Ensure owner folder exists for ${repo.author}`)
    ensureRepoFolder(repo)
    try {
      if (existsRepo(repo)) {
        updateRepo(repo)
      } else {
        cloneRepo(repo)
      }
    } catch (error) {
      console.log(error)
    }
    console.log('--------------------------------------')
  }

  encryptPrivateRepos()
  storeReposLog(repos)
}

module.exports = {
  repoSync
}
