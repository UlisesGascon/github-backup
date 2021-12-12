# github-backup

A simple way to backup, synchronize and encrypt repositories for multiple users and organizations

### Features

- Backup several organizations and users at the same time
- Backup all kind of repositories (public, private..)
- Update your backup by pulling latests changes (incremental backup)
- Use the Github API to auto-update the list of repos in scope
- Automatic encryption and decryption of the private repos during the sync process
- Included CRON job in case you want to do periodical backups

### How it works?

Most of the governance is made by the use of environmental varaibles. The process can be based in a CRON job or direct execution (no cron).

1. List all the repos from the organizations and users defined in the environmental varaibles by using Githup API.
2. Decrypt previous data from private repos if exists
3. Evaluate each repo in the list in order to clone as mirror (new) or pull for recent changes(incremental update)
4. Encrypt private repos as a single file by using PGP symetrical passphrase and remove private repos folder
5. Store a log with basic information about the processed Repos.

### Requirements

In order to run this application you will need to provide a [valid personal github token with `repo` level access](https://docs.github.com/es/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### Usage

#### Configuration and secrets

This are the environmental secrets that you can use:

- `GITHUB_TOKEN` (mandatory). This token is used to perform the API calls to Github and to clone/pull for private repos
- `PASSPHRASE` (optional). Only is required if you want to backup private repositories. This is the passphare used to encrypt/decrypt the private repos. Highly recommended to use a STRONG, LONG and NON-REUSED password
- `TARGET_ORGANIZATIONS` (optional) list of organizations splitted by comma in scope for backup (including private repos).
- `TARGET_PUBLIC_ORGANIZATIONS` (optional) sames as `TARGET_ORGANIZATIONS` but with public repos only as scope
- `TARGET_USERS` (optional) sames as `TARGET_ORGANIZATIONS` but for individual users
- `CRON_TIME` (optional) this must be a [cron valid pattern](https://www.freeformatter.com/cron-expression-generator-quartz.html). If this is present the execution will be always a CRON jobs based
- `CRON_TIMEZONE` (optional) this must be a valid [Timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), by default is using `Europe/Madrid`

There are two main folders to manage as well:
- `./repos` that stores all the clones of the repos (private and public)
- `./logs` that stores all the relevant info of the last batch execution

#### Example with docker compose

```yml
services:
  github-backup:
    image: ulisesgascon/github-backup:latest
    restart: unless-stopped
    environment:
      GITHUB_TOKEN: 'github_personal_token'
      PASSPHRASE: 'personal_passphrase'
      TARGET_ORGANIZATIONS: 'one_org,other_org'
      TARGET_PUBLIC_ORGANIZATIONS: 'different_org,aditional_org'
      TARGET_USERS: 'my_user,another_user'
      CRON_TIME: '* 18 * * * *'
      CRON_TIMEZONE: 'Europe/Madrid'
    volumes:
      - "./repos:/app/repos/"
      - "./logs:/app/logs/"
```

#### I don't want to use docker...

Yep, this project can be use as a regular Nodejs application, but remember to include the environmental secrets you need.
#### How to restore a repo?

You will need to access the clone and push it to a new server, like:

```bash
cd repos/public_repos/USER/REPO.git
git push --mirror git@SERVER.org:USER/REPO.git
```