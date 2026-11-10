import ReactMarkdown from 'react-markdown';
import ToolCallChip from '@/components/coach/ToolCallChip';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          isUser
            ? 'max-w-[86%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13px] leading-relaxed text-primary-foreground'
            : 'max-w-[94%] rounded-2xl rounded-bl-md border border-border/70 bg-card px-4 py-3'
        }
      >
        {message.content &&
          (isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="text-[13px] leading-relaxed text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_h1]:mb-1.5 [&_h1]:font-heading [&_h1]:text-[17px] [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:font-heading [&_h2]:text-[15px] [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-[13.5px] [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-1.5 [&_strong]:font-semibold [&_table]:my-2 [&_table]:w-full [&_table]:text-[12px] [&_td]:border-b [&_td]:border-border/60 [&_td]:py-1 [&_td]:pr-2 [&_th]:border-b [&_th]:border-border [&_th]:py-1 [&_th]:text-left [&_th]:font-medium [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_hr]:my-3 [&_hr]:border-border/60">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}

        {message.tool_calls?.map((toolCall, idx) => (
          <ToolCallChip key={idx} toolCall={toolCall} />
        ))}
      </div>
    </div>
  );
}