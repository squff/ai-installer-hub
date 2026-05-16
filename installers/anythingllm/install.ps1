# AnythingLLM Installer
$url = "https://s3.us-west-1.amazonaws.com/public.useanything.com/latest/AnythingLLMDesktop.exe"
$out = "$env:TEMP\AnythingLLMDesktop.exe"
Invoke-WebRequest -Uri $url -OutFile $out
Start-Process -FilePath $out -Wait
Remove-Item $out -Force
Write-Host "AnythingLLM installed!"
