# 创建一个网络诊断脚本来测试端口连通性
echo "测试 LiveKit 端口连通性..."

echo "测试 HTTP API (7880):"
curl -v --connect-timeout 5 https://livekit.matrix-net.tech/ || echo "HTTP 连接失败"

echo -e "\n测试 WebRTC TCP (7881):"
nc -v -w 5 livekit.matrix-net.tech 7881 || echo "TCP 7881 连接失败"

echo -e "\n测试 WebRTC UDP (7882):"
nc -u -v -w 5 livekit.matrix-net.tech 7882 || echo "UDP 7882 连接失败"

echo -e "\n检查 DNS 解析:"
nslookup livekit.matrix-net.tech || echo "DNS 解析失败"