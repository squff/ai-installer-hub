# Ollama Installer
$url = "https://ollama.com/download/OllamaSetup.exe"
$out = "$env:TEMP\OllamaSetup.exe"
Invoke-WebRequest -Uri $url -OutFile $out
Start-Process -FilePath $out -Wait
Remove-Item $out -Force
Write-Host "Ollama installed! Run 'ollama run llama3.2' to start."
