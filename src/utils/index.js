const https = require('https')
const { existsSync, mkdirSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')
const { githubToken, paths, passphrase } = require('../config')

const getPrivacyLevel = isPrivate => isPrivate ? 'private' : 'public'

const decryptPrivateRepos = () => {
  console.log('Decrypting has started...')
  if (!existsSync(paths.privateReposEncryptFile)) {
    console.log('Nothing to decrypt. Aborting the decrypting process...')
    return
  }
  mkdirSync(paths.privateRepos)
  execSync(`gpgtar --decrypt  --gpg-args "--passphrase=${passphrase} --batch" --directory ${process.cwd()} ${paths.privateReposEncryptFile}`)
  execSync(`rm -rf ${paths.privateReposEncryptFile}`)
}
const encryptPrivateRepos = () => {
  if (!existsSync(paths.privateRepos)) {
    console.log('Nothing to encrypt. Aborting encryption...')
    return
  }
  execSync(`gpgtar --encrypt --symmetric --output ${paths.privateReposEncryptFile} --gpg-args="--passphrase=${passphrase} --batch" repos/private_repos`)
  execSync(`rm -rf ${paths.privateRepos}`)
}

const ensureRepoFolder = (repo) => {
  const dir = `${paths[getPrivacyLevel(repo.isPrivate) + 'Repos']}/${repo.author}`
  console.log('target dir:', dir)
  if (!existsSync(dir)) {
    console.log(`Creating folder ${dir}`)
    mkdirSync(dir, { recursive: true })
  }
}

const httpRequest = options => new Promise((resolve, reject) => {
  https.get(options, (resp) => {
    let data = ''

    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      resolve(JSON.parse(data))
    })
  }).on('error', reject)
})

const getRepoList = (entityType, repoType = 'all') => async username => {
  console.log(`Generating the repos list in scope for (${username}) (${entityType})`)
  let pendingPages = true
  let currentPage = 1
  let allData = []

  while (pendingPages) {
    const data = await httpRequest({
      host: 'api.github.com',
      path: `/${entityType}/${username}/repos?per_page=100&page=${currentPage}&type=${repoType}`,
      headers: {
        Authorization: `token ${githubToken}`,
        'User-Agent': 'testing'
      }
    })
    if (!data.length) {
      pendingPages = false
      break
    }
    allData = allData.concat(data.map(({ private: isPrivate, full_name: fullName, clone_url: url, owner, name }) => {
      return {
        fullName,
        author: owner.login,
        name,
        isPrivate,
        url
      }
    }))
    currentPage++
  }
  console.log(`Total Repos (${allData.length}) in scope for (${username})`)
  return allData
}

const getUserRepoList = getRepoList('users')
const getOrgAllRepoList = getRepoList('orgs', 'all')
const getOrgPublicRepoList = getRepoList('orgs', 'public')

const storeReposLog = repos => {
  console.log('Storing Repos logs in disk...')
  writeFileSync(`${paths.logs}/repos.json`, JSON.stringify(repos, null, 4))
}

module.exports = {
  getPrivacyLevel,
  getUserRepoList,
  getOrgPublicRepoList,
  getOrgAllRepoList,
  ensureRepoFolder,
  storeReposLog,
  encryptPrivateRepos,
  decryptPrivateRepos,
  existsRepo: repo => {
    return existsSync(`${paths[getPrivacyLevel(repo.isPrivate) + 'Repos']}/${repo.fullName}.git`)
  },
  cloneRepo: repo => {
    console.log('Cloning the repo for the first time...')
    if (repo.isPrivate) {
      return execSync(`cd ${paths.privateRepos}/${repo.author} && git clone --mirror https://${githubToken}@github.com/${repo.fullName}`, { stdio: 'inherit' })
    }
    return execSync(`cd ${paths.publicRepos}/${repo.author} && git clone --mirror ${repo.url}`, { stdio: 'inherit' })
  },
  updateRepo: repo => {
    console.log('Updating the repo...')
    return execSync(`cd ${paths[getPrivacyLevel(repo.isPrivate) + 'Repos']}/${repo.fullName}.git && git remote update --prune`, { stdio: 'inherit' })
  }

}
