# AnythingLLM 安装器（中国镜像版）
$url = "https://mirror.ghproxy.com/https://github.com/Mintplex-Labs/anything-llm/releases/latest/download/AnythingLLMDesktop.exe"
$out = "$env:TEMP\AnythingLLMDesktop.exe"
Write-Host "正在下载 AnythingLLM（使用国内加速）..."
Invoke-WebRequest -Uri $url -OutFile $out
Start-Process -FilePath $out -Wait
Remove-Item $out -Force
Write-Host "AnythingLLM 安装完成！"
Write-Host "支持本地模型（Ollama），无需科学上网"
