# Roo Code 安装器（中国镜像版）
$url = "https://mirror.ghproxy.com/https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-win32-x64.exe"
$out = "$env:TEMP\roocode-installer.exe"
Invoke-WebRequest -Uri $url -OutFile $out
Start-Process -FilePath $out -Wait
Remove-Item $out -Force
Write-Host "Roo Code 安装完成！"
