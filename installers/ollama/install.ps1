# Ollama 安装器（中国镜像版）
$url = "https://mirror.ghproxy.com/https://github.com/ollama/ollama/releases/latest/download/OllamaSetup.exe"
$out = "$env:TEMP\OllamaSetup.exe"
Write-Host "正在下载 Ollama（使用国内加速）..."
Invoke-WebRequest -Uri $url -OutFile $out
Start-Process -FilePath $out -Wait
Remove-Item $out -Force
Write-Host "Ollama 安装完成！"
Write-Host "推荐模型: ollama pull qwen2.5:7b（通义千问）"
