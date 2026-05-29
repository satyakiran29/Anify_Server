import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

let isSyncing = false;
let pendingSync = null;

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

    // Stage database JSON files and uploads directory
    await execPromise('git add wallpapers.json livewalls.json ringtones.json public/uploads');

    // Check if there are staged changes to commit
    const { stdout: statusOut } = await execPromise('git diff --name-only --cached');
    if (!statusOut.trim()) {
      console.log('[GitSync] No changes to commit.');
      isSyncing = false;
      checkPending();
      return;
    }

    // Commit changes
    await execPromise(`git commit -m "${msg.replace(/"/g, '\\"')}"`);
    console.log(`[GitSync] Committed locally with message: "${msg}"`);

    // Determine push command
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO || 'satyakiran29/Anify_Server';

    if (token) {
      console.log(`[GitSync] Pushing to remote repository using GITHUB_TOKEN authentication...`);
      const pushUrl = `https://${token}@github.com/${repo}.git`;
      await execPromise(`git push "${pushUrl}" HEAD`);
    } else {
      console.log(`[GitSync] Pushing to remote repository using default credentials...`);
      await execPromise('git push');
    }
    
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
