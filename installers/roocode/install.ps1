# Roo Code Installer
$url = "https://github.com/RooCodeInc/Roo-Code/releases/latest/download/Roo-Code-win32-x64.exe"
$out = "$env:TEMP\roocode-installer.exe"
Invoke-WebRequest -Uri $url -OutFile $out
Start-Process -FilePath $out -Wait
Remove-Item $out -Force
Write-Host "Roo Code installed!"
