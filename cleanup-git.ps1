# PowerShell script to clean up Git repository

Write-Host "Starting Git repository cleanup..." -ForegroundColor Green

# Make sure we're in the right directory
$repoRoot = Get-Location
Write-Host "Working in: $repoRoot" -ForegroundColor Cyan

# Create a backup branch of the current state
Write-Host "Creating backup branch..." -ForegroundColor Yellow
git branch -m backup-before-cleanup
Write-Host "Current state backed up to 'backup-before-cleanup' branch" -ForegroundColor Green

# Create a new clean branch
Write-Host "Creating new clean branch..." -ForegroundColor Yellow
git checkout --orphan clean-main
Write-Host "Created new orphan branch 'clean-main'" -ForegroundColor Green

# Remove everything from the staging area
Write-Host "Removing all files from staging area..." -ForegroundColor Yellow
git rm -rf --cached .
Write-Host "All files removed from staging area" -ForegroundColor Green

# Add .gitignore files first
Write-Host "Adding .gitignore files..." -ForegroundColor Yellow
git add .gitignore frontend/.gitignore backend/.gitignore
git commit -m "Add comprehensive .gitignore files"
Write-Host ".gitignore files committed" -ForegroundColor Green

# Now add everything else respecting the .gitignore
Write-Host "Adding all files (respecting .gitignore)..." -ForegroundColor Yellow
git add .
git commit -m "Initial commit with clean repository"
Write-Host "All files committed" -ForegroundColor Green

# Rename branch to main
Write-Host "Renaming branch to main..." -ForegroundColor Yellow
git branch -m main
Write-Host "Branch renamed to main" -ForegroundColor Green

# Force push to remote
Write-Host "Ready to push to remote. Run the following command:" -ForegroundColor Magenta
Write-Host "git push -f origin main" -ForegroundColor Cyan
Write-Host "WARNING: This will overwrite the remote repository!" -ForegroundColor Red
Write-Host "If you want to keep the remote history, you should push to a different branch instead." -ForegroundColor Yellow

Write-Host "Cleanup complete!" -ForegroundColor Green
