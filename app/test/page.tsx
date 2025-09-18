'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<string>('未测试');

  useEffect(() => {
    // 获取调试信息
    fetch('/api/debug')
      .then(res => res.json())
      .then(data => setDebugInfo(data))
      .catch(err => console.error('Debug API error:', err));

    // 测试 LiveKit 连接
    testLiveKitConnection();
  }, []);

  const testLiveKitConnection = async () => {
    try {
      setConnectionTest('测试中...');
      
      // 测试获取连接详情
      const response = await fetch('/api/connection-details?roomName=test&participantName=test');
      
      if (response.ok) {
        const data = await response.json();
        setConnectionTest('✅ API 连接成功');
        console.log('Connection details:', data);
      } else {
        const error = await response.text();
        setConnectionTest(`❌ API 错误: ${error}`);
      }
    } catch (error) {
      setConnectionTest(`❌ 网络错误: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>LiveKit 连接测试</h1>
      
      <h2>环境变量</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(debugInfo?.env, null, 2)}
      </pre>

      <h2>连接测试</h2>
      <p>{connectionTest}</p>

      <h2>完整调试信息</h2>
      <details>
        <summary>点击展开</summary>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>

      <h2>手动测试</h2>
      <button onClick={testLiveKitConnection} style={{ padding: '10px', marginRight: '10px' }}>
        重新测试连接
      </button>
      
      <button onClick={() => {
        window.open('https://livekit.matrix-net.tech', '_blank');
      }} style={{ padding: '10px' }}>
        直接访问 LiveKit
      </button>
    </div>
  );
}