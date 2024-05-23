# Developing on the ispw-build GitHub action

## Setup

Before you begin changing code, you should do the following:

1. **Install NodeJS.** You can find the installer [here](https://nodejs.org/en/download/current/).
2. **Install VS Code** or another Javascript editor. VS Code is not specifically required, but it is recommended. You can find the installer [here](https://code.visualstudio.com/download).
3. **Install ncc.** ncc is used to package the action so that all of the dependencies are installed along with it. Install ncc by entering the following in your terminal: `npm i -g @vercel/ncc`
4. **Clone the git repository to your local machine.** Clone the repository from GitHub using the command `git clone https://github.com/bmc-compuware/ispw-build.git`
5. **Install all the dependencies.** From inside the ispw-build folder of the repository execute the following in the terminal: `npm install` . This will install all of the required software modules.

## Changing code

Once all the necessary setup has been completed, you are ready to begin changing code.

### Repository outline

The main script for the action is in `src/main.ts`. That is the entry point for the code to start executing, so only code called by the main script will be executed.

Once you make neccessary changes to main.ts you need to complie it and push the compiled index.js file to remote repo so you change will reflect in workflow. 

To compile src/main.ts into dist/index.js correctly make sure package.json has "build": "tsc && ncc build dist/ispw-build.js" under scripts. Do not push main.js/main.js.map to remote repo.

Utility functions are stored in the `src/utils/CommonUtils.ts` file. Also, if you add a utility function be sure to write an automated test for it, and add the test to `__test__/*.test.js`.

Keep in mind that JavaScript files do not need to be compiled before they are run.

## Publishing changes

### Adding changes to an existing tag

Adding changes to the currently-published release is acceptable as long as the changes are backward-compatible with what is already published. Publishing changed under the same version that is already released has the benefit of users getting your changes without having to manually upgrade or change their workflow script.

Steps to move the current version tag to the latest commit in the main branch:

> :warning: Proceed only if you know what you're doing. These steps need to be done quickly because once a release tag is deleted, that action will not be available to any users until the tag is recreated

(the current version in this example is 'v1')

1. `git checkout -b release/v1` - creates a new branch named "release/v1"
2. `git reset --hard origin/main` - resets the branch to be at the most recent commit on the main branch
3. `npm run build` - runs the build to package the source
4. `git add --all` - adds the packaged source to staging
5. `git commit -m "v1"` - commits the packaged source
6. `git push -f origin release/v1` - force pushes the branch to the remote
7. `git push origin :refs/tags/v1` - deletes the current 'v1' tag from the remote
8. `git tag -fa v1 -m "v1"` - adds a new 'v1' tag to the latest commit (done in step 5)
9. `git push origin v1` - pushes the new tag to the remote
10. Go to Github and publish a new release of the action, pointing to the tag you just recreated

### Creating a new tag

Publishing a new version should be done when changes are made to an action that would require a user to upgrade their version and potentially modify their workflow script. For example, if new required fields are added to the action, a new version should be published.

Steps for publishing a new version:

(in this example 'v2' is the new version)

1. `git checkout -b release/v2` - creates a new branch named "release/v2"
2. `git reset --hard origin/main` - resets the branch to be at the most recent commit on the main branch
3. `npm run build` - runs the build to package the source
4. `git add --all` - adds the packaged source to staging
5. `git commit -m "v2"` - commits the packaged source
6. `git push -f origin release/v2` - force pushes the branch to the remote
7. `git tag -fa v2 -m "v2"` - adds a new 'v2' tag to the latest commit (done in step 5)
8. `git push origin v2` - pushes the new tag to the remote

### Publishing a new release

1. Go to https://github.com/bmc-compuware/ispw-build/releases/new
2. Fill in or correct any necessary information
3. Put the tag you want to be released as a new version in the "Tag" field (example: v1) If the tag does not exist, it will be created automatically.
4. Title the release with the version number
5. Add a description for what has changed
6. Click the green Publish release button
