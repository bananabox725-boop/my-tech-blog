# 1. 설정 (본인의 환경에 맞게 수정하세요)
$ProjectRoot = "C:\Users\silwel\Documents\blog-app"
$GDrivePath = "G:\내 드라이브\Blog_Backups"  # 구글 드라이브 내 백업 폴더 경로
$BackupName = "blog_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

# 2. 백업 폴더가 없으면 생성
if (!(Test-Path $GDrivePath)) {
    New-Item -ItemType Directory -Path $GDrivePath
}

# 3. 임시 폴더로 소스 복사 (node_modules, dist 제외)
$TempBackupPath = "$env:TEMP\blog_backup_temp"
if (Test-Path $TempBackupPath) { Remove-Item -Recurse -Force $TempBackupPath }
New-Item -ItemType Directory -Path $TempBackupPath

Write-Host "파일 복사 중..." -ForegroundColor Cyan
Copy-Item -Path "$ProjectRoot\src", "$ProjectRoot\public", "$ProjectRoot\package.json", "$ProjectRoot\tsconfig*.json", "$ProjectRoot\vite.config.ts", "$ProjectRoot\index.html", "$ProjectRoot\.gitignore" -Destination $TempBackupPath -Recurse -Force

# 4. 압축 및 구글 드라이브로 복사
Write-Host "압축 및 구글 드라이브로 전송 중..." -ForegroundColor Cyan
Compress-Archive -Path "$TempBackupPath\*" -DestinationPath "$GDrivePath\$BackupName" -Force

# 5. 임시 폴더 삭제
Remove-Item -Recurse -Force $TempBackupPath

Write-Host "백업 완료: $GDrivePath\$BackupName" -ForegroundColor Green
