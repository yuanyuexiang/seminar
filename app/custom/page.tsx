import { videoCodecs } from 'livekit-client';
import { VideoConferenceClientImpl } from './VideoConferenceClientImpl';
import { isVideoCodec } from '@/lib/types';

export default async function CustomRoomConnection(props: {
  searchParams: Promise<{
    liveKitUrl?: string;
    token?: string;
    codec?: string;
  }>;
}) {
  const { liveKitUrl, token, codec } = await props.searchParams;
  if (typeof liveKitUrl !== 'string') {
    return <h2>缺少 LiveKit URL</h2>;
  }
  if (typeof token !== 'string') {
    return <h2>缺少 LiveKit token</h2>;
  }
  if (codec !== undefined && !isVideoCodec(codec)) {
    return <h2>无效的编解码器，如果定义的话必须是 [{videoCodecs.join(', ')}] 中的一个。</h2>;
  }

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      <VideoConferenceClientImpl liveKitUrl={liveKitUrl} token={token} codec={codec} />
    </main>
  );
}
