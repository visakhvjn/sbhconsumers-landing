import { Fragment } from "react";
import type { Block } from "@/lib/chat-schema";

function Rich({ text }: { text: string }) {
  return text.split("**").map((seg, i) =>
    !seg ? null : i % 2 ? <strong key={i}>{seg}</strong> : <Fragment key={i}>{seg}</Fragment>,
  );
}

type Props = {
  blocks: Block[];
  chipsDisabled: boolean;
  onChip: (say: string, label: string) => void;
};

export default function BotBlocks({ blocks, chipsDisabled, onChip }: Props) {
  return blocks.map((b, i) => {
    switch (b.t) {
      case "p":
        return (
          <p key={i}>
            <Rich text={b.x} />
          </p>
        );
      case "note":
        return (
          <p key={i} className="note">
            <Rich text={b.x} />
          </p>
        );
      case "ul":
      case "ol": {
        const List = b.t;
        return (
          <List key={i}>
            {b.i.map((s, j) => (
              <li key={j}>
                <Rich text={s} />
              </li>
            ))}
          </List>
        );
      }
      case "routine":
        return (
          <div key={i} className="routine">
            {(
              [
                ["am", "AM", b.am],
                ["pm", "PM", b.pm],
              ] as const
            ).map(([cls, label, steps]) => (
              <div key={cls} className={cls}>
                <h4>{label}</h4>
                <ol>
                  {steps.map((s, j) => (
                    <li key={j}>
                      <Rich text={s} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        );
      case "tags":
        return (
          <div key={i} className="tags">
            {b.i.map((s, j) => (
              <span key={j}>{s}</span>
            ))}
          </div>
        );
      case "links":
        return (
          <div key={i} className="links">
            {b.l.map((x) => (
              <a key={x.href} href={x.href} target="_blank" rel="noopener noreferrer">
                {x.label} ↗
              </a>
            ))}
          </div>
        );
      case "chips":
        return (
          <div key={i} className="chips">
            {b.o.map((o, j) => (
              <button
                key={j}
                type="button"
                disabled={chipsDisabled}
                onClick={() => onChip(o.say, o.label)}
              >
                {o.label}
              </button>
            ))}
          </div>
        );
    }
  });
}
