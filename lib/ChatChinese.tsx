import { type ChatMessage, type ChatOptions } from '@livekit/components-core';
import * as React from 'react';
import { 
  useMaybeLayoutContext, 
  ChatEntry, 
  useChat, 
  ChatToggle 
} from '@livekit/components-react';
import type { MessageFormatter } from '@livekit/components-react';

// 使用 LiveKit 的内部 ChatCloseIcon 组件的简化版本
function ChatCloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12.688 4.226a.938.938 0 0 0-1.326-1.325L8 6.264 4.638 2.901a.938.938 0 0 0-1.326 1.325L6.675 7.59 3.312 10.95a.938.938 0 0 0 1.326 1.325L8 8.912l3.362 3.363a.938.938 0 1 0 1.326-1.325L9.325 7.59l3.363-3.364Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export interface ChatChineseProps extends React.HTMLAttributes<HTMLDivElement>, ChatOptions {
  messageFormatter?: MessageFormatter;
}

/**
 * 中文本地化的聊天组件
 * 基于 LiveKit Chat 组件，添加了中文界面支持
 */
export function ChatChinese({
  messageFormatter,
  messageDecoder,
  messageEncoder,
  channelTopic,
  ...props
}: ChatChineseProps) {
  const ulRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const chatOptions: ChatOptions = React.useMemo(() => {
    return { messageDecoder, messageEncoder, channelTopic };
  }, [messageDecoder, messageEncoder, channelTopic]);

  const { chatMessages, send, isSending } = useChat(chatOptions);

  const layoutContext = useMaybeLayoutContext();
  const lastReadMsgAt = React.useRef<ChatMessage['timestamp']>(0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (inputRef.current && inputRef.current.value.trim() !== '') {
      await send(inputRef.current.value);
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  }

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [ulRef, chatMessages]);

  React.useEffect(() => {
    if (!layoutContext || chatMessages.length === 0) {
      return;
    }

    if (
      layoutContext.widget.state?.showChat &&
      chatMessages.length > 0 &&
      lastReadMsgAt.current !== chatMessages[chatMessages.length - 1]?.timestamp
    ) {
      lastReadMsgAt.current = chatMessages[chatMessages.length - 1]?.timestamp;
      return;
    }

    const unreadMessageCount = chatMessages.filter(
      (msg) => !lastReadMsgAt.current || msg.timestamp > lastReadMsgAt.current,
    ).length;

    const { dispatch } = layoutContext.widget;
    if (dispatch) {
      dispatch({ msg: 'unread_msg', count: unreadMessageCount });
    }
  }, [chatMessages, layoutContext?.widget]);

  return (
    <div {...props} className="lk-chat">
      <div className="lk-chat-header">
        {layoutContext && (
          <ChatToggle className="lk-close-button">
            <ChatCloseIcon />
          </ChatToggle>
        )}
      </div>

      <ul className="lk-list lk-chat-messages" ref={ulRef}>
        {chatMessages.map((msg, idx, allMsg) => {
          const hideName = idx >= 1 && allMsg[idx - 1].from === msg.from;
          // If the time delta between two messages is bigger than 60s show timestamp.
          const hideTimestamp = idx >= 1 && msg.timestamp - allMsg[idx - 1].timestamp < 60_000;

          return (
            <ChatEntry
              key={msg.id ?? idx}
              hideName={hideName}
              hideTimestamp={hideName === false ? false : hideTimestamp} // If we show the name always show the timestamp as well.
              entry={msg}
              messageFormatter={messageFormatter}
            />
          );
        })}
      </ul>
      <form className="lk-chat-form" onSubmit={handleSubmit}>
        <input
          className="lk-form-control lk-chat-form-input"
          disabled={isSending}
          ref={inputRef}
          type="text"
          placeholder="请输入消息..."
          onInput={(ev) => ev.stopPropagation()}
          onKeyDown={(ev) => ev.stopPropagation()}
          onKeyUp={(ev) => ev.stopPropagation()}
        />
        <button type="submit" className="lk-button lk-chat-form-button" disabled={isSending}>
          发送
        </button>
      </form>
    </div>
  );
}