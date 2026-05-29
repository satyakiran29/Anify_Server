import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

let isSyncing = false;
let pendingSync = null;

/**
 * Build a stable raw.githubusercontent.com URL for a file in public/uploads.
 * Uses the branch name (e.g. "main") so the URL never breaks after new commits.
 *
 * @param {string} relativePath  e.g. "/uploads/wallpaper-123.jpg"
 * @returns {string}             Full raw GitHub URL, or the original path if env vars are not set.
 */
export function getRawGithubUrl(relativePath) {
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!repo || !relativePath) return relativePath;
  // relativePath is like "/uploads/foo.jpg" → stored at public/uploads/foo.jpg in the repo
  const repoPath = `public${relativePath}`;
  return `https://raw.githubusercontent.com/${repo}/${branch}/${repoPath}`;
}

/**
 * Configure local git username/email if not already configured (required for commit in clean/docker environments)
 */
async function ensureGitConfig() {
  try {
    try {
      const { stdout: name } = await execPromise('git config user.name');
      if (name.trim()) return;
    } catch {
      // If git config fails or is empty, we set local config
    }

    console.log('[GitSync] Git user info not configured. Setting temporary auto-sync user details...');
    await execPromise('git config --local user.name "Anify Server Auto-Sync"');
    await execPromise('git config --local user.email "auto-sync@anify.internal"');
  } catch (err) {
    console.error('[GitSync] Failed to ensure local Git user config:', err.message);
  }
}

/**
 * Trigger an asynchronous Git sync (add, commit, push) for databases and uploads.
 * Serialized in-memory to prevent concurrency issues with git lock.
 * 
 * @param {string} commitMessage The message for the commit
 */
export async function triggerGitSync(commitMessage) {
  if (process.env.AUTO_GIT_SYNC !== 'true') {
    return;
  }

  // If already syncing, queue this message as the next sync
  if (isSyncing) {
    pendingSync = commitMessage || 'Admin: Auto-sync resources';
    console.log(`[GitSync] Sync in progress. Queued pending commit: "${pendingSync}"`);
    return;
  }

  isSyncing = true;
  const msg = commitMessage || 'Admin: Auto-sync resources';

  try {
    console.log(`[GitSync] Starting Git sync operation...`);
    
    // Ensure we have user config set up so commit doesn't fail
    await ensureGitConfig();

    // Determine target remote, repository, and branch
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'satyakiran29/Anify_Server';
    const branch = process.env.GITHUB_BRANCH || 'main';
    const remoteUrl = token ? `https://${token}@github.com/${repo}.git` : 'origin';

    // Fetch remote branch to integrate any upstream changes (e.g. code modifications, remote edits)
    console.log(`[GitSync] Fetching latest changes from remote branch: "${branch}"...`);
    await execPromise(`git fetch "${remoteUrl}" ${branch}`);

    // Soft-reset local HEAD to the fetched remote state (keeps local changes in working directory)
    console.log(`[GitSync] Resetting local HEAD to FETCH_HEAD to align with remote...`);
    await execPromise('git reset FETCH_HEAD');

    // Stage database JSON files and uploads directory
    await execPromise('git add wallpapers.json livewalls.json ringtones.json public/uploads');

    // Check if there are staged changes to commit
    const { stdout: statusOut } = await execPromise('git diff --name-only --cached');
    if (!statusOut.trim()) {
      console.log('[GitSync] No changes to commit after alignment.');
      isSyncing = false;
      checkPending();
      return;
    }

    // Commit changes
    await execPromise(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
    console.log(`[GitSync] Committed locally with message: "${msg}"`);

    // Push changes back to the remote branch
    console.log(`[GitSync] Pushing changes back to remote branch: "${branch}"...`);
    await execPromise(`git push "${remoteUrl}" HEAD:refs/heads/${branch}`);
    console.log(`[GitSync] Successfully pushed changes to GitHub!`);
  } catch (error) {
    console.error(`[GitSync] Git sync failed:`, error.message);
  } finally {
    isSyncing = false;
    checkPending();
  }
}

function checkPending() {
  if (pendingSync) {
    const nextMsg = pendingSync;
    pendingSync = null;
    triggerGitSync(nextMsg);
  }
}
